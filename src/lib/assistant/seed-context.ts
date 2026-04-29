import brandPolicyData from "@/data/catalog/brand_policy.json";
import conversationExamplesData from "@/data/catalog/conversation_examples.json";
import masterCatalogData from "@/data/catalog/master-catalog.json";
import questionTreeData from "@/data/catalog/question_tree.json";
import slangMapData from "@/data/catalog/slang_map.json";

type SeedParsedContext = {
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

type SeedDiscoveryContext = {
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

type BuildSeedContextInput = {
  latestUserMessage: string;
  parsedContext: SeedParsedContext | null;
  discoveryContext: SeedDiscoveryContext | null;
};

type CatalogRecord = (typeof masterCatalogData.records)[number];
type ConversationExample = (typeof conversationExamplesData.conversations)[number];

function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function extractLikelyCodes(text: string): string[] {
  const matched = text.match(/\b[a-z]{0,4}\d{2,}[a-z0-9./-]*\b/gi);
  if (!matched) {
    return [];
  }

  return uniqueStrings(matched.map((code) => code.toUpperCase()));
}

function inferProductGroups(normalizedText: string): string[] {
  const groups = slangMapData.mappings
    .filter((mapping) => mapping.product_group)
    .filter((mapping) => normalizedText.includes(normalizeText(mapping.slang)))
    .map((mapping) => mapping.product_group as string);

  return uniqueStrings(groups);
}

function pickRelevantCatalogRecords(input: {
  normalizedText: string;
  inferredGroups: string[];
  codes: string[];
  machineHints: string[];
}): CatalogRecord[] {
  const byCode = input.codes.length
    ? masterCatalogData.records.filter((record) =>
        input.codes.some((code) =>
          record.normalized_code.toUpperCase().includes(code.replace(/[^A-Z0-9]/g, "")) ||
          record.exact_code.toUpperCase().includes(code)
        )
      )
    : [];

  if (byCode.length > 0) {
    return byCode.slice(0, 6);
  }

  const byGroup = input.inferredGroups.length
    ? masterCatalogData.records.filter((record) => input.inferredGroups.includes(record.product_group))
    : [];

  if (byGroup.length > 0) {
    return byGroup.slice(0, 6);
  }

  if (input.machineHints.length === 0) {
    return masterCatalogData.records.slice(0, 4);
  }

  const byMachineHint = masterCatalogData.records.filter((record) => {
    const appText = normalizeText(record.applications.join(" "));
    return input.machineHints.some((hint) => appText.includes(hint));
  });

  return byMachineHint.slice(0, 6);
}

function pickRelevantQuestionTrees(input: {
  shouldTriggerDiscovery: boolean;
  hasProductGroup: boolean;
  hasCode: boolean;
}): typeof questionTreeData.trees {
  const selected: typeof questionTreeData.trees = [];

  if (input.shouldTriggerDiscovery) {
    const unknownGroup = questionTreeData.trees.find((tree) => tree.entry_condition === "unknown_product_group");
    if (unknownGroup) {
      selected.push(unknownGroup);
    }
  }

  if (input.hasProductGroup && !input.hasCode) {
    const noCodeTree = questionTreeData.trees.find((tree) => tree.entry_condition === "has_product_group_no_code");
    if (noCodeTree) {
      selected.push(noCodeTree);
    }
  }

  return selected.slice(0, 2);
}

function scoreConversationExample(example: ConversationExample, normalizedQuery: string): number {
  const joinedTags = normalizeText(example.tags.join(" "));
  const firstTurn = normalizeText(example.turns[0]?.content ?? "");
  const secondTurn = normalizeText(example.turns[1]?.content ?? "");

  let score = 0;

  const queryTokens = normalizedQuery.split(" ").filter((token) => token.length > 2);

  queryTokens.forEach((token) => {
    if (joinedTags.includes(token)) {
      score += 3;
    }
    if (firstTurn.includes(token)) {
      score += 2;
    }
    if (secondTurn.includes(token)) {
      score += 1;
    }
  });

  return score;
}

function pickRelevantExamples(normalizedQuery: string): ConversationExample[] {
  const ranked = conversationExamplesData.conversations
    .map((example) => ({
      example,
      score: scoreConversationExample(example, normalizedQuery),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.example);

  if (ranked.length > 0) {
    return ranked;
  }

  return conversationExamplesData.conversations.slice(0, 2);
}

function buildBrandSummary(): string[] {
  return brandPolicyData.policies
    .filter((policy) => policy.status === "active")
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    .slice(0, 5)
    .map((policy) => `- ${policy.brand}: uu tien ${policy.priority}, nhom ${policy.product_groups.join("/")}.`);
}

function buildSlangSummary(normalizedQuery: string): string[] {
  const hits = slangMapData.mappings
    .filter((mapping) => normalizedQuery.includes(normalizeText(mapping.slang)))
    .slice(0, 6)
    .map((mapping) => `- ${mapping.slang} -> ${mapping.canonical}${mapping.product_group ? ` (${mapping.product_group})` : ""}`);

  return hits;
}

export function buildIntentScopedSeedContext(input: BuildSeedContextInput): string {
  const normalizedQuery = normalizeText(input.latestUserMessage);
  const inferredGroups = inferProductGroups(normalizedQuery);
  const codes = extractLikelyCodes(normalizedQuery);
  const machineHints = uniqueStrings(
    [
      input.parsedContext?.machine_type ?? "",
      input.parsedContext?.machine_subsystem ?? "",
      input.discoveryContext?.machine_type ?? "",
      input.discoveryContext?.machine_subsystem ?? "",
    ]
      .map((value) => normalizeText(value))
      .filter(Boolean)
  );

  const relevantRecords = pickRelevantCatalogRecords({
    normalizedText: normalizedQuery,
    inferredGroups,
    codes,
    machineHints,
  });

  const relevantTrees = pickRelevantQuestionTrees({
    shouldTriggerDiscovery: input.parsedContext?.should_trigger_discovery ?? false,
    hasProductGroup: inferredGroups.length > 0,
    hasCode: codes.length > 0,
  });

  const relevantExamples = pickRelevantExamples(normalizedQuery);
  const slangSummary = buildSlangSummary(normalizedQuery);

  const lines: string[] = [];
  lines.push("Seed pack v1 context (intent-scoped):");
  lines.push(`- Latest user message: ${input.latestUserMessage || "(empty)"}`);
  lines.push(`- Inferred product groups: ${inferredGroups.join(", ") || "none"}`);
  lines.push(`- Detected codes: ${codes.join(", ") || "none"}`);
  lines.push(`- Machine hints: ${machineHints.join(", ") || "none"}`);
  lines.push("");

  lines.push("Brand policy shortlist:");
  lines.push(...buildBrandSummary());
  lines.push("");

  lines.push("Relevant catalog candidates:");
  relevantRecords.forEach((record) => {
    lines.push(
      `- ${record.exact_code} | ${record.brand} | group ${record.product_group} | apps ${record.applications.slice(0, 2).join("/")}`
    );
  });
  lines.push("");

  lines.push("Relevant slang mappings:");
  if (slangSummary.length > 0) {
    lines.push(...slangSummary);
  } else {
    lines.push("- none");
  }
  lines.push("");

  lines.push("Relevant question tree steps:");
  if (relevantTrees.length > 0) {
    relevantTrees.forEach((tree) => {
      lines.push(`- ${tree.entry_condition}: ${tree.description}`);
      tree.steps.slice(0, 3).forEach((step) => {
        lines.push(`  - Q${step.step}: ${step.question}`);
        if (step.options.length > 0) {
          lines.push(`    options: ${step.options.slice(0, 5).join(" | ")}`);
        }
      });
    });
  } else {
    lines.push("- none");
  }
  lines.push("");

  lines.push("Relevant conversation examples:");
  relevantExamples.forEach((example) => {
    const userTurn = example.turns.find((turn) => turn.role === "user")?.content ?? "";
    const assistantTurn = example.turns.find((turn) => turn.role === "assistant")?.content ?? "";
    lines.push(`- ${example.id}: user='${userTurn}' | assistant='${assistantTurn}'`);
  });

  return lines.join("\n");
}
