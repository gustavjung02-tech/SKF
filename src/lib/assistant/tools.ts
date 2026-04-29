import {
  detectHighRiskConfusion,
  filterAllowedBrands,
  getConfusionWarning,
  getMissingFieldsForGroup,
  inferProductGroup,
  resolveSlang,
  searchByApplication,
  searchByDimensions,
  searchByNormalizedCode,
  searchEquivalent,
  searchExactCode,
} from "@/lib/assistant/catalog";
import brandWhitelistData from "@/data/catalog/brand-whitelist.json";

type ToolArguments = Record<string, unknown>;

type ToolResultItem = {
  id: string;
  product_group: string;
  exact_code: string;
  brand: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  caution: string;
  manual_confirmation_required: boolean;
  high_risk_confusion: boolean;
};

const allowedBrands = new Set(brandWhitelistData.brand_whitelist.map((brand) => brand.toUpperCase()));

export const assistantToolDefinitions = [
  {
    type: "function",
    name: "search_exact_code",
    description: "Find items by exact code or normalized code from internal catalog.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "search_by_dimensions",
    description: "Find items by dimensions or product-group specific fields.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        product_group: { type: ["string", "null"] },
        id: { type: ["number", "null"] },
        od: { type: ["number", "null"] },
        width: { type: ["number", "null"] },
        thickness: { type: ["number", "null"] },
        shaft_diameter: { type: ["number", "null"] },
        pitch: { type: ["number", "null"] },
        links: { type: ["number", "null"] },
        profile: { type: ["string", "null"] },
        length: { type: ["number", "null"] },
        housing_type: { type: ["string", "null"] },
        chain_type: { type: ["string", "null"] },
        application: { type: ["string", "null"] },
        raw_text: { type: ["string", "null"] },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "search_equivalent_code",
    description: "Search equivalent map and return internal allowed candidates.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        code: { type: "string" },
      },
      required: ["code"],
    },
  },
  {
    type: "function",
    name: "validate_allowed_brand",
    description: "Validate if a brand is in allowed whitelist.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        brand: { type: "string" },
      },
      required: ["brand"],
    },
  },
  {
    type: "function",
    name: "get_missing_fields_for_group",
    description: "Get missing required fields by product group from technical rules.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        product_group: { type: ["string", "null"] },
        provided_fields: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["product_group"],
    },
  },
  {
    type: "function",
    name: "search_by_application",
    description: "Search catalog fitment data by machine type, model, or subsystem to find recommended codes.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "resolve_slang",
    description: "Resolve Vietnamese slang, shorthand or colloquial terms to canonical product terms.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        term: { type: "string" },
      },
      required: ["term"],
    },
  },
  {
    type: "function",
    name: "get_confusion_warning",
    description: "Check if a product code has known confusion risks with similar codes.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        code: { type: "string" },
      },
      required: ["code"],
    },
  },
] as const;

function toQuery(args: ToolArguments, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value.trim() : "";
}

function toProvidedFields(args: ToolArguments): string[] {
  const raw = args.provided_fields;
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
}

function rankConfidence(input: string, itemCode: string, exactMatch = false): "high" | "medium" | "low" {
  if (exactMatch) {
    return "high";
  }

  const normalizedInput = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const normalizedItemCode = itemCode.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (normalizedItemCode.startsWith(normalizedInput) || normalizedInput.startsWith(normalizedItemCode)) {
    return "medium";
  }

  return "low";
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function mapToToolResultItems(input: string, items: ReturnType<typeof filterAllowedBrands>): ToolResultItem[] {
  return items.map((item) => {
    const exactMatch = item.exact_code.toUpperCase() === input.toUpperCase();
    const highRisk = detectHighRiskConfusion(item, input);

    return {
      id: item.id,
      product_group: item.product_group,
      exact_code: item.exact_code,
      brand: item.brand,
      confidence: rankConfidence(input, item.exact_code, exactMatch),
      reason: item.applications.slice(0, 2).join(", ") || "Matched from internal catalog.",
      caution: item.confusion_note || "Cần xác minh thêm trước khi chốt mã.",
      manual_confirmation_required: item.manual_confirmation_required,
      high_risk_confusion: highRisk,
    };
  });
}

export function executeAssistantToolCall(name: string, args: ToolArguments): Record<string, unknown> {
  if (name === "search_exact_code") {
    const query = toQuery(args, "query");
    const exactHits = searchExactCode(query);
    const normalizedHits = searchByNormalizedCode(query);
    const merged = dedupeById([...exactHits, ...normalizedHits]);
    const allowed = filterAllowedBrands(merged);

    return {
      tool: name,
      query,
      count: allowed.length,
      items: mapToToolResultItems(query, allowed),
      not_in_catalog: merged.length === 0,
      outside_allowed_brand: merged.length > 0 && allowed.length === 0,
    };
  }

  if (name === "search_by_dimensions") {
    const rawText = toQuery(args, "raw_text");
    const application = toQuery(args, "application");
    const inferredProductGroup = inferProductGroup([rawText, application].join(" "));
    const requestedProductGroup = toQuery(args, "product_group") || inferredProductGroup || null;

    const matches = searchByDimensions({
      product_group: requestedProductGroup,
      id: typeof args.id === "number" ? args.id : null,
      od: typeof args.od === "number" ? args.od : null,
      width: typeof args.width === "number" ? args.width : null,
      thickness: typeof args.thickness === "number" ? args.thickness : null,
      shaft_diameter: typeof args.shaft_diameter === "number" ? args.shaft_diameter : null,
      pitch: typeof args.pitch === "number" ? args.pitch : null,
      links: typeof args.links === "number" ? args.links : null,
      profile: typeof args.profile === "string" ? args.profile : null,
      length: typeof args.length === "number" ? args.length : null,
      housing_type: typeof args.housing_type === "string" ? args.housing_type : null,
      chain_type: typeof args.chain_type === "string" ? args.chain_type : null,
      application,
      raw_text: rawText,
    });

    const allowed = filterAllowedBrands(matches);

    return {
      tool: name,
      inferred_product_group: requestedProductGroup,
      count: allowed.length,
      items: mapToToolResultItems(rawText || application || requestedProductGroup || "", allowed),
      not_in_catalog: matches.length === 0,
      outside_allowed_brand: matches.length > 0 && allowed.length === 0,
    };
  }

  if (name === "search_equivalent_code") {
    const code = toQuery(args, "code");
    const mapped = searchEquivalent(code);
    const allowed = filterAllowedBrands(mapped);

    return {
      tool: name,
      code,
      count: allowed.length,
      items: mapToToolResultItems(code, allowed),
      not_in_catalog: mapped.length === 0,
      outside_allowed_brand: mapped.length > 0 && allowed.length === 0,
    };
  }

  if (name === "validate_allowed_brand") {
    const brand = toQuery(args, "brand");
    const isAllowed = allowedBrands.has(brand.toUpperCase());

    return {
      tool: name,
      brand,
      allowed: isAllowed,
      message: isAllowed ? "Brand is allowed." : "Brand is outside whitelist.",
    };
  }

  if (name === "get_missing_fields_for_group") {
    const productGroup = toQuery(args, "product_group") || null;
    const providedFields = toProvidedFields(args);
    const missingFields = getMissingFieldsForGroup(productGroup, providedFields);

    return {
      tool: name,
      product_group: productGroup,
      missing_fields: missingFields,
      provided_fields: providedFields,
    };
  }

  if (name === "search_by_application") {
    const query = toQuery(args, "query");
    const fitments = searchByApplication(query);

    return {
      tool: name,
      query,
      count: fitments.length,
      fitments: fitments.map((f) => ({
        machine_type: f.machine_type,
        machine_model: f.machine_model,
        subsystem: f.subsystem,
        recommended_codes: f.recommended_codes,
        product_groups: f.product_groups,
        note: f.note,
        caution: f.caution,
      })),
    };
  }

  if (name === "resolve_slang") {
    const term = toQuery(args, "term");
    const resolved = resolveSlang(term);

    return {
      tool: name,
      term,
      resolved: resolved !== null,
      canonical: resolved?.canonical ?? null,
      product_group: resolved?.product_group ?? null,
    };
  }

  if (name === "get_confusion_warning") {
    const code = toQuery(args, "code");
    const warning = getConfusionWarning(code);

    return {
      tool: name,
      code,
      has_warning: warning !== null,
      warning: warning,
    };
  }

  return {
    tool: name,
    error: "Unsupported tool name.",
  };
}
