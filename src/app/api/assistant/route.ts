import { NextRequest, NextResponse } from "next/server";
import {
  assistantResponseFallback,
} from "@/lib/assistant/schemas";
import { mergeParsedSignals, parseIntentInput, type AssistantIntentRoute } from "@/lib/assistant/intent-parser";
import {
  buildCommercialGuardResponse,
  enforceAssistantResponsePolicy,
  isCommercialIntentRoute,
  shouldUsePublicGrounding,
  type AssistantPolicyContext,
} from "@/lib/assistant/policies";
import { getAssistantSystemPrompt } from "@/lib/assistant/system-prompt";
import { callProvider } from "@/lib/assistant/providers";
import { buildIntentScopedSeedContext } from "@/lib/assistant/seed-context";

type ChatRole = "user" | "assistant";

type IncomingMessage = {
  role: ChatRole;
  content: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

type DiscoveryContext = {
  source: string;
  discovery_stage: string;
  selected_path: string[];
  machine_type: string | null;
  machine_subsystem: string | null;
  symptom: string[];
  urgency: string | null;
  buying_motive: string | null;
  suggested_options: string[];
  avoid_recommendation: string | null;
};

type ParsedContext = {
  intent_route: AssistantIntentRoute | null;
  input_style: string | null;
  machine_type: string | null;
  machine_subsystem: string | null;
  symptom: string[];
  urgency: string | null;
  buying_motive: string | null;
  suggested_options: string[];
  avoid_recommendation: string | null;
  should_trigger_discovery: boolean;
};

function normalizeDiscoveryContext(raw: unknown): DiscoveryContext | null {
  if (!isObject(raw)) {
    return null;
  }

  return {
    source: toNullableString(raw.source) ?? "discovery_flow",
    discovery_stage: toNullableString(raw.discovery_stage) ?? "none",
    selected_path: toStringArray(raw.selected_path),
    machine_type: toNullableString(raw.machine_type),
    machine_subsystem: toNullableString(raw.machine_subsystem),
    symptom: toStringArray(raw.symptom),
    urgency: toNullableString(raw.urgency),
    buying_motive: toNullableString(raw.buying_motive),
    suggested_options: toStringArray(raw.suggested_options),
    avoid_recommendation: toNullableString(raw.avoid_recommendation),
  };
}

function normalizeParsedContext(raw: unknown): ParsedContext | null {
  if (!isObject(raw)) {
    return null;
  }

  return {
    intent_route: toNullableString(raw.intent_route) as AssistantIntentRoute | null,
    input_style: toNullableString(raw.input_style),
    machine_type: toNullableString(raw.machine_type),
    machine_subsystem: toNullableString(raw.machine_subsystem),
    symptom: toStringArray(raw.symptom),
    urgency: toNullableString(raw.urgency),
    buying_motive: toNullableString(raw.buying_motive),
    suggested_options: toStringArray(raw.suggested_options),
    avoid_recommendation: toNullableString(raw.avoid_recommendation),
    should_trigger_discovery: raw.should_trigger_discovery === true,
  };
}

function buildAuxiliaryContext(discoveryContext: DiscoveryContext | null, parsedContext: ParsedContext | null): string {
  if (!discoveryContext && !parsedContext) {
    return "";
  }

  const lines: string[] = [];
  lines.push("Ngữ cảnh bổ sung từ giao diện:");

  if (discoveryContext) {
    lines.push(`- source: ${discoveryContext.source}`);
    lines.push(`- discovery_stage: ${discoveryContext.discovery_stage}`);
    lines.push(`- selected_path: ${discoveryContext.selected_path.join(" > ")}`);
    lines.push(`- machine_type: ${discoveryContext.machine_type ?? "null"}`);
    lines.push(`- machine_subsystem: ${discoveryContext.machine_subsystem ?? "null"}`);
    lines.push(`- symptom: ${discoveryContext.symptom.join(", ") || "null"}`);
    lines.push(`- urgency: ${discoveryContext.urgency ?? "null"}`);
    lines.push(`- buying_motive: ${discoveryContext.buying_motive ?? "null"}`);
    lines.push(`- suggested_options: ${discoveryContext.suggested_options.join(", ") || "null"}`);
    lines.push(`- avoid_recommendation: ${discoveryContext.avoid_recommendation ?? "null"}`);
  }

  if (parsedContext) {
    lines.push("- source: parsed_context");
    lines.push(`- parsed_intent_route: ${parsedContext.intent_route ?? "null"}`);
    lines.push(`- parsed_input_style: ${parsedContext.input_style ?? "null"}`);
    lines.push(`- parsed_machine_type: ${parsedContext.machine_type ?? "null"}`);
    lines.push(`- parsed_machine_subsystem: ${parsedContext.machine_subsystem ?? "null"}`);
    lines.push(`- parsed_symptom: ${parsedContext.symptom.join(", ") || "null"}`);
    lines.push(`- parsed_urgency: ${parsedContext.urgency ?? "null"}`);
    lines.push(`- parsed_buying_motive: ${parsedContext.buying_motive ?? "null"}`);
    lines.push(`- parsed_should_trigger_discovery: ${parsedContext.should_trigger_discovery}`);
    lines.push(`- parsed_suggested_options: ${parsedContext.suggested_options.join(", ") || "null"}`);
    lines.push(`- parsed_avoid_recommendation: ${parsedContext.avoid_recommendation ?? "null"}`);
  }

  return lines.join("\n");
}

function normalizeMessages(rawMessages: unknown): IncomingMessage[] {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages
    .filter(isObject)
    .map((item) => {
      const role: ChatRole = item.role === "assistant" ? "assistant" : "user";
      const content = typeof item.content === "string" ? item.content.trim() : "";

      return {
        role,
        content,
      };
    })
    .filter((item) => item.content.length > 0);
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body JSON không hợp lệ." },
      { status: 400 }
    );
  }

  const rawMessages = isObject(body) ? body.messages : undefined;
  const messages = normalizeMessages(rawMessages);
  const discoveryContext = isObject(body) ? normalizeDiscoveryContext(body.discovery_context) : null;
  const parsedContext = isObject(body) ? normalizeParsedContext(body.parsed_context) : null;
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")
    ?.content ?? "";
  const serverParsedIntent = parseIntentInput(latestUserMessage);
  const mergedParsedIntent = parsedContext
    ? mergeParsedSignals(serverParsedIntent, {
        ...serverParsedIntent,
        intent_route: parsedContext.intent_route ?? serverParsedIntent.intent_route,
        input_style: (parsedContext.input_style as typeof serverParsedIntent.input_style) ?? serverParsedIntent.input_style,
        machine_type: parsedContext.machine_type ?? serverParsedIntent.machine_type,
        machine_subsystem: parsedContext.machine_subsystem ?? serverParsedIntent.machine_subsystem,
        symptom: parsedContext.symptom.length > 0 ? parsedContext.symptom : serverParsedIntent.symptom,
        urgency: (parsedContext.urgency as typeof serverParsedIntent.urgency) ?? serverParsedIntent.urgency,
        buying_motive: (parsedContext.buying_motive as typeof serverParsedIntent.buying_motive) ?? serverParsedIntent.buying_motive,
        suggested_options:
          parsedContext.suggested_options.length > 0 ? parsedContext.suggested_options : serverParsedIntent.suggested_options,
        avoid_recommendation: parsedContext.avoid_recommendation ?? serverParsedIntent.avoid_recommendation,
        should_trigger_discovery: parsedContext.should_trigger_discovery,
        raw_text: latestUserMessage,
        normalized_text: serverParsedIntent.normalized_text,
        extracted_code: serverParsedIntent.extracted_code,
        matched_application_key: serverParsedIntent.matched_application_key,
        next_question: serverParsedIntent.next_question,
        is_ambiguous: serverParsedIntent.is_ambiguous,
      })
    : serverParsedIntent;
  const assistantContext: AssistantPolicyContext = {
    latestUserMessage,
    parsedIntent: mergedParsedIntent,
    intentRoute: mergedParsedIntent.intent_route,
  };
  const seedSupplement = buildIntentScopedSeedContext({
    latestUserMessage,
    parsedContext: {
      input_style: mergedParsedIntent.input_style,
      machine_type: mergedParsedIntent.machine_type,
      machine_subsystem: mergedParsedIntent.machine_subsystem,
      symptom: mergedParsedIntent.symptom,
      urgency: mergedParsedIntent.urgency,
      buying_motive: mergedParsedIntent.buying_motive,
      suggested_options: mergedParsedIntent.suggested_options,
      avoid_recommendation: mergedParsedIntent.avoid_recommendation,
      should_trigger_discovery: mergedParsedIntent.should_trigger_discovery,
    },
    discoveryContext,
  });
  const contextSupplement = buildAuxiliaryContext(discoveryContext, {
    intent_route: mergedParsedIntent.intent_route,
    input_style: mergedParsedIntent.input_style,
    machine_type: mergedParsedIntent.machine_type,
    machine_subsystem: mergedParsedIntent.machine_subsystem,
    symptom: mergedParsedIntent.symptom,
    urgency: mergedParsedIntent.urgency,
    buying_motive: mergedParsedIntent.buying_motive,
    suggested_options: mergedParsedIntent.suggested_options,
    avoid_recommendation: mergedParsedIntent.avoid_recommendation,
    should_trigger_discovery: mergedParsedIntent.should_trigger_discovery,
  });
  const instructions = [getAssistantSystemPrompt(), seedSupplement, contextSupplement]
    .filter((line) => line.trim().length > 0)
    .join("\n\n");

  if (messages.length === 0 || !messages.some((message) => message.role === "user")) {
    return NextResponse.json(
      { ok: false, error: "messages phải có ít nhất một user message." },
      { status: 400 }
    );
  }

  if (isCommercialIntentRoute(mergedParsedIntent.intent_route)) {
    const guarded = buildCommercialGuardResponse(assistantContext);

    return NextResponse.json({
      ok: true,
      provider: "policy_guard",
      model_used: shouldUsePublicGrounding(mergedParsedIntent.intent_route) ? "grounded" : "guarded",
      result: guarded,
    });
  }

  try {
    const providerResult = await callProvider({ messages, instructions, assistantContext });

    if (!providerResult.ok) {
      return NextResponse.json(
        { ok: false, error: providerResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: providerResult.provider,
      model_used: providerResult.model,
      result: enforceAssistantResponsePolicy(providerResult.result, assistantContext),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Lỗi trợ lý không xác định.";
    console.error(`[assistant] provider error:`, reason);

    return NextResponse.json(
      {
        ok: false,
        error: "Hệ thống chưa sẵn sàng.",
        detail: reason,
        result: {
          ...assistantResponseFallback,
          short_reply: "Cần xác minh thêm.",
          final_status: "manual_review",
        },
      },
      { status: 502 }
    );
  }
}
