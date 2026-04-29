import {
  assistantStructuredOutput,
  coerceAssistantResponse,
  type AssistantStructuredResponse,
} from "@/lib/assistant/schemas";
import {
  executeAssistantToolCall,
  assistantToolDefinitions,
} from "@/lib/assistant/tools";
import type { ProviderRequest, ProviderResult } from "./index";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5-mini";
const MAX_TOOL_ROUNDS = 6;

type FunctionCallOutput = {
  type: "function_call_output";
  call_id: string;
  output: string;
};

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

function normalizeToolArguments(rawArguments: unknown): Record<string, unknown> {
  if (typeof rawArguments === "string") {
    const parsed = parseJson(rawArguments);
    return isObject(parsed) ? parsed : {};
  }
  return isObject(rawArguments) ? rawArguments : {};
}

function extractFunctionCalls(
  responsePayload: unknown
): Array<{ name: string; call_id: string; arguments: unknown }> {
  if (!isObject(responsePayload) || !Array.isArray(responsePayload.output)) {
    return [];
  }

  return responsePayload.output
    .filter(isObject)
    .filter((item) => item.type === "function_call")
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "",
      call_id: typeof item.call_id === "string" ? item.call_id : "",
      arguments: item.arguments,
    }))
    .filter((item) => item.name.length > 0 && item.call_id.length > 0);
}

function extractOutputText(responsePayload: unknown): string {
  if (!isObject(responsePayload)) {
    return "";
  }

  if (
    typeof responsePayload.output_text === "string" &&
    responsePayload.output_text.trim().length > 0
  ) {
    return responsePayload.output_text;
  }

  if (!Array.isArray(responsePayload.output)) {
    return "";
  }

  const chunks: string[] = [];

  responsePayload.output.filter(isObject).forEach((item) => {
    if (item.type !== "message" || !Array.isArray(item.content)) {
      return;
    }

    item.content.filter(isObject).forEach((contentItem) => {
      if (
        contentItem.type === "output_text" &&
        typeof contentItem.text === "string"
      ) {
        chunks.push(contentItem.text);
      }
    });
  });

  return chunks.join("\n").trim();
}

function buildToolOutputs(responsePayload: unknown): FunctionCallOutput[] {
  const calls = extractFunctionCalls(responsePayload);

  return calls.map((call) => {
    const args = normalizeToolArguments(call.arguments);
    const result = executeAssistantToolCall(call.name, args);

    return {
      type: "function_call_output" as const,
      call_id: call.call_id,
      output: JSON.stringify(result),
    };
  });
}

async function callOpenAI(
  apiKey: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI Responses API error ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

export async function callOpenAIProvider(
  req: ProviderRequest
): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return {
      ok: false,
      error: "Thiếu OPENAI_API_KEY trong môi trường.",
      provider: "openai",
    };
  }

  let responsePayload = await callOpenAI(apiKey, {
    model,
    instructions: req.instructions,
    input: req.messages,
    tools: assistantToolDefinitions,
    text: { format: assistantStructuredOutput },
    temperature: 0,
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const toolOutputs = buildToolOutputs(responsePayload);
    if (toolOutputs.length === 0) break;

    responsePayload = await callOpenAI(apiKey, {
      model,
      previous_response_id: isObject(responsePayload)
        ? responsePayload.id
        : undefined,
      input: toolOutputs,
      tools: assistantToolDefinitions,
      text: { format: assistantStructuredOutput },
      temperature: 0,
    });
  }

  const outputText = extractOutputText(responsePayload);
  const parsedPayload = parseJson(outputText);
  const result = coerceAssistantResponse(parsedPayload);

  return { ok: true, result, provider: "openai", model };
}
