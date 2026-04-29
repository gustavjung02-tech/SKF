const intentValues = [
  "exact_code",
  "equivalent",
  "by_dimensions",
  "by_application",
  "insufficient_info",
  "not_in_catalog",
] as const;

const inputStyleValues = ["full_sentence", "fragment", "shorthand", "code_only", "greeting"] as const;

const confidenceValues = ["high", "medium", "low"] as const;

const urgencyValues = ["low", "medium", "high"] as const;

const buyingMotiveValues = [
  "urgent_replacement",
  "exact_match",
  "equivalent_option",
  "cost_optimization",
  "brand_specific",
  "price_check",
  "technical_consult",
] as const;

const discoveryStageValues = [
  "none",
  "greeting",
  "code_flow",
  "image_flow",
  "machine_flow_1",
  "machine_flow_2",
  "machine_flow_3",
  "urgent_flow",
] as const;

const finalStatusValues = ["ready", "needs_more_info", "manual_review", "not_found_in_system"] as const;

export type AssistantIntent = (typeof intentValues)[number];
export type AssistantInputStyle = (typeof inputStyleValues)[number];
export type AssistantConfidence = (typeof confidenceValues)[number];
export type AssistantUrgency = (typeof urgencyValues)[number];
export type AssistantBuyingMotive = (typeof buyingMotiveValues)[number];
export type AssistantDiscoveryStage = (typeof discoveryStageValues)[number];
export type AssistantFinalStatus = (typeof finalStatusValues)[number];

export type AssistantRecommendedItem = {
  exact_code: string;
  brand: string;
  confidence: AssistantConfidence;
  reason: string;
  caution: string;
};

export type AssistantStructuredResponse = {
  intent: AssistantIntent;
  input_style: AssistantInputStyle;
  product_group: string | null;
  machine_type: string | null;
  machine_subsystem: string | null;
  symptom: string[];
  urgency: AssistantUrgency | null;
  buying_motive: AssistantBuyingMotive | null;
  discovery_stage: AssistantDiscoveryStage;
  suggested_options: string[];
  next_question: string | null;
  avoid_recommendation: string | null;
  recommended_items: AssistantRecommendedItem[];
  missing_fields: string[];
  final_status: AssistantFinalStatus;
  pricing_note: string;
  stock_note: string;
  short_reply: string;
};

export const assistantStructuredOutput = {
  type: "json_schema",
  name: "assistant_structured_response",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      intent: {
        type: "string",
        enum: intentValues,
      },
      input_style: {
        type: "string",
        enum: inputStyleValues,
      },
      product_group: {
        type: ["string", "null"],
      },
      machine_type: {
        type: ["string", "null"],
      },
      machine_subsystem: {
        type: ["string", "null"],
      },
      symptom: {
        type: "array",
        items: { type: "string" },
      },
      urgency: {
        type: ["string", "null"],
        enum: [...urgencyValues, null],
      },
      buying_motive: {
        type: ["string", "null"],
        enum: [...buyingMotiveValues, null],
      },
      discovery_stage: {
        type: "string",
        enum: discoveryStageValues,
      },
      suggested_options: {
        type: "array",
        items: { type: "string" },
      },
      next_question: {
        type: ["string", "null"],
      },
      avoid_recommendation: {
        type: ["string", "null"],
      },
      recommended_items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            exact_code: { type: "string" },
            brand: { type: "string" },
            confidence: {
              type: "string",
              enum: confidenceValues,
            },
            reason: { type: "string" },
            caution: { type: "string" },
          },
          required: ["exact_code", "brand", "confidence", "reason", "caution"],
        },
      },
      missing_fields: {
        type: "array",
        items: { type: "string" },
      },
      final_status: {
        type: "string",
        enum: finalStatusValues,
      },
      pricing_note: { type: "string" },
      stock_note: { type: "string" },
      short_reply: { type: "string" },
    },
    required: [
      "intent",
      "input_style",
      "product_group",
      "machine_type",
      "machine_subsystem",
      "symptom",
      "urgency",
      "buying_motive",
      "discovery_stage",
      "suggested_options",
      "next_question",
      "avoid_recommendation",
      "recommended_items",
      "missing_fields",
      "final_status",
      "pricing_note",
      "stock_note",
      "short_reply",
    ],
  },
} as const;

export const assistantResponseFallback: AssistantStructuredResponse = {
  intent: "insufficient_info",
  input_style: "fragment",
  product_group: null,
  machine_type: null,
  machine_subsystem: null,
  symptom: [],
  urgency: null,
  buying_motive: null,
  discovery_stage: "none",
  suggested_options: [],
  next_question: null,
  avoid_recommendation: null,
  recommended_items: [],
  missing_fields: [],
  final_status: "needs_more_info",
  pricing_note: "Giá được xác nhận riêng.",
  stock_note: "Chưa xác nhận tồn kho tự động.",
  short_reply: "Cần xác minh thêm.",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isIntent(value: unknown): value is AssistantIntent {
  return typeof value === "string" && intentValues.includes(value as AssistantIntent);
}

function isInputStyle(value: unknown): value is AssistantInputStyle {
  return typeof value === "string" && inputStyleValues.includes(value as AssistantInputStyle);
}

function isConfidence(value: unknown): value is AssistantConfidence {
  return typeof value === "string" && confidenceValues.includes(value as AssistantConfidence);
}

function isUrgency(value: unknown): value is AssistantUrgency {
  return typeof value === "string" && urgencyValues.includes(value as AssistantUrgency);
}

function isBuyingMotive(value: unknown): value is AssistantBuyingMotive {
  return typeof value === "string" && buyingMotiveValues.includes(value as AssistantBuyingMotive);
}

function isDiscoveryStage(value: unknown): value is AssistantDiscoveryStage {
  return typeof value === "string" && discoveryStageValues.includes(value as AssistantDiscoveryStage);
}

function isFinalStatus(value: unknown): value is AssistantFinalStatus {
  return typeof value === "string" && finalStatusValues.includes(value as AssistantFinalStatus);
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function coerceAssistantResponse(payload: unknown): AssistantStructuredResponse {
  if (!isObject(payload)) {
    return assistantResponseFallback;
  }

  const recommendedItemsRaw = Array.isArray(payload.recommended_items) ? payload.recommended_items : [];
  const recommended_items: AssistantRecommendedItem[] = recommendedItemsRaw
    .filter(isObject)
    .map((item) => {
      const confidence = isConfidence(item.confidence) ? item.confidence : "low";

      return {
        exact_code: typeof item.exact_code === "string" ? item.exact_code : "",
        brand: typeof item.brand === "string" ? item.brand : "",
        confidence,
        reason: typeof item.reason === "string" ? item.reason : "Cần xác minh thêm.",
        caution: typeof item.caution === "string" ? item.caution : "Cần xác minh thêm.",
      };
    })
    .filter((item) => item.exact_code.length > 0 && item.brand.length > 0);

  return {
    intent: isIntent(payload.intent) ? payload.intent : "insufficient_info",
    input_style: isInputStyle(payload.input_style) ? payload.input_style : "fragment",
    product_group: toNullableString(payload.product_group),
    machine_type: toNullableString(payload.machine_type),
    machine_subsystem: toNullableString(payload.machine_subsystem),
    symptom: isStringArray(payload.symptom) ? payload.symptom : [],
    urgency: isUrgency(payload.urgency) ? payload.urgency : null,
    buying_motive: isBuyingMotive(payload.buying_motive) ? payload.buying_motive : null,
    discovery_stage: isDiscoveryStage(payload.discovery_stage) ? payload.discovery_stage : "none",
    suggested_options: isStringArray(payload.suggested_options) ? payload.suggested_options : [],
    next_question: toNullableString(payload.next_question),
    avoid_recommendation: toNullableString(payload.avoid_recommendation),
    recommended_items,
    missing_fields: isStringArray(payload.missing_fields) ? payload.missing_fields : [],
    final_status: isFinalStatus(payload.final_status) ? payload.final_status : "needs_more_info",
    pricing_note: typeof payload.pricing_note === "string" ? payload.pricing_note : "Giá được xác nhận riêng.",
    stock_note:
      typeof payload.stock_note === "string" ? payload.stock_note : "Chưa xác nhận tồn kho tự động.",
    short_reply:
      typeof payload.short_reply === "string" && payload.short_reply.length > 0
        ? payload.short_reply
        : "Cần xác minh thêm.",
  };
}
