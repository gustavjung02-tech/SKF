import applicationRulesData from "@/data/catalog/application-rules.json";

export type InputStyle = "full_sentence" | "fragment" | "shorthand" | "code_only" | "greeting";
export type UrgencyLevel = "low" | "medium" | "high" | null;
export type BuyingMotive =
  | "urgent_replacement"
  | "exact_match"
  | "equivalent_option"
  | "cost_optimization"
  | "brand_specific"
  | "price_check"
  | "technical_consult"
  | null;

export type AssistantIntentRoute =
  | "code_lookup"
  | "symptom_diagnosis"
  | "equivalent_lookup"
  | "replacement_equivalent"
  | "pricing_request"
  | "stock_request"
  | "lead_time_request"
  | "discount_request"
  | "order_request"
  | "contact_handoff"
  | "greeting"
  | "gratitude"
  | "smalltalk"
  | "unclear_opening";

export type ParsedIntent = {
  raw_text: string;
  normalized_text: string;
  intent_route: AssistantIntentRoute;
  input_style: InputStyle;
  extracted_code: string | null;
  machine_type: string | null;
  machine_subsystem: string | null;
  symptom: string[];
  urgency: UrgencyLevel;
  buying_motive: BuyingMotive;
  suggested_options: string[];
  matched_application_key: string | null;
  avoid_recommendation: string | null;
  next_question: string | null;
  is_ambiguous: boolean;
  should_trigger_discovery: boolean;
};

type KeywordMatcher = {
  target: string;
  keywords: string[];
};

const greetingKeywords = ["alo", "hello", "hi", "chao", "xin chao", "ad oi", "shop oi", "chao em", "chao ban", "hey"];

const gratitudeKeywords = ["cam on", "cảm ơn", "thanks", "thank", "ok cam on", "oke cam on", "nhieu lam"];

const smalltalkKeywords = [
  "co ho tro", "có hỗ trợ", "ben minh", "bên mình",
  "ban co the", "bạn có thể", "giup duoc khong", "giúp được không",
  "ho tro gi", "hỗ trợ gì", "tu van duoc khong", "tư vấn được không",
  "lam duoc gi", "làm được gì", "dich vu gi", "dịch vụ gì",
];

const machineMatchers: KeywordMatcher[] = [
  { target: "truck", keywords: ["xe tai", "xe tải", "hino", "4hk1", "4 hk1"] },
  { target: "cnc", keywords: ["cnc", "spindle", "cu duc", "củ đục"] },
  { target: "pump", keywords: ["may bom", "máy bơm", "pump"] },
  { target: "fan", keywords: ["quat", "quạt", "fan"] },
  { target: "gearbox", keywords: ["hop so", "hộp số", "gearbox"] },
  { target: "conveyor", keywords: ["bang tai", "băng tải", "conveyor"] },
  { target: "electric_motor", keywords: ["motor", "dong co", "động cơ"] },
  { target: "rotating_shaft", keywords: ["truc quay", "trục quay", "shaft"] },
  { target: "pillow_block_unit", keywords: ["goi do", "gối đỡ", "pillow block"] },
  { target: "oil_seal_application", keywords: ["phot", "phớt", "chan dau", "chặn dầu"] },
  { target: "chain_drive", keywords: ["xich", "xích", "chain"] },
];

const subsystemMatchers: KeywordMatcher[] = [
  { target: "truck_wheel", keywords: ["banh xe", "bánh xe", "wheel"] },
  { target: "alternator", keywords: ["may phat", "máy phát", "alternator"] },
  { target: "idler_pulley", keywords: ["puly tang", "puly tăng", "idler", "tensioner"] },
  { target: "ac_compressor", keywords: ["loc lanh", "lốc lạnh", "ac"] },
  { target: "gearbox", keywords: ["hop so", "hộp số", "gearbox"] },
  { target: "spindle", keywords: ["spindle", "cu duc", "củ đục"] },
  { target: "bearing_unit", keywords: ["vong bi", "vòng bi", "goi do", "gối đỡ"] },
  { target: "seal_unit", keywords: ["phot", "phớt", "chan dau", "chặn dầu"] },
  { target: "chain_stage", keywords: ["xich", "xích"] },
  { target: "drive_shaft", keywords: ["truc quay", "trục quay"] },
];

const symptomMatchers: KeywordMatcher[] = [
  { target: "hú", keywords: ["hu", "hú"] },
  { target: "rít", keywords: ["rit", "rít"] },
  { target: "kêu", keywords: ["keu", "kêu"] },
  { target: "nóng", keywords: ["nong", "nóng"] },
  { target: "phát nhiệt", keywords: ["phat nhiet", "phát nhiệt"] },
  { target: "rung", keywords: ["rung"] },
  { target: "lắc", keywords: ["lac", "lắc"] },
  { target: "rò dầu", keywords: ["ro dau", "rò dầu"] },
  { target: "chảy mỡ", keywords: ["chay mo", "chảy mỡ"] },
  { target: "mòn", keywords: ["mon", "mòn"] },
  { target: "chạy không ổn", keywords: ["chay khong on", "chạy không ổn"] },
];

const urgencyMatchers: Array<{ level: Exclude<UrgencyLevel, null>; keywords: string[] }> = [
  { level: "high", keywords: ["gap", "gấp", "can lien", "cần liền", "dung may", "dừng máy", "chay ca", "chạy ca", "thay ngay", "thay gấp"] },
  { level: "medium", keywords: ["som", "sớm", "sap den ky", "sắp đến kỳ"] },
  { level: "low", keywords: ["tham khao", "tham khảo", "de phong", "dự phòng"] },
];

const buyingMotiveMatchers: Array<{ motive: Exclude<BuyingMotive, null>; keywords: string[] }> = [
  { motive: "exact_match", keywords: ["dung ma", "đúng mã", "chot dung ma", "chốt đúng mã"] },
  { motive: "equivalent_option", keywords: ["tuong duong", "tương đương", "thay the", "thay thế"] },
  { motive: "cost_optimization", keywords: ["toi uu chi phi", "tối ưu chi phí", "chi phi", "chi phí"] },
  { motive: "brand_specific", keywords: ["dung hang", "đúng hãng", "ntn", "koyo", "tsubaki", "soho", "nok"] },
  { motive: "price_check", keywords: ["hoi gia", "hỏi giá", "tham khao gia", "tham khảo giá"] },
  { motive: "technical_consult", keywords: ["tu van ky thuat", "tư vấn kỹ thuật", "coi giup", "coi giúp"] },
  { motive: "urgent_replacement", keywords: ["thay gap", "thay gấp", "can lien", "cần liền", "dung may", "dừng máy"] },
];

const pricingRequestKeywords = [
  "bao gia",
  "báo giá",
  "gia bao nhieu",
  "giá bao nhiêu",
  "xin gia",
  "xin giá",
  "quote",
  "don gia",
  "đơn giá",
  "gia tot",
  "giá tốt",
];

const leadTimeRequestKeywords = [
  "bao lau",
  "bao lâu",
  "may ngay",
  "mấy ngày",
  "khi nao giao",
  "khi nào giao",
  "thoi gian giao",
  "thời gian giao",
  "lead time",
  "giao trong ngay",
  "giao trong ngày",
  "giao ngay",
  "ship nhanh",
];

const discountRequestKeywords = [
  "chiet khau",
  "chiết khấu",
  "gia tot",
  "giá tốt",
  "deal gia",
  "deal giá",
  "uu dai",
  "ưu đãi",
  "giam gia",
  "giảm giá",
  "gia si",
  "giá sỉ",
];

const stockRequestKeywords = [
  "co hang",
  "có hàng",
  "con hang",
  "còn hàng",
  "san hang",
  "sẵn hàng",
  "ton kho",
  "tồn kho",
  "lay lien",
  "lấy liền",
  "co san",
  "có sẵn",
];

const orderRequestKeywords = [
  "dat hang",
  "đặt hàng",
  "chot don",
  "chốt đơn",
  "len don",
  "lên đơn",
  "mua ngay",
  "chot ma",
  "chốt mã",
  "gui don",
  "gửi đơn",
];

const contactHandoffKeywords = [
  "goi lai",
  "gọi lại",
  "lien he",
  "liên hệ",
  "zalo",
  "so dien thoai",
  "số điện thoại",
  "ten cong ty",
  "tên công ty",
  "kinh doanh",
];

const replacementIntentKeywords = [
  "tuong duong",
  "tương đương",
  "thay the",
  "thay thế",
  "doi ma",
  "đổi mã",
  "equivalent",
];

const codeLookupHints = [
  "vong bi",
  "vòng bi",
  "goi do",
  "gối đỡ",
  "day curoa",
  "dây curoa",
  "xich",
  "xích",
  "tsubaki",
  "soho",
  "ntn",
  "nok",
  "koyo",
];

function stripDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-zA-Z0-9\s/.-]/g, " ");
}

function normalizeText(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string): string[] {
  return input.split(" ").filter(Boolean);
}

function includesKeyword(text: string, keyword: string): boolean {
  return text.includes(normalizeText(keyword));
}

function hasAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => includesKeyword(text, keyword));
}

function firstMatch(text: string, matchers: KeywordMatcher[]): string | null {
  for (const matcher of matchers) {
    if (matcher.keywords.some((keyword) => includesKeyword(text, keyword))) {
      return matcher.target;
    }
  }

  return null;
}

function collectMatches(text: string, matchers: KeywordMatcher[]): string[] {
  return matchers
    .filter((matcher) => matcher.keywords.some((keyword) => includesKeyword(text, keyword)))
    .map((matcher) => matcher.target);
}

function detectCodeOnly(text: string, tokenCount: number): boolean {
  const codeCandidate = text.replace(/\s+/g, "");
  const looksLikeCode = /^[a-z0-9./-]+$/i.test(codeCandidate) && /\d/.test(codeCandidate) && /[a-z]/i.test(codeCandidate);

  return looksLikeCode && tokenCount <= 4;
}

function detectGreeting(normalizedText: string, tokenCount: number): boolean {
  if (tokenCount === 0) {
    return false;
  }

  if (tokenCount <= 4 && greetingKeywords.some((keyword) => includesKeyword(normalizedText, keyword))) {
    return true;
  }

  return false;
}

function detectGratitude(normalizedText: string, tokenCount: number): boolean {
  return tokenCount <= 6 && gratitudeKeywords.some((keyword) => includesKeyword(normalizedText, keyword));
}

function detectSmalltalk(normalizedText: string, tokenCount: number): boolean {
  return tokenCount <= 10 && smalltalkKeywords.some((keyword) => includesKeyword(normalizedText, keyword));
}

function detectInputStyle(rawText: string, normalizedText: string): InputStyle {
  const tokenCount = tokenize(normalizedText).length;

  if (detectGreeting(normalizedText, tokenCount)) {
    return "greeting";
  }

  if (detectCodeOnly(normalizedText, tokenCount)) {
    return "code_only";
  }

  if (tokenCount <= 4) {
    const hasNumber = /\d/.test(normalizedText);
    return hasNumber ? "shorthand" : "fragment";
  }

  if (!/[,.!?]/.test(rawText) && tokenCount <= 8) {
    return "fragment";
  }

  return "full_sentence";
}

function extractLikelyCode(normalizedText: string): string | null {
  const codeRegex = /\b[a-z]{0,4}\d{2,}[a-z0-9./-]*\b/gi;
  const matched = normalizedText.match(codeRegex);

  if (!matched || matched.length === 0) {
    return null;
  }

  return matched[0].toUpperCase();
}

function detectUrgency(normalizedText: string): UrgencyLevel {
  for (const item of urgencyMatchers) {
    if (item.keywords.some((keyword) => includesKeyword(normalizedText, keyword))) {
      return item.level;
    }
  }

  return null;
}

function detectBuyingMotive(normalizedText: string, urgency: UrgencyLevel): BuyingMotive {
  for (const item of buyingMotiveMatchers) {
    if (item.keywords.some((keyword) => includesKeyword(normalizedText, keyword))) {
      return item.motive;
    }
  }

  if (urgency === "high") {
    return "urgent_replacement";
  }

  return null;
}

function detectIntentRouteFromSignals(input: {
  normalizedText: string;
  extractedCode: string | null;
  machineType: string | null;
  machineSubsystem: string | null;
  symptom: string[];
  buyingMotive: BuyingMotive;
}): AssistantIntentRoute {
  if (hasAnyKeyword(input.normalizedText, discountRequestKeywords)) {
    return "discount_request";
  }

  if (hasAnyKeyword(input.normalizedText, leadTimeRequestKeywords)) {
    return "lead_time_request";
  }

  if (hasAnyKeyword(input.normalizedText, pricingRequestKeywords) || input.buyingMotive === "price_check") {
    return "pricing_request";
  }

  if (hasAnyKeyword(input.normalizedText, stockRequestKeywords)) {
    return "stock_request";
  }

  if (hasAnyKeyword(input.normalizedText, orderRequestKeywords)) {
    return "order_request";
  }

  if (hasAnyKeyword(input.normalizedText, contactHandoffKeywords)) {
    return "contact_handoff";
  }

  if (hasAnyKeyword(input.normalizedText, replacementIntentKeywords) || input.buyingMotive === "equivalent_option") {
    return "equivalent_lookup";
  }

  if (input.symptom.length > 0 && !input.extractedCode) {
    return "symptom_diagnosis";
  }

  if (
    input.extractedCode ||
    input.machineType ||
    input.machineSubsystem ||
    hasAnyKeyword(input.normalizedText, codeLookupHints)
  ) {
    return "code_lookup";
  }

  /* Conversational intents — detected AFTER technical/commercial routes */
  const tokenCount = input.normalizedText.split(" ").filter(Boolean).length;

  if (detectGratitude(input.normalizedText, tokenCount)) {
    return "gratitude";
  }

  if (detectGreeting(input.normalizedText, tokenCount)) {
    return "greeting";
  }

  if (detectSmalltalk(input.normalizedText, tokenCount)) {
    return "smalltalk";
  }

  if (tokenCount <= 5 && !input.extractedCode) {
    return "unclear_opening";
  }

  return "contact_handoff";
}

function buildNextQuestion(
  shouldTriggerDiscovery: boolean,
  machineType: string | null,
  machineSubsystem: string | null
): string | null {
  if (!shouldTriggerDiscovery) {
    return null;
  }

  if (machineType === "truck") {
    return "Anh/chị đang kiểm tra vòng bi ở cụm nào: bánh xe, máy phát, puly tăng, lốc lạnh hay hộp số?";
  }

  if (machineType === "cnc" || machineSubsystem === "spindle") {
    return "Anh/chị đang kiểm tra cụm nào trên spindle: ổ trước, ổ sau, puly truyền hay cụm phớt?";
  }

  if (machineType === "pump") {
    return "Em cần khoanh đúng cụm trước. Máy đang nóng ở ổ trục, puly hay vị trí phớt?";
  }

  return "Anh/chị đang có mã cũ hoặc ảnh tem không, hay mình mô tả theo cụm máy để em chốt nhanh?";
}

function inferByApplicationRule(normalizedText: string): {
  applicationKey: string | null;
  suggestedOptions: string[];
  avoidRecommendation: string | null;
} {
  for (const rule of applicationRulesData.rules) {
    const matchedSignals = rule.signals.filter((signal) => includesKeyword(normalizedText, signal));

    if (matchedSignals.length > 0) {
      return {
        applicationKey: rule.application_key,
        suggestedOptions: rule.required_fields,
        avoidRecommendation: rule.avoid_notes[0] ?? null,
      };
    }
  }

  return {
    applicationKey: null,
    suggestedOptions: [],
    avoidRecommendation: null,
  };
}

export function parseIntentInput(input: string): ParsedIntent {
  const rawText = input.trim();
  const normalizedText = normalizeText(rawText);
  const inputStyle = detectInputStyle(rawText, normalizedText);
  const machineType = firstMatch(normalizedText, machineMatchers);
  const machineSubsystem = firstMatch(normalizedText, subsystemMatchers);
  const symptom = collectMatches(normalizedText, symptomMatchers);
  const urgency = detectUrgency(normalizedText);
  const buyingMotive = detectBuyingMotive(normalizedText, urgency);
  const extractedCode = extractLikelyCode(normalizedText);
  const appRule = inferByApplicationRule(normalizedText);
  const intentRoute = detectIntentRouteFromSignals({
    normalizedText,
    extractedCode,
    machineType,
    machineSubsystem,
    symptom,
    buyingMotive,
  });

  const hasStrongSignal = Boolean(extractedCode || machineType || symptom.length > 0);
  const isAmbiguous = inputStyle === "greeting" || (!hasStrongSignal && tokenize(normalizedText).length <= 8);

  const isCommercialRoute =
    intentRoute === "pricing_request" ||
    intentRoute === "stock_request" ||
    intentRoute === "lead_time_request" ||
    intentRoute === "discount_request" ||
    intentRoute === "order_request";

  const isConversationalRoute =
    intentRoute === "greeting" ||
    intentRoute === "gratitude" ||
    intentRoute === "smalltalk" ||
    intentRoute === "unclear_opening";

  const shouldTriggerDiscovery =
    !isCommercialRoute &&
    !isConversationalRoute &&
    (inputStyle === "greeting" ||
      ((inputStyle === "fragment" || inputStyle === "shorthand") && !hasStrongSignal) ||
      (isAmbiguous && extractedCode === null));

  const nextQuestion = buildNextQuestion(shouldTriggerDiscovery, machineType, machineSubsystem);

  return {
    raw_text: rawText,
    normalized_text: normalizedText,
    intent_route: intentRoute,
    input_style: inputStyle,
    extracted_code: extractedCode,
    machine_type: machineType,
    machine_subsystem: machineSubsystem,
    symptom,
    urgency,
    buying_motive: buyingMotive,
    suggested_options: appRule.suggestedOptions,
    matched_application_key: appRule.applicationKey,
    avoid_recommendation: appRule.avoidRecommendation,
    next_question: nextQuestion,
    is_ambiguous: isAmbiguous,
    should_trigger_discovery: shouldTriggerDiscovery,
  };
}

export function mergeParsedSignals(base: ParsedIntent, incoming: ParsedIntent): ParsedIntent {
  const normalized_text = [base.normalized_text, incoming.normalized_text].filter(Boolean).join(" | ");
  const extracted_code = base.extracted_code ?? incoming.extracted_code;
  const machine_type = base.machine_type ?? incoming.machine_type;
  const machine_subsystem = base.machine_subsystem ?? incoming.machine_subsystem;
  const symptom = Array.from(new Set([...base.symptom, ...incoming.symptom]));
  const urgency = base.urgency ?? incoming.urgency;
  const buying_motive = base.buying_motive ?? incoming.buying_motive;
  const suggested_options = Array.from(new Set([...base.suggested_options, ...incoming.suggested_options]));
  const intent_route = detectIntentRouteFromSignals({
    normalizedText: normalized_text,
    extractedCode: extracted_code,
    machineType: machine_type,
    machineSubsystem: machine_subsystem,
    symptom,
    buyingMotive: buying_motive,
  });

  return {
    ...base,
    raw_text: [base.raw_text, incoming.raw_text].filter(Boolean).join(" | "),
    normalized_text,
    intent_route,
    input_style: base.input_style === "full_sentence" ? base.input_style : incoming.input_style,
    extracted_code,
    machine_type,
    machine_subsystem,
    symptom,
    urgency,
    buying_motive,
    suggested_options,
    matched_application_key: base.matched_application_key ?? incoming.matched_application_key,
    avoid_recommendation: base.avoid_recommendation ?? incoming.avoid_recommendation,
    next_question: base.next_question ?? incoming.next_question,
    is_ambiguous: base.is_ambiguous && incoming.is_ambiguous,
    should_trigger_discovery: base.should_trigger_discovery || incoming.should_trigger_discovery,
  };
}

export function buildParsedContextSummary(parsed: ParsedIntent): string {
  return [
    `input_style: ${parsed.input_style}`,
    `machine_type: ${parsed.machine_type ?? "null"}`,
    `machine_subsystem: ${parsed.machine_subsystem ?? "null"}`,
    `symptom: ${parsed.symptom.join(", ") || "null"}`,
    `urgency: ${parsed.urgency ?? "null"}`,
    `buying_motive: ${parsed.buying_motive ?? "null"}`,
    `suggested_options: ${parsed.suggested_options.join(", ") || "null"}`,
    `avoid_recommendation: ${parsed.avoid_recommendation ?? "null"}`,
  ].join("\n");
}
