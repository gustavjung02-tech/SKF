import type { AssistantStructuredResponse } from "@/lib/assistant/schemas";
import type { AssistantPolicyContext } from "@/lib/assistant/policies";

export type ProviderName = "openai" | "gemini";

export type ProviderRequest = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  instructions: string;
  assistantContext?: AssistantPolicyContext;
};

export type ProviderResult =
  | { ok: true; result: AssistantStructuredResponse; provider: ProviderName; model: string }
  | { ok: false; error: string; provider: ProviderName };

export function getActiveProvider(): ProviderName {
  const env = (process.env.ASSISTANT_PROVIDER ?? "").trim().toLowerCase();
  if (env === "gemini") return "gemini";
  return "openai";
}

export async function callProvider(req: ProviderRequest): Promise<ProviderResult> {
  const provider = getActiveProvider();

  if (provider === "gemini") {
    const { callGeminiProvider } = await import("./gemini");
    const result = await callGeminiProvider(req);

    /* Fallback to OpenAI if Gemini fails */
    if (!result.ok) {
      console.warn(`[assistant] Gemini failed: ${result.error} — falling back to OpenAI`);
      const { callOpenAIProvider } = await import("./openai");
      return callOpenAIProvider(req);
    }

    return result;
  }

  const { callOpenAIProvider } = await import("./openai");
  return callOpenAIProvider(req);
}
