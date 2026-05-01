import { calculateQuoteDraft, formatCurrencyVnd, type AdminQuoteDraft } from "@/lib/admin/quote";

export const ADMIN_QUOTE_SOURCE_TYPES = ["rfq", "manual", "zalo", "phone", "repeat_customer"] as const;
export const ADMIN_QUOTE_STATUSES = ["draft", "sent", "follow_up", "won", "lost", "cancelled"] as const;

export type AdminQuoteSourceType = (typeof ADMIN_QUOTE_SOURCE_TYPES)[number];
export type AdminQuoteStatus = (typeof ADMIN_QUOTE_STATUSES)[number];

export type AdminProactiveQuoteCustomer = {
  name: string;
  phoneOrZalo: string;
  email: string;
  company: string;
  province: string;
  note: string;
};

export type AdminProactiveQuoteItem = {
  code: string;
  normalizedCode: string;
  name: string;
  productGroup: string;
  productGroupLabel: string;
  quantity: number;
  internalPrice: number | null;
  lineDiscountPercent: number;
  note: string;
};

export type AdminProactiveQuoteRecord = {
  quote_id: string;
  source_type: AdminQuoteSourceType;
  rfq_id?: string;
  created_at: string;
  updated_at: string;
  status: AdminQuoteStatus;
  customer: AdminProactiveQuoteCustomer;
  items: AdminProactiveQuoteItem[];
  discountPercent: number;
  vatPercent: number;
  shippingFee: number;
  deliveryTime: string;
  validUntil: string;
  paymentTerm: string;
  subtotal: number;
  total: number;
  note: string;
};

export type AdminProactiveCalculatedItem = AdminProactiveQuoteItem & {
  unitPriceAfterDiscount: number;
  lineTotal: number;
};

export type AdminProactiveCalculatedTotals = {
  subtotal: number;
  totalDiscountAmount: number;
  discountedSubtotal: number;
  vatAmount: number;
  grandTotal: number;
};

const SOURCE_LABELS: Record<AdminQuoteSourceType, string> = {
  rfq: "Từ RFQ",
  manual: "Chủ động",
  zalo: "Zalo",
  phone: "Điện thoại",
  repeat_customer: "Khách cũ",
};

const STATUS_LABELS: Record<AdminQuoteStatus, string> = {
  draft: "Nháp",
  sent: "Đã gửi",
  follow_up: "Theo dõi",
  won: "Thắng",
  lost: "Thua",
  cancelled: "Đã hủy",
};

function normalizeText(value: unknown, fallback = "") {
  return `${value ?? fallback}`.trim();
}

function normalizeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function clampPercent(value: unknown) {
  return Math.max(0, Math.min(100, normalizeNumber(value, 0)));
}

export function normalizeAdminQuoteSourceType(value: unknown): AdminQuoteSourceType {
  const normalized = normalizeText(value).toLowerCase();
  if (ADMIN_QUOTE_SOURCE_TYPES.includes(normalized as AdminQuoteSourceType)) {
    return normalized as AdminQuoteSourceType;
  }

  return "manual";
}

export function normalizeAdminQuoteStatus(value: unknown): AdminQuoteStatus {
  const normalized = normalizeText(value).toLowerCase();
  if (ADMIN_QUOTE_STATUSES.includes(normalized as AdminQuoteStatus)) {
    return normalized as AdminQuoteStatus;
  }

  return "draft";
}

export function getAdminQuoteSourceLabel(sourceType: unknown) {
  return SOURCE_LABELS[normalizeAdminQuoteSourceType(sourceType)];
}

export function getAdminQuoteStatusLabel(status: unknown) {
  return STATUS_LABELS[normalizeAdminQuoteStatus(status)];
}

export function createEmptyProactiveQuote() {
  const now = new Date().toISOString();
  return {
    quote_id: "",
    source_type: "manual",
    created_at: now,
    updated_at: now,
    status: "draft",
    customer: {
      name: "",
      phoneOrZalo: "",
      email: "",
      company: "",
      province: "",
      note: "",
    },
    items: [],
    discountPercent: 0,
    vatPercent: 8,
    shippingFee: 0,
    deliveryTime: "",
    validUntil: "",
    paymentTerm: "",
    subtotal: 0,
    total: 0,
    note: "",
  } satisfies AdminProactiveQuoteRecord;
}

export function normalizeProactiveQuoteItem(rawItem: unknown): AdminProactiveQuoteItem {
  const safeRaw = rawItem && typeof rawItem === "object" ? (rawItem as Record<string, unknown>) : {};
  const code = normalizeText(safeRaw.code);
  return {
    code,
    normalizedCode: normalizeText(safeRaw.normalizedCode || safeRaw.normalized_code || code).toUpperCase(),
    name: normalizeText(safeRaw.name, code),
    productGroup: normalizeText(safeRaw.productGroup || safeRaw.product_group),
    productGroupLabel: normalizeText(safeRaw.productGroupLabel || safeRaw.product_group_label),
    quantity: Math.max(1, Math.round(normalizeNumber(safeRaw.quantity, 1))),
    internalPrice:
      safeRaw.internalPrice == null
        ? null
        : Math.max(0, Math.round(normalizeNumber(safeRaw.internalPrice, 0))) || null,
    lineDiscountPercent: clampPercent(safeRaw.lineDiscountPercent),
    note: normalizeText(safeRaw.note),
  };
}

export function toQuoteDraftFromProactiveQuote(record: AdminProactiveQuoteRecord): AdminQuoteDraft {
  return {
    currency: "VND",
    lineItems: record.items.map((item) => ({
      code: item.code,
      normalizedCode: item.normalizedCode,
      name: item.name,
      quantity: item.quantity,
      unit: "cai",
      customerNote: "",
      internalPrice: item.internalPrice,
      lineDiscountPercent: item.lineDiscountPercent,
      note: item.note,
    })),
    totalDiscountPercent: record.discountPercent,
    vatPercent: record.vatPercent,
    shippingFee: record.shippingFee,
    note: record.note,
  };
}

export function calculateProactiveQuote(record: AdminProactiveQuoteRecord) {
  const quoteDraft = toQuoteDraftFromProactiveQuote(record);
  const calculated = calculateQuoteDraft(quoteDraft);

  return {
    items: calculated.lineItems.map((line, index) => ({
      ...record.items[index],
      quantity: line.quantity,
      internalPrice: line.internalPrice,
      lineDiscountPercent: line.lineDiscountPercent,
      unitPriceAfterDiscount: line.unitPriceAfterDiscount,
      lineTotal: line.lineTotal,
    })) as AdminProactiveCalculatedItem[],
    totals: calculated.totals as AdminProactiveCalculatedTotals,
  };
}

export function hydrateProactiveQuote(rawRecord: unknown): AdminProactiveQuoteRecord {
  const base = createEmptyProactiveQuote();
  const safeRaw = rawRecord && typeof rawRecord === "object" ? (rawRecord as Record<string, unknown>) : {};
  const customer = safeRaw.customer && typeof safeRaw.customer === "object"
    ? (safeRaw.customer as Record<string, unknown>)
    : {};

  const normalized: AdminProactiveQuoteRecord = {
    quote_id: normalizeText(safeRaw.quote_id || safeRaw.quoteId),
    source_type: normalizeAdminQuoteSourceType(safeRaw.source_type || safeRaw.sourceType),
    rfq_id: normalizeText(safeRaw.rfq_id || safeRaw.rfqId) || undefined,
    created_at: normalizeText(safeRaw.created_at || safeRaw.createdAt, base.created_at),
    updated_at: normalizeText(safeRaw.updated_at || safeRaw.updatedAt, base.updated_at),
    status: normalizeAdminQuoteStatus(safeRaw.status),
    customer: {
      name: normalizeText(customer.name),
      phoneOrZalo: normalizeText(customer.phoneOrZalo || customer.phone || customer.zalo),
      email: normalizeText(customer.email),
      company: normalizeText(customer.company),
      province: normalizeText(customer.province),
      note: normalizeText(customer.note),
    },
    items: Array.isArray(safeRaw.items) ? safeRaw.items.map(normalizeProactiveQuoteItem) : [],
    discountPercent: clampPercent(safeRaw.discountPercent),
    vatPercent: clampPercent(safeRaw.vatPercent ?? 8),
    shippingFee: Math.max(0, Math.round(normalizeNumber(safeRaw.shippingFee, 0))),
    deliveryTime: normalizeText(safeRaw.deliveryTime),
    validUntil: normalizeText(safeRaw.validUntil),
    paymentTerm: normalizeText(safeRaw.paymentTerm),
    subtotal: 0,
    total: 0,
    note: normalizeText(safeRaw.note),
  };

  const calculated = calculateProactiveQuote(normalized);
  return {
    ...normalized,
    subtotal: calculated.totals.subtotal,
    total: calculated.totals.grandTotal,
  };
}

export function buildProactiveQuoteCopyText(record: AdminProactiveQuoteRecord, mode: "zalo" | "email") {
  const calculated = calculateProactiveQuote(record);
  const titlePrefix = mode === "email" ? "BAO GIA SKF" : "BÁO GIÁ SKF";
  const lines = calculated.items.map((item, index) => {
    return `${index + 1}. ${item.code} | ${item.name} | SL: ${item.quantity} | Đơn giá: ${formatCurrencyVnd(item.unitPriceAfterDiscount)} | Thành tiền: ${formatCurrencyVnd(item.lineTotal)}${item.note ? ` | Ghi chú: ${item.note}` : ""}`;
  });

  const metaLines = [
    `Nguồn: ${getAdminQuoteSourceLabel(record.source_type)}`,
    record.deliveryTime ? `Thời gian giao: ${record.deliveryTime}` : "",
    record.validUntil ? `Hiệu lực báo giá: ${record.validUntil}` : "",
    record.paymentTerm ? `Điều kiện thanh toán: ${record.paymentTerm}` : "",
  ].filter(Boolean);

  return [
    `${titlePrefix}: ${record.quote_id || "(chưa lưu)"}`,
    `Khách hàng: ${record.customer.name || "Khách lẻ"}`,
    `SĐT/Zalo: ${record.customer.phoneOrZalo || ""}`,
    record.customer.email ? `Email: ${record.customer.email}` : "",
    record.customer.company ? `Công ty: ${record.customer.company}` : "",
    "",
    "Danh sách sản phẩm:",
    ...lines,
    "",
    `Tạm tính: ${formatCurrencyVnd(calculated.totals.subtotal)}`,
    `CK tổng: ${record.discountPercent}% (-${formatCurrencyVnd(calculated.totals.totalDiscountAmount)})`,
    `VAT: ${record.vatPercent}% (+${formatCurrencyVnd(calculated.totals.vatAmount)})`,
    `Phí giao hàng: ${formatCurrencyVnd(record.shippingFee)}`,
    `Tổng cộng: ${formatCurrencyVnd(calculated.totals.grandTotal)}`,
    ...metaLines,
    record.note ? `Ghi chú báo giá: ${record.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
