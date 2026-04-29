import conversationPrompts from "@/data/catalog/conversation-prompts.json";
import {
  type BuyingMotive,
  mergeParsedSignals,
  parseIntentInput,
  type ParsedIntent,
  type UrgencyLevel,
} from "@/lib/assistant/intent-parser";

export type DiscoveryStage =
  | "none"
  | "greeting"
  | "code_flow"
  | "image_flow"
  | "machine_flow_1"
  | "machine_flow_2"
  | "machine_flow_3"
  | "urgent_flow";

export type DiscoveryPrompt = {
  stage: DiscoveryStage;
  message: string;
  options: string[];
};

export type DiscoveryContext = {
  source: "discovery_flow";
  discovery_stage: DiscoveryStage;
  selected_path: string[];
  machine_type: string | null;
  machine_subsystem: string | null;
  symptom: string[];
  urgency: UrgencyLevel;
  buying_motive: BuyingMotive;
  suggested_options: string[];
  avoid_recommendation: string | null;
};

export type DiscoveryState = {
  stage: DiscoveryStage;
  selectedPath: string[];
  machineType: string | null;
  machineSubsystem: string | null;
  symptom: string[];
  urgency: UrgencyLevel;
  buyingMotive: BuyingMotive;
  suggestedOptions: string[];
  avoidRecommendation: string | null;
  parsed: ParsedIntent;
};

export type DiscoveryTransition = {
  nextState: DiscoveryState;
  nextPrompt: DiscoveryPrompt | null;
  shouldSubmit: boolean;
  summaryMessage: string;
};

const emptyParsedIntent: ParsedIntent = {
  raw_text: "",
  normalized_text: "",
  intent_route: "contact_handoff",
  input_style: "fragment",
  extracted_code: null,
  machine_type: null,
  machine_subsystem: null,
  symptom: [],
  urgency: null,
  buying_motive: null,
  suggested_options: [],
  matched_application_key: null,
  avoid_recommendation: null,
  next_question: null,
  is_ambiguous: true,
  should_trigger_discovery: true,
};

function promptForStage(stage: DiscoveryStage): DiscoveryPrompt | null {
  if (stage === "greeting") {
    return {
      stage,
      message: conversationPrompts.greeting,
      options: conversationPrompts.first_level_options,
    };
  }

  if (stage === "code_flow") {
    return {
      stage,
      message: conversationPrompts.code_flow.message,
      options: conversationPrompts.code_flow.options,
    };
  }

  if (stage === "image_flow") {
    return {
      stage,
      message: conversationPrompts.image_flow.message,
      options: conversationPrompts.image_flow.options,
    };
  }

  if (stage === "machine_flow_1") {
    return {
      stage,
      message: conversationPrompts.machine_flow_step_1.message,
      options: conversationPrompts.machine_flow_step_1.options,
    };
  }

  if (stage === "machine_flow_2") {
    return {
      stage,
      message: conversationPrompts.machine_flow_step_2.message,
      options: conversationPrompts.machine_flow_step_2.options,
    };
  }

  if (stage === "machine_flow_3") {
    return {
      stage,
      message: conversationPrompts.machine_flow_step_3.message,
      options: conversationPrompts.machine_flow_step_3.options,
    };
  }

  if (stage === "urgent_flow") {
    return {
      stage,
      message: conversationPrompts.urgent_flow.message,
      options: conversationPrompts.urgent_flow.options,
    };
  }

  return null;
}

function stageFromFirstLevelOption(option: string): DiscoveryStage {
  const normalized = option
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

  if (normalized.includes("ma cu")) {
    return "code_flow";
  }

  if (normalized.includes("anh") || normalized.includes("tem")) {
    return "image_flow";
  }

  if (normalized.includes("mo ta") || normalized.includes("he may") || normalized.includes("trieu chung")) {
    return "machine_flow_1";
  }

  return "urgent_flow";
}

function motiveFromSelection(option: string): BuyingMotive {
  if (option.includes("thay gấp")) {
    return "urgent_replacement";
  }

  if (option.includes("mã cũ") || option.includes("đúng mã")) {
    return "exact_match";
  }

  if (option.includes("tương đương")) {
    return "equivalent_option";
  }

  if (option.includes("tham khảo")) {
    return "price_check";
  }

  return null;
}

export function createInitialDiscoveryState(): DiscoveryState {
  return {
    stage: "greeting",
    selectedPath: [],
    machineType: null,
    machineSubsystem: null,
    symptom: [],
    urgency: null,
    buyingMotive: null,
    suggestedOptions: [],
    avoidRecommendation: null,
    parsed: emptyParsedIntent,
  };
}

export function getPromptForStage(stage: DiscoveryStage): DiscoveryPrompt | null {
  return promptForStage(stage);
}

export function resetDiscoveryState(): DiscoveryState {
  return createInitialDiscoveryState();
}

export function buildDiscoverySummary(state: DiscoveryState): string {
  const lines = [
    "Ngữ cảnh từ discovery flow:",
    `- Hướng đã chọn: ${state.selectedPath.join(" > ") || "Chưa xác định"}`,
    `- Hệ máy: ${state.machineType ?? "Chưa rõ"}`,
    `- Cụm máy: ${state.machineSubsystem ?? "Chưa rõ"}`,
    `- Triệu chứng: ${state.symptom.join(", ") || "Chưa rõ"}`,
    `- Mức khẩn: ${state.urgency ?? "Chưa rõ"}`,
    `- Động cơ mua hàng: ${state.buyingMotive ?? "Chưa rõ"}`,
  ];

  if (state.avoidRecommendation) {
    lines.push(`- Lưu ý tránh: ${state.avoidRecommendation}`);
  }

  return lines.join("\n");
}

export function buildDiscoveryContext(state: DiscoveryState): DiscoveryContext {
  return {
    source: "discovery_flow",
    discovery_stage: state.stage,
    selected_path: state.selectedPath,
    machine_type: state.machineType,
    machine_subsystem: state.machineSubsystem,
    symptom: state.symptom,
    urgency: state.urgency,
    buying_motive: state.buyingMotive,
    suggested_options: state.suggestedOptions,
    avoid_recommendation: state.avoidRecommendation,
  };
}

export function applyDiscoverySelection(state: DiscoveryState, selectedOption: string): DiscoveryTransition {
  const parsedSelection = parseIntentInput(selectedOption);
  const mergedParsed = mergeParsedSignals(state.parsed, parsedSelection);

  const nextState: DiscoveryState = {
    ...state,
    selectedPath: [...state.selectedPath, selectedOption],
    machineType: state.machineType ?? parsedSelection.machine_type,
    machineSubsystem: state.machineSubsystem ?? parsedSelection.machine_subsystem,
    symptom: Array.from(new Set([...state.symptom, ...parsedSelection.symptom])),
    urgency: state.urgency ?? parsedSelection.urgency,
    buyingMotive: state.buyingMotive ?? parsedSelection.buying_motive ?? motiveFromSelection(selectedOption),
    suggestedOptions: Array.from(new Set([...state.suggestedOptions, ...parsedSelection.suggested_options])),
    avoidRecommendation: state.avoidRecommendation ?? parsedSelection.avoid_recommendation,
    parsed: mergedParsed,
  };

  if (state.stage === "greeting") {
    const stage = stageFromFirstLevelOption(selectedOption);
    const prompt = promptForStage(stage);

    nextState.stage = stage;
    nextState.buyingMotive = nextState.buyingMotive ?? motiveFromSelection(selectedOption);

    return {
      nextState,
      nextPrompt: prompt,
      shouldSubmit: false,
      summaryMessage: buildDiscoverySummary(nextState),
    };
  }

  if (state.stage === "machine_flow_1") {
    nextState.stage = "machine_flow_2";
    return {
      nextState,
      nextPrompt: promptForStage("machine_flow_2"),
      shouldSubmit: false,
      summaryMessage: buildDiscoverySummary(nextState),
    };
  }

  if (state.stage === "machine_flow_2") {
    nextState.stage = "machine_flow_3";
    return {
      nextState,
      nextPrompt: promptForStage("machine_flow_3"),
      shouldSubmit: false,
      summaryMessage: buildDiscoverySummary(nextState),
    };
  }

  if (state.stage === "urgent_flow") {
    nextState.urgency = nextState.urgency ?? "high";
    nextState.stage = "none";

    return {
      nextState,
      nextPrompt: null,
      shouldSubmit: true,
      summaryMessage: [buildDiscoverySummary(nextState), conversationPrompts.urgent_note].join("\n"),
    };
  }

  if (state.stage === "code_flow" || state.stage === "image_flow" || state.stage === "machine_flow_3") {
    nextState.stage = "none";

    return {
      nextState,
      nextPrompt: null,
      shouldSubmit: true,
      summaryMessage: buildDiscoverySummary(nextState),
    };
  }

  return {
    nextState,
    nextPrompt: null,
    shouldSubmit: false,
    summaryMessage: buildDiscoverySummary(nextState),
  };
}
