import type { QuoteRequest } from "@/lib/quote-request";
import { findInternalPriceByNormalizedCode } from "@/lib/admin/price-master";
import { buildDefaultQuoteDraft, getAdminStatusLabel, hydrateQuoteDraft, normalizeAdminStatus, type AdminQuoteDraft, type AdminRfqDetail, type AdminRfqListItem } from "@/lib/admin/quote";

type SheetAction =
  | "create_rfq"
  | "list_rfqs"
  | "get_rfq"
  | "update_quote"
  | "save_quote"
  | "upsert_quote"
  | "update_status"
  | "set_status"
  | "update_rfq_status";

const SHEET_CONTEXT = {
  spreadsheetName: "SKF_Admin_Bao_Gia",
  tabs: {
    rfq: "YC_BAO_GIA",
    rfqItems: "CHI_TIET_YC",
    priceMaster: "BANG_GIA",
    quotes: "BAO_GIA",
    quoteItems: "CHI_TIET_BG",
  },
} as const;

function buildWebhookLogContext(action: SheetAction, payload: Record<string, unknown>) {
  return {
    action,
    rfqId: normalizeString(payload.rfq_id || payload.rfqId || payload.id || payload.requestId),
  };
}

function getWebhookUrl() {
  return process.env.GOOGLE_SHEET_WEBHOOK_URL?.trim() ?? "";
}

function getWebhookSecret() {
  return process.env.GOOGLE_SHEET_WEBHOOK_SECRET?.trim() ?? "";
}

function normalizeString(value: unknown, fallback = "") {
  return `${value ?? fallback}`.trim();
}

function normalizeLookupKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function pickValueByAliases(record: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (alias in record) {
      return record[alias];
    }
  }

  const normalizedMap = new Map<string, unknown>();
  for (const [key, value] of Object.entries(record)) {
    normalizedMap.set(normalizeLookupKey(key), value);
  }

  for (const alias of aliases) {
    const byNormalizedKey = normalizedMap.get(normalizeLookupKey(alias));
    if (byNormalizedKey !== undefined) {
      return byNormalizedKey;
    }
  }

  return undefined;
}

function normalizeDateString(value: unknown) {
  const safeValue = normalizeString(value);
  if (!safeValue) {
    return new Date().toISOString();
  }

  const parsed = new Date(safeValue);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function normalizeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function parseJsonString(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  const looksLikeJson =
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"));

  if (!looksLikeJson) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function normalizeUnknown(value: unknown): unknown {
  let current = value;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const next = parseJsonString(current);
    if (next === current) {
      break;
    }
    current = next;
  }

  return current;
}

function asRecord(value: unknown) {
  const normalized = normalizeUnknown(value);
  if (normalized && typeof normalized === "object" && !Array.isArray(normalized)) {
    return normalized as Record<string, unknown>;
  }

  return {} satisfies Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  const normalized = normalizeUnknown(value);
  if (Array.isArray(normalized)) {
    return normalized.map((item) => normalizeUnknown(item));
  }

  return [];
}

function pickFirstValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in record) {
      return normalizeUnknown(record[key]);
    }
  }

  return undefined;
}

function pickFirstRecord(record: Record<string, unknown>, keys: string[]) {
  const nested = pickFirstValue(record, keys);
  return asRecord(nested);
}

function pickFirstArray(record: Record<string, unknown>, keys: string[]) {
  const nested = pickFirstValue(record, keys);
  return asArray(nested);
}

function getIdentifier(record: Record<string, unknown>, keys = ["id", "rfqId", "rfq_id", "code", "ma_yeu_cau", "ma_bao_gia"]) {
  for (const key of keys) {
    const value = normalizeString(record[key]);
    if (value) {
      return value;
    }
  }

  return "";
}

function isSameIdentifier(record: Record<string, unknown>, expectedId: string, keys?: string[]) {
  if (!expectedId) {
    return false;
  }

  return getIdentifier(record, keys).toLowerCase() === expectedId.trim().toLowerCase();
}

function findRowByIdentifier(rows: unknown[], expectedId: string, keys?: string[]) {
  return rows
    .map((row) => asRecord(row))
    .find((row) => isSameIdentifier(row, expectedId, keys));
}

function pickTabRows(record: Record<string, unknown>, keys: string[]) {
  const directRows = pickFirstArray(record, keys);
  if (directRows.length > 0) {
    return directRows;
  }

  const nestedContainers = [
    pickFirstRecord(record, ["data", "payload", "result"]),
    pickFirstRecord(record, ["tabs", "sheetContext", "sheetData"]),
  ];

  for (const container of nestedContainers) {
    const rows = pickFirstArray(container, keys);
    if (rows.length > 0) {
      return rows;
    }
  }

  return [];
}

function normalizeQuoteLineSource(rawLine: unknown, fallbackItem?: { code: string; normalizedCode: string; name: string; quantity: number; unit: string; customerNote: string }) {
  const record = asRecord(rawLine);
  const code = normalizeString(record.code || record.productCode || record.sku || record.ma_hang, fallbackItem?.code ?? "");
  const normalizedCode = normalizeString(record.normalizedCode || record.normalized_code || record.ma_chuan || code, fallbackItem?.normalizedCode ?? code).toUpperCase();

  return {
    code: code || fallbackItem?.code || "",
    normalizedCode,
    name: normalizeString(record.name || record.productName || record.product_name || record.ten_san_pham, fallbackItem?.name ?? code),
    quantity: Math.max(1, Math.round(normalizeNumber(record.quantity || record.so_luong, fallbackItem?.quantity ?? 1))),
    unit: normalizeString(record.unit || record.don_vi, fallbackItem?.unit ?? "cai"),
    customerNote: normalizeString(record.customerNote || record.customer_note || record.ghi_chu_khach || record.note, fallbackItem?.customerNote ?? ""),
    internalPrice:
      record.internalPrice == null && record.internal_price == null && record.price == null && record.gia_noi_bo == null
        ? null
        : Math.max(0, Math.round(normalizeNumber(record.internalPrice || record.internal_price || record.price || record.gia_noi_bo, 0))),
    lineDiscountPercent: normalizeNumber(record.lineDiscountPercent || record.line_discount_percent || record.discountPercent || record.discount_percent || record.ck_dong_pt, 0),
    note: normalizeString(record.note || record.lineNote || record.line_note || record.ghi_chu),
  };
}

function buildQuoteSeed(rawQuote: unknown, rawQuoteItems: unknown[], detailItems: ReturnType<typeof normalizeQuoteRequestItem>[]) {
  const quoteRecord = asRecord(rawQuote);
  const inlineLineItems = pickFirstArray(quoteRecord, ["lineItems", "line_items", "items", "quoteItems", "quote_items", SHEET_CONTEXT.tabs.quoteItems]);

  if (inlineLineItems.length > 0) {
    return {
      ...quoteRecord,
      lineItems: inlineLineItems,
    };
  }

  if (rawQuoteItems.length === 0) {
    return quoteRecord;
  }

  const normalizedQuoteItems = rawQuoteItems.map((item) => asRecord(item));
  const orderedLineItems = detailItems.map((item, index) => {
    const match =
      normalizedQuoteItems.find((quoteItem) => {
        const normalizedCode = normalizeString(quoteItem.normalizedCode || quoteItem.normalized_code || quoteItem.ma_chuan).toUpperCase();
        const code = normalizeString(quoteItem.code || quoteItem.productCode || quoteItem.sku || quoteItem.ma_hang);
        return normalizedCode === item.normalizedCode || code === item.code;
      }) ??
      normalizedQuoteItems.find((quoteItem) => normalizeNumber(quoteItem.index || quoteItem.lineIndex || quoteItem.line_index || quoteItem.position, -1) === index);

    return normalizeQuoteLineSource(match, item);
  });

  return {
    ...quoteRecord,
    lineItems: orderedLineItems,
  };
}

function resolveRfqRows(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  return pickTabRows(record, ["rfqs", "rows", "items", SHEET_CONTEXT.tabs.rfq, "RFQ"]);
}

function resolveRfqRecord(payload: unknown, rfqId: string) {
  const record = asRecord(payload);
  const directRfq = pickFirstRecord(record, ["rfq", "request", "record", "item"]);
  if (Object.keys(directRfq).length > 0) {
    return directRfq;
  }

  const rfqRows = pickTabRows(record, [SHEET_CONTEXT.tabs.rfq, "RFQ", "rfqs", "rows", "items"]);
  const matchedRow = findRowByIdentifier(rfqRows, rfqId);
  if (matchedRow) {
    return matchedRow;
  }

  if (isSameIdentifier(record, rfqId) || Object.keys(record).some((key) => ["customer", "customerName", "createdAt", "status", "items"].includes(key))) {
    return record;
  }

  return {} satisfies Record<string, unknown>;
}

function resolveRfqItems(payload: unknown, rfqRecord: Record<string, unknown>, rfqId: string) {
  const inlineItems = pickFirstArray(rfqRecord, ["items", "rfqItems", "rfq_items", "lines", "products"]);
  if (inlineItems.length > 0) {
    return inlineItems;
  }

  const rootRecord = asRecord(payload);
  const rootItems = pickFirstArray(rootRecord, ["items", "rfqItems", "rfq_items", "lines", "products"]);
  if (rootItems.length > 0) {
    return rootItems.filter((row) => {
      const rowRecord = asRecord(row);
      return isSameIdentifier(rowRecord, rfqId, ["rfqId", "rfq_id", "requestId", "request_id", "id", "ma_yeu_cau"]);
    });
  }

  const allItemRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.rfqItems, "CHI_TIET_YC", "RFQ_ITEMS", "rfqItems", "rfq_items"]);
  return allItemRows.filter((row) => isSameIdentifier(asRecord(row), rfqId, ["rfqId", "rfq_id", "requestId", "request_id", "id", "ma_yeu_cau"]));
}

function resolveQuoteRecord(payload: unknown, rfqRecord: Record<string, unknown>, rfqId: string) {
  const directQuote = pickFirstRecord(rfqRecord, ["quote", "pricingDraft", "quoteDraft", "pricing", "pricing_draft"]);
  if (Object.keys(directQuote).length > 0) {
    return directQuote;
  }

  const rootRecord = asRecord(payload);
  const nestedQuote = pickFirstRecord(rootRecord, ["quote", "pricingDraft", "quoteDraft"]);
  if (Object.keys(nestedQuote).length > 0) {
    return nestedQuote;
  }

  const quoteRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.quotes, "BAO_GIA", "QUOTES", "quotes"]);
  return findRowByIdentifier(quoteRows, rfqId, ["rfqId", "rfq_id", "requestId", "request_id", "id", "ma_yeu_cau"]) ?? ({} satisfies Record<string, unknown>);
}

function resolveQuoteItems(payload: unknown, quoteRecord: Record<string, unknown>, rfqId: string) {
  const inlineQuoteItems = pickFirstArray(quoteRecord, ["lineItems", "line_items", "items", "quoteItems", "quote_items"]);
  if (inlineQuoteItems.length > 0) {
    return inlineQuoteItems;
  }

  const rootRecord = asRecord(payload);
  const allQuoteItemRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.quoteItems, "CHI_TIET_BG", "QUOTE_ITEMS", "quoteItems", "quote_items"]);
  if (allQuoteItemRows.length === 0) {
    return [];
  }

  const quoteId = getIdentifier(quoteRecord, ["id", "quoteId", "quote_id", "ma_bao_gia"]);

  return allQuoteItemRows.filter((row) => {
    const rowRecord = asRecord(row);
    return isSameIdentifier(rowRecord, quoteId, ["quoteId", "quote_id", "ma_bao_gia"]) || isSameIdentifier(rowRecord, rfqId, ["rfqId", "rfq_id", "requestId", "request_id", "ma_yeu_cau"]);
  });
}

function extractDataEnvelope<T>(payload: unknown): T {
  const normalized = normalizeUnknown(payload);

  if (Array.isArray(normalized)) {
    return normalized as T;
  }

  if (normalized && typeof normalized === "object") {
    const record = normalized as Record<string, unknown>;
    const wrapperKeys = ["data", "items", "rows", "values", "payload", "rfqs", "rfq", "result"];
    const metaKeys = ["ok", "status", "message", "error"];

    for (const key of wrapperKeys) {
      if (!(key in record)) {
        continue;
      }

      const nonMetaKeys = Object.keys(record).filter((entryKey) => !metaKeys.includes(entryKey));
      if (nonMetaKeys.length === 1 && nonMetaKeys[0] === key) {
        return extractDataEnvelope<T>(record[key]);
      }
    }
  }

  return normalized as T;
}

async function postSheetAction<T>(action: SheetAction, payload: Record<string, unknown>) {
  const webhookUrl = getWebhookUrl();
  const webhookSecret = getWebhookSecret();
  const logContext = buildWebhookLogContext(action, payload);

  if (!webhookUrl || !webhookSecret) {
    throw new Error("Missing Google Sheet webhook configuration.");
  }

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        action,
        secret: webhookSecret,
        sheetContext: SHEET_CONTEXT,
        payload,
        ...payload,
      }),
    });
  } catch (error) {
    console.error("[sheet-webhook] network failure", {
      ...logContext,
      message: error instanceof Error ? error.message : "Unknown network error",
    });
    throw error;
  }

  const rawText = await response.text();
  let json: unknown = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = rawText;
  }

  if (!response.ok) {
    const message =
      typeof json === "object" && json && "error" in (json as Record<string, unknown>)
        ? normalizeString((json as Record<string, unknown>).error, "Webhook error")
        : `Webhook request failed with status ${response.status}.`;

    console.error("[sheet-webhook] non-2xx response", {
      ...logContext,
      status: response.status,
      message,
    });
    throw new Error(message);
  }

  if (json && typeof json === "object" && "ok" in (json as Record<string, unknown>) && (json as Record<string, unknown>).ok === false) {
    const message = normalizeString((json as Record<string, unknown>).error, "Webhook returned an error.");
    console.warn("[sheet-webhook] business error", {
      ...logContext,
      message,
    });
    throw new Error(message);
  }

  return extractDataEnvelope<T>(json);
}

function normalizeQuoteRequestItem(rawItem: unknown) {
  const record = asRecord(rawItem);
  const code = normalizeString(pickValueByAliases(record, ["code", "productCode", "sku", "ma_hang", "ma_san_pham"]), "UNKNOWN");
  return {
    code,
    normalizedCode: normalizeString(pickValueByAliases(record, ["normalizedCode", "normalized_code", "ma_chuan"]) || code, code).toUpperCase(),
    name: normalizeString(pickValueByAliases(record, ["name", "productName", "product_name", "ten", "ten_san_pham"]) || code, code),
    productGroup: normalizeString(pickValueByAliases(record, ["productGroup", "product_group", "group", "nhom_hang"]), "SKF"),
    quantity: Math.max(1, Math.round(normalizeNumber(pickValueByAliases(record, ["quantity", "so_luong"]), 1))),
    unit: normalizeString(pickValueByAliases(record, ["unit", "don_vi"]), "cai"),
    customerNote: normalizeString(pickValueByAliases(record, ["customerNote", "customer_note", "note", "ghi_chu"])),
  };
}

async function withFallbackInternalPrices(detail: AdminRfqDetail) {
  const enrichedQuote: AdminQuoteDraft = {
    ...detail.quote,
    lineItems: await Promise.all(
      detail.quote.lineItems.map(async (line) => {
        if (line.internalPrice && line.internalPrice > 0) {
          return line;
        }

        const fallbackPrice = await findInternalPriceByNormalizedCode(line.normalizedCode);
        return {
          ...line,
          internalPrice: fallbackPrice,
        };
      }),
    ),
  };

  return {
    ...detail,
    quote: enrichedQuote,
  };
}

export async function createRemoteQuoteRequest(rfq: QuoteRequest) {
  const sheetStatusLabel = getAdminStatusLabel(rfq.status);
  const rfqForSheet = {
    ...rfq,
    status: sheetStatusLabel,
    statusCode: normalizeAdminStatus(rfq.status),
  };

  try {
    return await postSheetAction("create_rfq", { rfq: rfqForSheet });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const shouldRetry = message.includes("invalid rfq") || message.includes("invalid payload") || message.includes("missing") || message.includes("rfq");

    if (!shouldRetry) {
      throw error;
    }
  }

  try {
    return await postSheetAction("create_rfq", {
      ...rfqForSheet,
      rfqId: rfq.id,
      requestId: rfq.id,
      customer: rfq.customer,
      items: rfq.items,
      pricing: rfq.pricing,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (!message.includes("invalid")) {
      throw error;
    }
  }

  return postSheetAction("create_rfq", {
    request: rfqForSheet,
    data: rfqForSheet,
    payload: rfqForSheet,
    rfqId: rfq.id,
    requestId: rfq.id,
  });
}

export async function listAdminRfqs() {
  const rawList = await postSheetAction<unknown>("list_rfqs", {});
  const listRows = resolveRfqRows(rawList);
  const rootRecord = asRecord(rawList);
  const itemRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.rfqItems, "CHI_TIET_YC", "RFQ_ITEMS", "rfqItems", "rfq_items"]);
  const itemCountByRfqId = new Map<string, number>();

  for (const rawItem of itemRows) {
    const row = asRecord(rawItem);
    const parentId = getIdentifier(row, ["rfqId", "rfq_id", "requestId", "request_id", "id", "ma_yeu_cau"]);
    if (!parentId) {
      continue;
    }

    itemCountByRfqId.set(parentId, (itemCountByRfqId.get(parentId) ?? 0) + 1);
  }

  if (!Array.isArray(listRows)) {
    return [] satisfies AdminRfqListItem[];
  }

  return listRows.map((rawItem) => {
    const record = asRecord(rawItem);
    const customer = pickFirstRecord(record, ["customer", "customerInfo", "customer_info", "customerJson", "customer_json"]);
    const items = pickFirstArray(record, ["items", "rfqItems", "rfq_items"]);
    const id = normalizeString(pickValueByAliases(record, ["id", "rfqId", "rfq_id", "code", "ma_rfq", "ma_yeu_cau"]), "RFQ-UNKNOWN");

    const createdAtValue = pickValueByAliases(record, ["createdAt", "created_at", "date", "ngay_tao", "ngay_yeu_cau"]);
    const customerNameValue = pickValueByAliases(customer, ["name", "ten", "ten_khach_hang"]) ?? pickValueByAliases(record, ["customerName", "customer_name", "ten_khach_hang", "khach_hang"]);
    const customerPhoneValue = pickValueByAliases(customer, ["phone", "dien_thoai", "so_dien_thoai"]) ?? pickValueByAliases(record, ["customerPhone", "customer_phone", "phone", "so_dien_thoai"]);
    const customerZaloValue = pickValueByAliases(customer, ["zalo", "zalo_sdt"]) ?? pickValueByAliases(record, ["customerZalo", "customer_zalo", "zalo", "zalo_sdt"]);
    const itemCountValue = pickValueByAliases(record, ["itemCount", "lineCount", "line_count", "so_dong_ma", "so_san_pham"]);
    const statusValue = pickValueByAliases(record, ["status", "trang_thai"]);

    return {
      id,
      createdAt: normalizeDateString(createdAtValue),
      customerName: normalizeString(customerNameValue, "Khách chưa rõ tên"),
      customerPhone: normalizeString(customerPhoneValue),
      customerZalo: normalizeString(customerZaloValue || customerPhoneValue),
      itemCount: items.length > 0 ? items.length : Math.max(itemCountByRfqId.get(id) ?? 0, Math.round(normalizeNumber(itemCountValue, 0))),
      status: normalizeAdminStatus(statusValue),
    } satisfies AdminRfqListItem;
  });
}

async function buildFallbackRfqDetailFromList(rfqId: string) {
  const listItems = await listAdminRfqs();
  const fallbackItem = listItems.find((item) => item.id.trim().toLowerCase() === rfqId.trim().toLowerCase());

  if (!fallbackItem) {
    return null;
  }

  const fallbackDetail: AdminRfqDetail = {
    id: fallbackItem.id,
    createdAt: fallbackItem.createdAt,
    source: "website-tra-ma-bao-gia",
    status: fallbackItem.status,
    customer: {
      name: fallbackItem.customerName,
      phone: fallbackItem.customerPhone,
      zalo: fallbackItem.customerZalo || fallbackItem.customerPhone,
      email: "",
      company: "",
      province: "",
      note: "",
    },
    items: [],
    quote: buildDefaultQuoteDraft([]),
  };

  return fallbackDetail;
}

export async function getAdminRfqDetail(rfqId: string) {
  const detailRequests: Array<Record<string, unknown>> = [
    { rfqId },
    { rfq_id: rfqId },
    { id: rfqId },
    { requestId: rfqId },
    { rfq: { id: rfqId } },
  ];

  let rawDetail: unknown = null;
  let lastError: unknown = null;

  for (const requestPayload of detailRequests) {
    try {
      rawDetail = await postSheetAction<unknown>("get_rfq", requestPayload);
      break;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const canRetry =
        message.includes("not found") ||
        message.includes("rfq") ||
        message.includes("id") ||
        message.includes("payload");

      if (!canRetry) {
        throw error;
      }
    }
  }

  if (rawDetail == null) {
    const fallbackDetail = await buildFallbackRfqDetailFromList(rfqId);
    if (fallbackDetail) {
      return fallbackDetail;
    }

    if (lastError) {
      const message = lastError instanceof Error ? lastError.message.toLowerCase() : "";
      if (message.includes("not found") || message.includes("rfq")) {
        return null;
      }
      throw lastError;
    }

    return null;
  }

  const rfqRecord = resolveRfqRecord(rawDetail, rfqId);
  if (Object.keys(rfqRecord).length === 0) {
    return buildFallbackRfqDetailFromList(rfqId);
  }

  const customerSource = {
    ...pickFirstRecord(rfqRecord, ["customer", "customerInfo", "customer_info", "customerJson", "customer_json"]),
    ...pickFirstRecord(rfqRecord, ["customerData", "customer_data"]),
  };
  const rawItems = resolveRfqItems(rawDetail, rfqRecord, rfqId);
  const items = rawItems.map(normalizeQuoteRequestItem);
  const quoteRecord = resolveQuoteRecord(rawDetail, rfqRecord, rfqId);
  const quoteItems = resolveQuoteItems(rawDetail, quoteRecord, rfqId);
  const quoteSeed = buildQuoteSeed(quoteRecord, quoteItems, items);
  const detailId = pickValueByAliases(rfqRecord, ["id", "rfqId", "rfq_id", "ma_rfq", "ma_yeu_cau"]);
  const detailCreatedAt = pickValueByAliases(rfqRecord, ["createdAt", "created_at", "date", "ngay_tao", "ngay_yeu_cau"]);
  const detailSource = pickValueByAliases(rfqRecord, ["source", "requestSource", "nguon"]);
  const detailStatus = pickValueByAliases(rfqRecord, ["status", "trang_thai"]);

  const customerName = pickValueByAliases(customerSource, ["name", "ten", "ten_khach_hang"]) ?? pickValueByAliases(rfqRecord, ["customerName", "customer_name", "ten_khach_hang", "khach_hang"]);
  const customerPhone = pickValueByAliases(customerSource, ["phone", "dien_thoai", "so_dien_thoai"]) ?? pickValueByAliases(rfqRecord, ["customerPhone", "customer_phone", "phone", "so_dien_thoai"]);
  const customerZalo = pickValueByAliases(customerSource, ["zalo", "zalo_sdt"]) ?? pickValueByAliases(rfqRecord, ["customerZalo", "customer_zalo", "zalo", "zalo_sdt"]);
  const customerCompany = pickValueByAliases(customerSource, ["company", "cong_ty"]) ?? pickValueByAliases(rfqRecord, ["customerCompany", "customer_company", "cong_ty"]);
  const customerProvince = pickValueByAliases(customerSource, ["province", "tinh_thanh"]) ?? pickValueByAliases(rfqRecord, ["customerProvince", "customer_province", "tinh_thanh"]);
  const customerNote = pickValueByAliases(customerSource, ["note", "ghi_chu", "ghi_chu_khach"]) ?? pickValueByAliases(rfqRecord, ["customerNote", "customer_note", "ghi_chu", "ghi_chu_khach"]);

  const detail: AdminRfqDetail = {
    id: normalizeString(detailId, rfqId),
    createdAt: normalizeDateString(detailCreatedAt),
    source: normalizeString(detailSource, "website-tra-ma-bao-gia") as QuoteRequest["source"],
    status: normalizeAdminStatus(detailStatus),
    customer: {
      name: normalizeString(customerName, "Khách chưa rõ tên"),
      phone: normalizeString(customerPhone),
      zalo: normalizeString(customerZalo || customerPhone),
      email: "",
      company: normalizeString(customerCompany),
      province: normalizeString(customerProvince),
      note: normalizeString(customerNote),
    },
    items,
    quote: items.length > 0 ? hydrateQuoteDraft(quoteSeed, items) : buildDefaultQuoteDraft([]),
  };

  return withFallbackInternalPrices(detail);
}

export async function saveAdminQuote(rfqId: string, quote: AdminQuoteDraft) {
  const actionVariants: SheetAction[] = ["update_quote", "save_quote", "upsert_quote"];
  const payloadVariants: Array<Record<string, unknown>> = [
    { rfqId, quote },
    { rfq_id: rfqId, quote },
    { id: rfqId, requestId: rfqId, quote, quoteDraft: quote, pricingDraft: quote },
    { rfq: { id: rfqId }, quote },
  ];

  let lastError: unknown = null;
  for (const action of actionVariants) {
    for (const payload of payloadVariants) {
      try {
        return await postSheetAction(action, payload);
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const canRetry =
          message.includes("rfq") ||
          message.includes("not found") ||
          message.includes("id") ||
          message.includes("payload") ||
          message.includes("quote") ||
          message.includes("unknown action");

        if (!canRetry) {
          throw error;
        }
      }
    }
  }

  const finalMessage = lastError instanceof Error ? lastError.message.toLowerCase() : "";
  if (finalMessage.includes("unknown action")) {
    return {
      ok: false,
      warning: "QUOTE_ACTION_NOT_SUPPORTED",
    };
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to update quote.");
}

export async function saveAdminStatus(rfqId: string, status: string) {
  const normalizedStatus = normalizeAdminStatus(status);
  const statusLabel = getAdminStatusLabel(normalizedStatus);
  const actionVariants: SheetAction[] = ["update_status", "set_status", "update_rfq_status"];
  const payloadVariants: Array<Record<string, unknown>> = [
    { rfqId, status: statusLabel, statusCode: normalizedStatus },
    { rfq_id: rfqId, status: statusLabel, statusCode: normalizedStatus },
    { id: rfqId, requestId: rfqId, status: statusLabel, statusCode: normalizedStatus },
    { rfq: { id: rfqId }, status: statusLabel, statusCode: normalizedStatus },
  ];

  let lastError: unknown = null;
  for (const action of actionVariants) {
    for (const payload of payloadVariants) {
      try {
        return await postSheetAction(action, payload);
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const canRetry =
          message.includes("rfq") ||
          message.includes("not found") ||
          message.includes("id") ||
          message.includes("payload") ||
          message.includes("status") ||
          message.includes("unknown action");

        if (!canRetry) {
          throw error;
        }
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to update RFQ status.");
}