import type { AssistantIntentRoute } from "@/lib/assistant/intent-parser";
import { inferInternalConfidenceLabel, isCommercialIntentRoute } from "@/lib/assistant/policies";
import type { AssistantStructuredResponse } from "@/lib/assistant/schemas";

export type ReplyOptionStyle = "chips" | "stacked";

export type ReplyGroup =
  | "greeting_reply"
  | "smalltalk_reply"
  | "preliminary_assessment"
  | "medium_confidence_assessment"
  | "high_confidence_match"
  | "direct_code_reply"
  | "symptom_reply"
  | "technical_followup"
  | "sales_handoff";

export type BuiltReplyMessage = {
  text: string;
  options?: string[];
  optionStyle?: ReplyOptionStyle;
  group?: ReplyGroup;
  internal_confidence?: "high" | "medium" | "low";
  showContactCta?: boolean;
};

type BuildReplyInput = {
  payload: AssistantStructuredResponse;
  latestUserText?: string;
  intentRoute?: AssistantIntentRoute | null;
};

const highConfidenceLeadVariants = [
  "Khả năng cao hướng này đã sát nhu cầu.",
  "Với dữ liệu hiện có, hướng này gần như đúng cụm.",
  "Em đang nghiêng mạnh về phương án này.",
  "Đối chiếu hiện tại cho thấy đây là hướng ưu tiên.",
];

const mediumConfidenceLeadVariants = [
  "Hiện có hơn một hướng khả dĩ, em đang thu hẹp lại.",
  "Dữ kiện hiện tại cho mức phù hợp trung bình, cần thêm 1 điểm để chốt.",
  "Em khoanh được vài phương án gần nhất theo thông tin hiện có.",
  "Nhận định sơ bộ đã có, cần xác nhận thêm 1 điểm để chọn đúng mã.",
];

const technicalHandoffLeadVariants = [
  "Triệu chứng cho thấy khả năng lỗi nằm ở cụm quay chịu tải.",
  "Theo mô tả, đây là dạng lỗi cần khoanh cụm trước khi chốt mã.",
  "Mẫu lỗi này thường đến từ sai lệch cụm hoặc điều kiện bôi trơn.",
  "Đây là tình huống nên nhận định sơ bộ trước rồi chốt theo điểm đo.",
];

const preliminaryLeadVariants = [
  "Đây là nhận định sơ bộ theo dữ liệu hiện có.",
  "Em khoanh được hướng đi ban đầu dựa trên thông tin anh/chị cung cấp.",
  "Có cơ sở kỹ thuật ban đầu để tiếp tục đối chiếu.",
  "Theo pattern mã thường gặp, em đang nghiêng về hướng sau.",
];

const salesLeadVariants = [
  "Em ghi nhận nhu cầu thương mại và chuyển đúng luồng hỗ trợ.",
  "Phần thương mại sẽ được kinh doanh xác nhận riêng.",
  "Em chưa chốt thông tin thương mại tự động để tránh sai cam kết.",
];

const warningLeadVariants = [
  "Lưu ý dễ nhầm:",
  "Điểm cần tránh:",
  "Cảnh báo kỹ thuật:",
];

const truckClusterOptions = [
  "Bánh xe",
  "Máy phát",
  "Puly tăng",
  "Lốc lạnh",
  "Hộp số",
];

const spindleClusterOptions = [
  "Ổ trước spindle",
  "Ổ sau spindle",
  "Puly truyền",
  "Cụm phớt",
  "Chưa rõ vị trí",
];

const pumpClusterOptions = [
  "Ổ trục bơm",
  "Puly bơm",
  "Cụm phớt",
  "Khớp nối",
  "Chưa rõ vị trí",
];

const genericEvidenceOptions = [
  "Xác nhận cụm lắp",
  "Có mã cũ hoặc ảnh tem",
  "Có kích thước chính",
  "Mô tả điều kiện vận hành",
];

const salesHandoffOptions = [
  "Gửi mã hoặc ảnh tem",
  "Cho biết số lượng",
  "Cho biết khu vực giao",
  "Để lại thông tin liên hệ",
];

const fieldLabelMap: Record<string, string> = {
  application_detail: "cụm máy đang dùng",
  dimensions: "kích thước cốt/ngoài/dày",
  id: "đường kính trong",
  od: "đường kính ngoài",
  width: "bề rộng",
  thickness: "bề dày",
  shaft_diameter: "kích thước cốt trục",
  shaft: "kích thước cốt trục",
  code: "mã cũ trên tem",
  old_code: "mã cũ",
  shaft_size: "kích thước cốt",
  seal_type: "kiểu chặn",
  seal_or_shield: "kiểu che chắn (2RS, ZZ…)",
  housing_type: "kiểu gối đỡ",
  pitch: "bước xích",
  chain_type: "loại xích",
  links: "số mắt xích",
  profile: "profile dây",
  length: "chiều dài",
  lip_type: "kiểu môi phớt",
  seat_size: "kích thước vỏ",
  quantity: "số lượng",
  delivery_area: "khu vực giao",
  contact_info: "tên công ty hoặc số điện thoại",
};

const suggestedOptionMap: Record<string, string> = {
  exact_code: "Có mã cũ trên tem",
  image_of_label: "Có ảnh tem hoặc ảnh mẫu cũ",
  old_code: "Có mã cũ trên tem",
  dimensions: "Có kích thước cốt/ngoài/dày",
  application_detail: "Mô tả cụm máy đang dùng",
  machine_subsystem: "Mô tả vị trí cần thay",
  machine_type: "Cho biết hệ máy",
  urgency: "Đang thay gấp",
  equivalent: "Cần phương án tương đương",
  quantity: "Cho biết số lượng",
  delivery_area: "Cho biết khu vực giao",
  contact_info: "Để lại tên công ty hoặc số điện thoại",
};

function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hashText(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}

function pickVariant(variants: string[], seed: string): string {
  if (variants.length === 0) {
    return "";
  }

  return variants[hashText(seed) % variants.length];
}

function cleanLine(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }

  const cleaned = text
    .replace(/^[-*•\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}

function splitIntoLines(value: string | null | undefined): string[] {
  if (!value || value.trim().length === 0) {
    return [];
  }

  const roughLines = value
    .replace(/\r/g, "\n")
    .trim()
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.;])\s+(?=[A-ZÀ-ỹa-zà-ỹ0-9])/))
    .map((line) => cleanLine(line))
    .filter((line): line is string => Boolean(line));

  return Array.from(new Set(roughLines));
}

function mapMissingFields(fields: string[]): string[] {
  return Array.from(new Set(fields.map((field) => fieldLabelMap[field] ?? field)));
}

function mapSuggestedOptions(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => suggestedOptionMap[value] ?? value)));
}

function formatWarning(warning: string | null, seed: string): string[] {
  const cleaned = cleanLine(warning);
  if (!cleaned) {
    return [];
  }

  const normalized = normalizeText(cleaned);
  if (normalized.startsWith("khong nen")) {
    return [cleaned];
  }

  return [`${pickVariant(warningLeadVariants, seed)} ${cleaned}`];
}

function toSection(title: string, lines: string[], maxItems: number): string[] {
  const sectionLines = lines
    .map((line) => cleanLine(line))
    .filter((line): line is string => Boolean(line))
    .slice(0, maxItems);

  if (sectionLines.length === 0) {
    return [];
  }

  return [title + ":", ...sectionLines.map((line) => `- ${line}`)];
}

type ReplySection = { title: string; lines: string[]; max: number };

function composeStructuredReply(sections: ReplySection[]): string {
  const blocks: string[] = [];

  for (const section of sections) {
    const rendered = toSection(section.title, section.lines, section.max);
    if (rendered.length === 0) {
      continue;
    }

    if (blocks.length > 0) {
      blocks.push("");
    }

    blocks.push(...rendered);
  }

  return blocks.join("\n");
}

function looksLikeTruckContext(payload: AssistantStructuredResponse, latestUserText: string): boolean {
  const normalized = normalizeText(latestUserText);

  return (
    normalized.includes("hino") ||
    normalized.includes("4hk1") ||
    normalized.includes("xe tai") ||
    payload.machine_type === "truck"
  );
}

function looksLikeSpindleContext(payload: AssistantStructuredResponse, latestUserText: string): boolean {
  const normalized = normalizeText(latestUserText);

  return (
    normalized.includes("spindle") ||
    normalized.includes("cnc") ||
    payload.machine_type === "cnc" ||
    payload.machine_subsystem === "spindle"
  );
}

function looksLikePumpContext(payload: AssistantStructuredResponse, latestUserText: string): boolean {
  const normalized = normalizeText(latestUserText);

  return (
    normalized.includes("may bom") ||
    normalized.includes("bom") ||
    payload.machine_type === "pump" ||
    payload.symptom.length > 0
  );
}

function inferQuestion(
  payload: AssistantStructuredResponse,
  latestUserText: string,
  missingLabels: string[]
): string[] {
  if (looksLikeTruckContext(payload, latestUserText)) {
    return ["Cụm đang kiểm tra là bánh xe, máy phát, puly tăng, lốc lạnh hay hộp số?"];
  }

  if (looksLikeSpindleContext(payload, latestUserText)) {
    return ["Vị trí trên spindle — ổ trước, ổ sau, puly truyền hay cụm phớt?"];
  }

  if (looksLikePumpContext(payload, latestUserText)) {
    return ["Nóng/kêu rõ nhất ở ổ trục, puly hay phớt?"];
  }

  const nextQuestion = cleanLine(payload.next_question);
  if (nextQuestion) {
    return [nextQuestion];
  }

  if (missingLabels.length >= 2) {
    return [`Xác nhận giúp ${missingLabels[0]} và ${missingLabels[1]}.`];
  }

  if (missingLabels.length === 1) {
    return [`Cho biết thêm ${missingLabels[0]}.`];
  }

  return ["Xác nhận thêm vị trí lắp và điều kiện tải."];
}

function buildCandidateLines(payload: AssistantStructuredResponse, maxItems = 2): string[] {
  const items = payload.recommended_items.slice(0, maxItems);

  if (items.length === 0) {
    return [];
  }

  return items.map((item) => {
    const confidenceLabel =
      item.confidence === "high" ? "Khả năng cao" : item.confidence === "medium" ? "Khả năng trung bình" : "Khả năng thấp";
    const reason = cleanLine(item.reason);

    return `${confidenceLabel}: ${item.exact_code} (${item.brand})${reason ? `, căn cứ: ${reason}` : ""}.`;
  });
}

function fallbackSalesQuestion(payload: AssistantStructuredResponse): string[] {
  const nextQuestion = cleanLine(payload.next_question);
  if (nextQuestion) {
    return [nextQuestion];
  }

  return ["Gửi mã hoặc ảnh tem, số lượng và khu vực giao để em chuyển kinh doanh."];
}

function inferReplyGroup(input: BuildReplyInput): ReplyGroup {
  const route = input.intentRoute ?? null;
  const normalizedReply = normalizeText(input.payload.short_reply);

  const looksCommercialFromPayload =
    input.payload.final_status === "manual_review" &&
    (input.payload.missing_fields.includes("contact_info") ||
      input.payload.missing_fields.includes("delivery_area") ||
      normalizedReply.includes("kinh doanh") ||
      normalizedReply.includes("bao gia") ||
      normalizedReply.includes("ton kho") ||
      normalizedReply.includes("chiết khấu") ||
      normalizedReply.includes("chiet khau") ||
      normalizedReply.includes("giao hang") ||
      normalizedReply.includes("lead time"));

  if ((route && isCommercialIntentRoute(route)) || route === "contact_handoff" || looksCommercialFromPayload) {
    return "sales_handoff";
  }

  if (route === "symptom_diagnosis" || input.payload.symptom.length > 0) {
    return "technical_followup";
  }

  const confidence = inferInternalConfidenceLabel(input.payload);

  if (confidence === "high" && input.payload.recommended_items.length > 0) {
    return "high_confidence_match";
  }

  if (
    (confidence === "medium" && input.payload.recommended_items.length > 0) ||
    input.payload.final_status === "not_found_in_system"
  ) {
    return "medium_confidence_assessment";
  }

  return "preliminary_assessment";
}

function inferOptions(
  payload: AssistantStructuredResponse,
  latestUserText: string,
  group: ReplyGroup
): BuiltReplyMessage | null {
  if (group === "sales_handoff") {
    const mappedSuggested = mapSuggestedOptions(payload.suggested_options);
    const options = mappedSuggested.length >= 2 ? mappedSuggested.slice(0, 5) : salesHandoffOptions;

    return {
      options,
      optionStyle: "stacked",
      text: "",
    };
  }

  if (looksLikeTruckContext(payload, latestUserText)) {
    return { options: truckClusterOptions, optionStyle: "chips", text: "" };
  }

  if (looksLikeSpindleContext(payload, latestUserText)) {
    return { options: spindleClusterOptions, optionStyle: "chips", text: "" };
  }

  if (group === "technical_followup") {
    return { options: pumpClusterOptions, optionStyle: "chips", text: "" };
  }

  const mappedSuggested = mapSuggestedOptions(payload.suggested_options);
  if (mappedSuggested.length >= 2) {
    return {
      options: mappedSuggested.slice(0, 5),
      optionStyle: mappedSuggested.length > 4 ? "stacked" : "chips",
      text: "",
    };
  }

  if (payload.final_status === "needs_more_info" || payload.final_status === "not_found_in_system") {
    return {
      options: genericEvidenceOptions,
      optionStyle: "chips",
      text: "",
    };
  }

  return null;
}

function buildSalesHandoffReply(input: BuildReplyInput): BuiltReplyMessage {
  const seed = `${input.payload.short_reply}-${input.latestUserText ?? ""}-sales`;
  const shortReplyLines = splitIntoLines(input.payload.short_reply);
  const quick = shortReplyLines.length > 0 ? shortReplyLines.slice(0, 2) : [pickVariant(salesLeadVariants, seed)];

  const confirm = fallbackSalesQuestion(input.payload);
  const optionPack = inferOptions(input.payload, input.latestUserText ?? "", "sales_handoff");

  return {
    text: composeStructuredReply([
      { title: "Nhận định nhanh", lines: quick, max: 2 },
      { title: "Cần chốt thêm", lines: [...confirm, "Giá, tồn kho và lead time cần kinh doanh xác nhận riêng."], max: 3 },
    ]),
    options: optionPack?.options,
    optionStyle: optionPack?.optionStyle,
    group: "sales_handoff",
    internal_confidence: inferInternalConfidenceLabel(input.payload),
    showContactCta: true,
  };
}

function buildHighConfidenceMatchReply(input: BuildReplyInput): BuiltReplyMessage {
  const seed = `${input.payload.short_reply}-${input.latestUserText ?? ""}-high`;
  const missingLabels = mapMissingFields(input.payload.missing_fields);

  const shortReplyLines = splitIntoLines(input.payload.short_reply);
  const quick = shortReplyLines.length > 0 ? shortReplyLines.slice(0, 2) : [pickVariant(highConfidenceLeadVariants, seed)];

  const candidateLines = buildCandidateLines(input.payload, 2);
  const candidate = candidateLines.length > 0 ? candidateLines : ["Hướng mã hiện tại phù hợp với cụm đang kiểm tra."];

  const confirm = inferQuestion(input.payload, input.latestUserText ?? "", missingLabels);
  const warning = formatWarning(input.payload.avoid_recommendation, seed);
  const optionPack = inferOptions(input.payload, input.latestUserText ?? "", "high_confidence_match");

  return {
    text: composeStructuredReply([
      { title: "Khả năng cao", lines: quick, max: 3 },
      { title: "Mã / hướng khả dĩ", lines: candidate, max: 3 },
      { title: "Cần chốt thêm", lines: [...confirm, ...warning], max: 2 },
    ]),
    options: optionPack?.options,
    optionStyle: optionPack?.optionStyle,
    group: "high_confidence_match",
    internal_confidence: "high",
  };
}

function buildMediumConfidenceReply(input: BuildReplyInput): BuiltReplyMessage {
  const seed = `${input.payload.short_reply}-${input.latestUserText ?? ""}-medium`;
  const missingLabels = mapMissingFields(input.payload.missing_fields);

  const shortReplyLines = splitIntoLines(input.payload.short_reply);
  const quick = shortReplyLines.length > 0 ? shortReplyLines.slice(0, 2) : [pickVariant(mediumConfidenceLeadVariants, seed)];

  let candidate = buildCandidateLines(input.payload, 2);
  if (candidate.length === 0 && input.payload.final_status === "not_found_in_system") {
    candidate = ["Chưa thấy mã trùng trong danh mục nội bộ, cần đối chiếu theo cụm hoặc kích thước."];
  }

  if (candidate.length === 0) {
    candidate = ["Đang khoanh theo pattern gần nhất, chưa chốt vội."];
  }

  const confirm = inferQuestion(input.payload, input.latestUserText ?? "", missingLabels);
  const warning = formatWarning(input.payload.avoid_recommendation, seed);
  const optionPack = inferOptions(input.payload, input.latestUserText ?? "", "medium_confidence_assessment");

  return {
    text: composeStructuredReply([
      { title: "Nhận định nhanh", lines: quick, max: 3 },
      { title: "Mã / hướng khả dĩ", lines: candidate, max: 3 },
      { title: "Cần chốt thêm", lines: [...confirm, ...warning], max: 2 },
    ]),
    options: optionPack?.options,
    optionStyle: optionPack?.optionStyle,
    group: "medium_confidence_assessment",
    internal_confidence: "medium",
  };
}

function buildTechnicalFollowupReply(input: BuildReplyInput): BuiltReplyMessage {
  const seed = `${input.payload.short_reply}-${input.latestUserText ?? ""}-tech`;
  const missingLabels = mapMissingFields(input.payload.missing_fields);

  const shortReplyLines = splitIntoLines(input.payload.short_reply);
  const quick = shortReplyLines.length > 0 ? shortReplyLines.slice(0, 2) : [pickVariant(technicalHandoffLeadVariants, seed)];

  let candidate = buildCandidateLines(input.payload, 2);
  if (candidate.length === 0) {
    candidate = [
      "Ưu tiên kiểm tra bôi trơn, đồng trục và khe hở cụm quay trước khi đổi mã.",
    ];
  }

  const confirm = inferQuestion(input.payload, input.latestUserText ?? "", missingLabels);
  const warning = formatWarning(input.payload.avoid_recommendation, seed);
  const optionPack = inferOptions(input.payload, input.latestUserText ?? "", "technical_followup");

  return {
    text: composeStructuredReply([
      { title: "Nhận định nhanh", lines: quick, max: 3 },
      { title: "Mã / hướng khả dĩ", lines: candidate, max: 3 },
      { title: "Cần chốt thêm", lines: [...confirm, ...warning], max: 2 },
    ]),
    options: optionPack?.options,
    optionStyle: optionPack?.optionStyle,
    group: "technical_followup",
    internal_confidence: inferInternalConfidenceLabel(input.payload),
  };
}

function buildPreliminaryAssessmentReply(input: BuildReplyInput): BuiltReplyMessage {
  const seed = `${input.payload.short_reply}-${input.latestUserText ?? ""}-preliminary`;
  const missingLabels = mapMissingFields(input.payload.missing_fields);

  const shortReplyLines = splitIntoLines(input.payload.short_reply);
  const quick = shortReplyLines.length > 0 ? shortReplyLines.slice(0, 2) : [pickVariant(preliminaryLeadVariants, seed)];

  let candidate = buildCandidateLines(input.payload, 2);
  if (candidate.length === 0) {
    candidate = ["Khoanh theo nhóm ứng dụng phù hợp để đối chiếu tiếp."];
  }

  const confirm = inferQuestion(input.payload, input.latestUserText ?? "", missingLabels);
  const warning = formatWarning(input.payload.avoid_recommendation, seed);
  const optionPack = inferOptions(input.payload, input.latestUserText ?? "", "preliminary_assessment");

  return {
    text: composeStructuredReply([
      { title: "Nhận định nhanh", lines: quick, max: 3 },
      { title: "Mã / hướng khả dĩ", lines: candidate, max: 3 },
      { title: "Cần chốt thêm", lines: [...confirm, ...warning], max: 2 },
    ]),
    options: optionPack?.options,
    optionStyle: optionPack?.optionStyle,
    group: "preliminary_assessment",
    internal_confidence: inferInternalConfidenceLabel(input.payload),
  };
}

/* ── Conversational reply builders (no API needed) ── */

const greetingVariants = [
  "Chào anh/chị! THL hỗ trợ đối chiếu NTN, Tsubaki và vật tư truyền động theo mã cũ, ảnh tem hoặc cụm máy.",
  "Chào ạ! Anh/chị gửi mã cũ, ảnh tem hoặc mô tả cụm máy để THL khoanh đúng nhóm vật tư.",
  "Em chào, mình có thể bắt đầu từ mã cũ, kích thước hoặc vị trí lắp trên cụm máy ạ.",
];

const gratitudeVariants = [
  "Dạ không có gì ạ! Anh/chị cần đối chiếu thêm mã hoặc cụm máy nào cứ gửi nhé.",
  "Rất vui hỗ trợ được ạ. Nếu cần kiểm tra thêm mã hay ứng dụng khác, cứ nhắn em.",
  "Dạ, anh/chị cần đối chiếu thêm gì thì cứ gửi mã hoặc ảnh tem ạ.",
];

const smalltalkVariants = [
  "Dạ, THL hỗ trợ NTN, Tsubaki và nhóm vật tư truyền động theo cụm máy. Anh/chị đang cần kiểm tra gì ạ?",
  "THL đối chiếu vật tư theo ứng dụng cụm máy. Anh/chị gửi mã cũ hoặc mô tả máy để em hỗ trợ nhé.",
  "Dạ có ạ! Mình có thể bắt đầu từ mã cũ, kích thước hoặc ảnh tem.",
];

const unclearOpeningVariants = [
  "Em chưa rõ nhu cầu cụ thể. Anh/chị gửi mã cũ, ảnh tem hoặc mô tả cụm máy để em hỗ trợ nhé.",
  "Anh/chị cho em thêm thông tin — mã cần tra, kích thước hoặc cụm máy đang kiểm tra ạ?",
];

export type ConversationalIntentRoute = "greeting" | "gratitude" | "smalltalk" | "unclear_opening";

export function isConversationalIntent(route: string): route is ConversationalIntentRoute {
  return route === "greeting" || route === "gratitude" || route === "smalltalk" || route === "unclear_opening";
}

export function buildConversationalReply(route: ConversationalIntentRoute, userText: string): BuiltReplyMessage {
  const seed = `${route}-${userText}`;

  switch (route) {
    case "greeting":
      return {
        text: pickVariant(greetingVariants, seed),
        group: "greeting_reply",
      };
    case "gratitude":
      return {
        text: pickVariant(gratitudeVariants, seed),
        group: "greeting_reply",
      };
    case "smalltalk":
      return {
        text: pickVariant(smalltalkVariants, seed),
        group: "smalltalk_reply",
      };
    case "unclear_opening":
      return {
        text: pickVariant(unclearOpeningVariants, seed),
        group: "smalltalk_reply",
      };
  }
}

/* ── Main reply dispatcher ── */

export function buildAssistantReplyMessage(input: BuildReplyInput): BuiltReplyMessage {
  const group = inferReplyGroup(input);

  if (group === "sales_handoff") {
    return buildSalesHandoffReply(input);
  }

  if (group === "high_confidence_match") {
    return buildHighConfidenceMatchReply(input);
  }

  if (group === "medium_confidence_assessment") {
    return buildMediumConfidenceReply(input);
  }

  if (group === "technical_followup") {
    return buildTechnicalFollowupReply(input);
  }

  return buildPreliminaryAssessmentReply(input);
}

const errorRecoveryOptions = [
  "Thử lại",
  "Gửi ảnh tem",
  "Mô tả theo máy",
  "Để lại số điện thoại",
];

export function buildErrorFallbackMessage(input: {
  latestUserText: string;
  intentRoute?: AssistantIntentRoute | null;
}): BuiltReplyMessage {
  const userText = (input.latestUserText ?? "").trim();
  const extractedCode = userText.match(/\b(\d{3,5}[A-Za-z]{0,4})\b/)?.[1] ?? null;
  const isSimpleCode = /^\s*\d{3,5}[A-Za-z]{0,4}\s*$/.test(userText);

  if (isSimpleCode && extractedCode) {
    return {
      text: [
        `Em đã ghi nhận mã ${extractedCode}.`,
        "Hiện hệ thống đối chiếu đang gián đoạn ngắn.",
        "Anh/chị có thể gửi thêm ảnh tem hoặc thương hiệu mong muốn để THL đối chiếu tiếp.",
      ].join("\n"),
      options: errorRecoveryOptions,
      optionStyle: "stacked",
    };
  }

  return {
    text: [
      "Hệ thống đối chiếu đang gián đoạn ngắn.",
      "Anh/chị có thể thử lại hoặc gửi thêm thông tin để em hỗ trợ khi hệ thống khôi phục.",
    ].join("\n"),
    options: errorRecoveryOptions,
    optionStyle: "stacked",
  };
}
