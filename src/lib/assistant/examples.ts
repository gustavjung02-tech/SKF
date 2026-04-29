import conversationExamplesData from "@/data/catalog/conversation_examples.json";

export type AssistantFewShotExample = {
  user: string;
  assistant: string;
};

/* Build few-shot examples from conversation_examples.json */
export const assistantFewShotExamples: AssistantFewShotExample[] =
  conversationExamplesData.conversations
    .filter((conv) => conv.turns.length >= 2)
    .map((conv) => ({
      user: conv.turns[0].content,
      assistant: conv.turns[1].content,
    }));

export function buildFewShotPrompt(): string {
  const lines = assistantFewShotExamples.map((example, index) => {
    return [
      `Ví dụ ${index + 1}:`,
      `Khách: ${example.user}`,
      `Trợ lý: ${example.assistant}`,
    ].join("\n");
  });

  return [
    "Mẫu hỏi-đáp ngắn gọn để giữ văn phong chuyên nghiệp:",
    ...lines,
  ].join("\n\n");
}
