import {
  coerceAssistantResponse,
} from "@/lib/assistant/schemas";
import { shouldUsePublicGrounding } from "@/lib/assistant/policies";
import {
  executeAssistantToolCall,
  assistantToolDefinitions,
} from "@/lib/assistant/tools";
import type { ProviderRequest, ProviderResult } from "./index";

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_TOOL_ROUNDS = 6;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/* ── helpers ── */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

/* ── Convert OpenAI-style tool defs → Gemini function declarations ── */

function toGeminiFunctionDeclarations() {
  return assistantToolDefinitions.map((tool) => {
    const params = tool.parameters as Record<string, unknown>;

    /* Gemini doesn't support `type: ["string","null"]` — normalise */
    const properties = { ...(params.properties as Record<string, unknown>) };
    const cleaned: Record<string, unknown> = {};

    for (const [key, schema] of Object.entries(properties)) {
      if (!isObject(schema)) continue;

      if (Array.isArray(schema.type)) {
        const nonNull = (schema.type as string[]).filter((t) => t !== "null");
        cleaned[key] = {
          ...schema,
          type: nonNull[0] ?? "string",
        };
      } else {
        cleaned[key] = schema;
      }
    }

    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: cleaned,
        required: params.required ?? [],
      },
    };
  });
}

/* ── Build structured output instruction as text ── */

function buildJsonSchemaInstruction(): string {
  return [
    "",
    "CRITICAL: You MUST respond with a single valid JSON object conforming to the following TypeScript shape (no markdown fences, no explanation, just the raw JSON):",
    "",
    "interface Response {",
    '  intent: "exact_code" | "equivalent" | "by_dimensions" | "by_application" | "insufficient_info" | "not_in_catalog";',
    '  input_style: "full_sentence" | "fragment" | "shorthand" | "code_only" | "greeting";',
    "  product_group: string | null;",
    "  machine_type: string | null;",
    "  machine_subsystem: string | null;",
    "  symptom: string[];",
    '  urgency: "low" | "medium" | "high" | null;',
    '  buying_motive: "urgent_replacement" | "exact_match" | "equivalent_option" | "cost_optimization" | "brand_specific" | "price_check" | "technical_consult" | null;',
    '  discovery_stage: "none" | "greeting" | "code_flow" | "image_flow" | "machine_flow_1" | "machine_flow_2" | "machine_flow_3" | "urgent_flow";',
    "  suggested_options: string[];",
    "  next_question: string | null;",
    "  avoid_recommendation: string | null;",
    "  recommended_items: Array<{",
    "    exact_code: string;",
    "    brand: string;",
    '    confidence: "high" | "medium" | "low";',
    "    reason: string;",
    "    caution: string;",
    "  }>;",
    "  missing_fields: string[];",
    '  final_status: "ready" | "needs_more_info" | "manual_review" | "not_found_in_system";',
    "  pricing_note: string;",
    "  stock_note: string;",
    "  short_reply: string;",
    "}",
    "",
    'pricing_note MUST include "Giá được xác nhận riêng."',
    'stock_note MUST include "Chưa xác nhận tồn kho tự động."',
  ].join("\n");
}

/* ── Build Gemini request body ── */

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text?: string; functionCall?: unknown; functionResponse?: unknown }>;
};

function buildContents(
  messages: ProviderRequest["messages"],
  instructions: string
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  for (const msg of messages) {
    const role = msg.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: msg.content }] });
  }

  /* Prepend system instruction as first user turn if no system_instruction support */
  if (contents.length > 0 && contents[0].role === "model") {
    contents.unshift({
      role: "user",
      parts: [{ text: instructions }],
    });
  }

  return contents;
}

/* ── Call Gemini API ── */

async function callGemini(
  apiKey: string,
  model: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

/* ── Extract function calls from Gemini response ── */

type GeminiFunctionCall = { name: string; args: Record<string, unknown> };

function extractGeminiFunctionCalls(payload: unknown): GeminiFunctionCall[] {
  if (!isObject(payload)) return [];
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const calls: GeminiFunctionCall[] = [];

  for (const candidate of candidates) {
    if (!isObject(candidate)) continue;
    const content = candidate.content;
    if (!isObject(content) || !Array.isArray(content.parts)) continue;

    for (const part of content.parts) {
      if (!isObject(part) || !isObject(part.functionCall)) continue;
      const fc = part.functionCall;
      if (typeof fc.name === "string") {
        calls.push({
          name: fc.name,
          args: isObject(fc.args) ? fc.args : {},
        });
      }
    }
  }
  return calls;
}

/* ── Extract text from Gemini response ── */

function extractGeminiText(payload: unknown): string {
  if (!isObject(payload)) return "";
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const chunks: string[] = [];

  for (const candidate of candidates) {
    if (!isObject(candidate)) continue;
    const content = candidate.content;
    if (!isObject(content) || !Array.isArray(content.parts)) continue;

    for (const part of content.parts) {
      if (isObject(part) && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

/* ── Try to parse JSON from text that may have markdown fences ── */

function extractJsonFromText(text: string): unknown {
  /* Try raw parse */
  const raw = parseJson(text);
  if (raw !== null) return raw;

  /* Strip markdown code fences */
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    const inner = parseJson(fenceMatch[1]);
    if (inner !== null) return inner;
  }

  return null;
}

/* ── Main provider ── */

export async function callGeminiProvider(
  req: ProviderRequest
): Promise<ProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return {
      ok: false,
      error: "Thiếu GEMINI_API_KEY trong môi trường.",
      provider: "gemini",
    };
  }

  const allowGrounding = req.assistantContext
    ? shouldUsePublicGrounding(req.assistantContext.intentRoute)
    : false;

  const groundingInstruction = allowGrounding
    ? [
        "Grounding policy:",
        "- Bạn được phép dùng Google Search grounding cho mã phổ thông, quy cách cơ bản, ứng dụng, hiện tượng hư hỏng và thông tin thương hiệu công khai.",
        "- Không dùng grounding để suy ra giá bán, tồn kho, lead time hoặc chính sách bán của công ty.",
        "- Chỉ lấy phần thông tin công khai thực sự giúp chốt hướng kỹ thuật.",
      ].join("\n")
    : "";

  const fullInstructions = [req.instructions, groundingInstruction, buildJsonSchemaInstruction()]
    .filter((item) => item.trim().length > 0)
    .join("\n");

  const contents = buildContents(req.messages, fullInstructions);

  /*
   * Gemini 2.5-flash does NOT support combining built-in tools (googleSearch)
   * with custom function calling (functionDeclarations) in the same request.
   * We must pick one mode exclusively.
   *
   * TODO: Gemini 3 preview supports built-in tools + function calling with
   * include_server_side_tool_invocations=true and tool context circulation.
   * Not enabled in current production flow.
   */
  const functionDeclarations = toGeminiFunctionDeclarations();
  const hasCustomTools = functionDeclarations.length > 0;
  const wantsGrounding = allowGrounding;
  const canUseGoogleSearch = wantsGrounding && !hasCustomTools;

  let finalToolsMode: "custom_only" | "google_search_only" | "none";
  let tools: Array<Record<string, unknown>> | undefined;

  if (hasCustomTools) {
    finalToolsMode = "custom_only";
    tools = [{ functionDeclarations }];

    if (wantsGrounding) {
      console.log(
        "[assistant] downgraded tools mode: google_search disabled because custom tools are active"
      );
    }
  } else if (canUseGoogleSearch) {
    finalToolsMode = "google_search_only";
    tools = [{ googleSearch: {} }];
  } else {
    finalToolsMode = "none";
    tools = undefined;
  }

  console.log(
    `[assistant] gemini provider — model=${model} wantsGrounding=${wantsGrounding} hasCustomTools=${hasCustomTools} finalToolsMode=${finalToolsMode}`
  );

  let payload: Record<string, unknown> = {
    system_instruction: { parts: [{ text: fullInstructions }] },
    contents,
    ...(tools ? { tools } : {}),
    generationConfig: { temperature: 0 },
  };

  let responsePayload = await callGemini(apiKey, model, payload);

  /* Tool calling loop — only runs when finalToolsMode === "custom_only" */
  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    if (finalToolsMode !== "custom_only") break;

    const functionCalls = extractGeminiFunctionCalls(responsePayload);
    if (functionCalls.length === 0) break;

    /* Execute tools and build function response parts */
    const functionResponseParts = functionCalls.map((fc) => {
      const result = executeAssistantToolCall(fc.name, fc.args);
      return {
        functionResponse: {
          name: fc.name,
          response: result,
        },
      };
    });

    /* Build the function call parts that the model produced */
    const functionCallParts = functionCalls.map((fc) => ({
      functionCall: { name: fc.name, args: fc.args },
    }));

    /* Append model turn (function calls) + user turn (function responses) */
    const updatedContents = [
      ...contents,
      { role: "model" as const, parts: functionCallParts },
      { role: "user" as const, parts: functionResponseParts },
    ];

    payload = {
      system_instruction: { parts: [{ text: fullInstructions }] },
      contents: updatedContents,
      ...(tools ? { tools } : {}),
      generationConfig: { temperature: 0 },
    };

    responsePayload = await callGemini(apiKey, model, payload);

    /* Update contents for next round if needed */
    contents.push(
      { role: "model", parts: functionCallParts },
      { role: "user", parts: functionResponseParts }
    );
  }

  const outputText = extractGeminiText(responsePayload);
  const parsed = extractJsonFromText(outputText);
  const result = coerceAssistantResponse(parsed);

  return { ok: true, result, provider: "gemini", model };
}
