import type { QuoteRequest } from "@/lib/quote-request";
import { findInternalPriceByNormalizedCode } from "@/lib/admin/price-master";
import { buildDefaultQuoteDraft, hydrateQuoteDraft, normalizeAdminStatus, type AdminQuoteDraft, type AdminRfqDetail, type AdminRfqListItem } from "@/lib/admin/quote";

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
    rfq: "RFQ",
    rfqItems: "RFQ_ITEMS",
    priceMaster: "PRICE_MASTER",
    quotes: "QUOTES",
    quoteItems: "QUOTE_ITEMS",
  },
} as const;

function getWebhookUrl() {
  return process.env.GOOGLE_SHEET_WEBHOOK_URL?.trim() ?? "";
}

function getWebhookSecret() {
  return process.env.GOOGLE_SHEET_WEBHOOK_SECRET?.trim() ?? "";
}

function normalizeString(value: unknown, fallback = "") {
  return `${value ?? fallback}`.trim();
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

function getIdentifier(record: Record<string, unknown>, keys = ["id", "rfqId", "rfq_id", "code"]) {
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
  const code = normalizeString(record.code || record.productCode || record.sku, fallbackItem?.code ?? "");
  const normalizedCode = normalizeString(record.normalizedCode || record.normalized_code || code, fallbackItem?.normalizedCode ?? code).toUpperCase();

  return {
    code: code || fallbackItem?.code || "",
    normalizedCode,
    name: normalizeString(record.name || record.productName || record.product_name, fallbackItem?.name ?? code),
    quantity: Math.max(1, Math.round(normalizeNumber(record.quantity, fallbackItem?.quantity ?? 1))),
    unit: normalizeString(record.unit, fallbackItem?.unit ?? "cai"),
    customerNote: normalizeString(record.customerNote || record.customer_note || record.note, fallbackItem?.customerNote ?? ""),
    internalPrice:
      record.internalPrice == null && record.internal_price == null && record.price == null
        ? null
        : Math.max(0, Math.round(normalizeNumber(record.internalPrice || record.internal_price || record.price, 0))),
    lineDiscountPercent: normalizeNumber(record.lineDiscountPercent || record.line_discount_percent || record.discountPercent || record.discount_percent, 0),
    note: normalizeString(record.note || record.lineNote || record.line_note),
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
        const normalizedCode = normalizeString(quoteItem.normalizedCode || quoteItem.normalized_code).toUpperCase();
        const code = normalizeString(quoteItem.code || quoteItem.productCode || quoteItem.sku);
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
      return isSameIdentifier(rowRecord, rfqId, ["rfqId", "rfq_id", "requestId", "request_id", "id"]);
    });
  }

  const allItemRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.rfqItems, "RFQ_ITEMS", "rfqItems", "rfq_items"]);
  return allItemRows.filter((row) => isSameIdentifier(asRecord(row), rfqId, ["rfqId", "rfq_id", "requestId", "request_id", "id"]));
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

  const quoteRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.quotes, "QUOTES", "quotes"]);
  return findRowByIdentifier(quoteRows, rfqId, ["rfqId", "rfq_id", "requestId", "request_id", "id"]) ?? ({} satisfies Record<string, unknown>);
}

function resolveQuoteItems(payload: unknown, quoteRecord: Record<string, unknown>, rfqId: string) {
  const inlineQuoteItems = pickFirstArray(quoteRecord, ["lineItems", "line_items", "items", "quoteItems", "quote_items"]);
  if (inlineQuoteItems.length > 0) {
    return inlineQuoteItems;
  }

  const rootRecord = asRecord(payload);
  const allQuoteItemRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.quoteItems, "QUOTE_ITEMS", "quoteItems", "quote_items"]);
  if (allQuoteItemRows.length === 0) {
    return [];
  }

  const quoteId = getIdentifier(quoteRecord, ["id", "quoteId", "quote_id"]);

  return allQuoteItemRows.filter((row) => {
    const rowRecord = asRecord(row);
    return isSameIdentifier(rowRecord, quoteId, ["quoteId", "quote_id"]) || isSameIdentifier(rowRecord, rfqId, ["rfqId", "rfq_id", "requestId", "request_id"]);
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
  if (!webhookUrl || !webhookSecret) {
    throw new Error("Missing Google Sheet webhook configuration.");
  }

  const response = await fetch(webhookUrl, {
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

  const rawText = await response.text();
  let json: unknown = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = rawText;
  }

  if (!response.ok) {
    throw new Error(typeof json === "object" && json && "error" in (json as Record<string, unknown>) ? normalizeString((json as Record<string, unknown>).error, "Webhook error") : `Webhook request failed with status ${response.status}.`);
  }

  if (json && typeof json === "object" && "ok" in (json as Record<string, unknown>) && (json as Record<string, unknown>).ok === false) {
    throw new Error(normalizeString((json as Record<string, unknown>).error, "Webhook returned an error."));
  }

  return extractDataEnvelope<T>(json);
}

function normalizeQuoteRequestItem(rawItem: unknown) {
  const record = asRecord(rawItem);
  const code = normalizeString(record.code || record.productCode || record.sku, "UNKNOWN");
  return {
    code,
    normalizedCode: normalizeString(record.normalizedCode || record.normalized_code || code, code).toUpperCase(),
    name: normalizeString(record.name || record.productName || record.product_name || code, code),
    productGroup: normalizeString(record.productGroup || record.product_group || record.group, "SKF"),
    quantity: Math.max(1, Math.round(normalizeNumber(record.quantity, 1))),
    unit: normalizeString(record.unit, "cai"),
    customerNote: normalizeString(record.customerNote || record.customer_note || record.note),
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
  try {
    return await postSheetAction("create_rfq", { rfq });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const shouldRetry = message.includes("invalid rfq") || message.includes("invalid payload") || message.includes("missing") || message.includes("rfq");

    if (!shouldRetry) {
      throw error;
    }
  }

  try {
    return await postSheetAction("create_rfq", {
      ...rfq,
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
    request: rfq,
    data: rfq,
    payload: rfq,
    rfqId: rfq.id,
    requestId: rfq.id,
  });
}

export async function listAdminRfqs() {
  const rawList = await postSheetAction<unknown>("list_rfqs", {});
  const listRows = resolveRfqRows(rawList);
  const rootRecord = asRecord(rawList);
  const itemRows = pickTabRows(rootRecord, [SHEET_CONTEXT.tabs.rfqItems, "RFQ_ITEMS", "rfqItems", "rfq_items"]);
  const itemCountByRfqId = new Map<string, number>();

  for (const rawItem of itemRows) {
    const row = asRecord(rawItem);
    const parentId = getIdentifier(row, ["rfqId", "rfq_id", "requestId", "request_id", "id"]);
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
    const id = normalizeString(record.id || record.rfqId || record.rfq_id || record.code, "RFQ-UNKNOWN");

    return {
      id,
      createdAt: normalizeDateString(record.createdAt || record.created_at || record.date),
      customerName: normalizeString(customer.name || record.customerName || record.customer_name, "Khách chưa rõ tên"),
      customerPhone: normalizeString(customer.phone || record.customerPhone || record.customer_phone || record.phone),
      customerZalo: normalizeString(customer.zalo || record.customerZalo || record.customer_zalo || record.zalo || customer.phone || record.customerPhone || record.customer_phone || record.phone),
      itemCount: items.length > 0 ? items.length : Math.max(itemCountByRfqId.get(id) ?? 0, Math.round(normalizeNumber(record.itemCount || record.lineCount || record.line_count, 0))),
      status: normalizeAdminStatus(record.status),
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
  const detail: AdminRfqDetail = {
    id: normalizeString(rfqRecord.id || rfqRecord.rfqId || rfqRecord.rfq_id, rfqId),
    createdAt: normalizeDateString(rfqRecord.createdAt || rfqRecord.created_at || rfqRecord.date),
    source: normalizeString(rfqRecord.source || rfqRecord.requestSource, "website-tra-ma-bao-gia") as QuoteRequest["source"],
    status: normalizeAdminStatus(rfqRecord.status),
    customer: {
      name: normalizeString(customerSource.name || rfqRecord.customerName || rfqRecord.customer_name, "Khách chưa rõ tên"),
      phone: normalizeString(customerSource.phone || rfqRecord.customerPhone || rfqRecord.customer_phone || rfqRecord.phone),
      zalo: normalizeString(customerSource.zalo || rfqRecord.customerZalo || rfqRecord.customer_zalo || rfqRecord.zalo || customerSource.phone || rfqRecord.customerPhone || rfqRecord.customer_phone || rfqRecord.phone),
      company: normalizeString(customerSource.company || rfqRecord.customerCompany || rfqRecord.customer_company),
      province: normalizeString(customerSource.province || rfqRecord.customerProvince || rfqRecord.customer_province),
      note: normalizeString(customerSource.note || rfqRecord.customerNote || rfqRecord.customer_note),
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
  const actionVariants: SheetAction[] = ["update_status", "set_status", "update_rfq_status"];
  const payloadVariants: Array<Record<string, unknown>> = [
    { rfqId, status: normalizedStatus },
    { rfq_id: rfqId, status: normalizedStatus },
    { id: rfqId, requestId: rfqId, status: normalizedStatus },
    { rfq: { id: rfqId }, status: normalizedStatus },
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