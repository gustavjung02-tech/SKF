import type { QuoteRequest, QuoteRequestItem } from "@/lib/quote-request";

export const ADMIN_RFQ_STATUSES = ["new", "draft", "quoted", "sent", "closed"] as const;

export type AdminRfqStatus = (typeof ADMIN_RFQ_STATUSES)[number];

export type AdminQuoteLineDraft = {
  code: string;
  normalizedCode: string;
  name: string;
  quantity: number;
  unit: string;
  customerNote: string;
  internalPrice: number | null;
  lineDiscountPercent: number;
  note: string;
};

export type AdminQuoteDraft = {
  currency: "VND";
  lineItems: AdminQuoteLineDraft[];
  totalDiscountPercent: number;
  vatPercent: number;
  shippingFee: number;
  note: string;
};

export type AdminCalculatedQuoteLine = AdminQuoteLineDraft & {
  unitPriceAfterDiscount: number;
  lineTotal: number;
};

export type AdminCalculatedQuoteTotals = {
  subtotal: number;
  totalDiscountAmount: number;
  discountedSubtotal: number;
  vatAmount: number;
  grandTotal: number;
};

export type AdminRfqListItem = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerZalo: string;
  itemCount: number;
  status: AdminRfqStatus;
};

export type AdminRfqDetail = Pick<QuoteRequest, "id" | "createdAt" | "source" | "customer"> & {
  status: AdminRfqStatus;
  items: QuoteRequestItem[];
  quote: AdminQuoteDraft;
};

function toFiniteNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function clampPercent(value: unknown) {
  const parsed = toFiniteNumber(value, 0);
  return Math.min(100, Math.max(0, parsed));
}

export function normalizeAdminStatus(value: unknown): AdminRfqStatus {
  const safeValue = `${value ?? ""}`.trim().toLowerCase();
  if (ADMIN_RFQ_STATUSES.includes(safeValue as AdminRfqStatus)) {
    return safeValue as AdminRfqStatus;
  }

  return "new";
}

export function buildDefaultQuoteDraft(items: QuoteRequestItem[]): AdminQuoteDraft {
  return {
    currency: "VND",
    lineItems: items.map((item) => ({
      code: item.code,
      normalizedCode: item.normalizedCode,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      customerNote: item.customerNote,
      internalPrice: null,
      lineDiscountPercent: 0,
      note: "",
    })),
    totalDiscountPercent: 0,
    vatPercent: 8,
    shippingFee: 0,
    note: "",
  };
}

export function hydrateQuoteDraft(rawQuote: unknown, items: QuoteRequestItem[]): AdminQuoteDraft {
  const quote = rawQuote && typeof rawQuote === "object" ? (rawQuote as Partial<AdminQuoteDraft> & { items?: unknown[] }) : null;
  const lineSource = Array.isArray(quote?.lineItems) ? quote.lineItems : Array.isArray(quote?.items) ? quote.items : [];

  return {
    currency: "VND",
    lineItems: items.map((item, index) => {
      const rawLine = lineSource[index] && typeof lineSource[index] === "object" ? (lineSource[index] as Partial<AdminQuoteLineDraft>) : {};
      const rawPrice = rawLine.internalPrice;
      const internalPrice = rawPrice == null ? null : toFiniteNumber(rawPrice, 0);

      return {
        code: item.code,
        normalizedCode: item.normalizedCode,
        name: item.name,
        quantity: Math.max(1, Math.round(toFiniteNumber(rawLine.quantity ?? item.quantity, item.quantity))),
        unit: `${rawLine.unit ?? item.unit ?? "cai"}`,
        customerNote: `${rawLine.customerNote ?? item.customerNote ?? ""}`,
        internalPrice: internalPrice && internalPrice > 0 ? internalPrice : null,
        lineDiscountPercent: clampPercent(rawLine.lineDiscountPercent),
        note: `${rawLine.note ?? ""}`,
      } satisfies AdminQuoteLineDraft;
    }),
    totalDiscountPercent: clampPercent(quote?.totalDiscountPercent),
    vatPercent: clampPercent(quote?.vatPercent ?? 8),
    shippingFee: Math.max(0, toFiniteNumber(quote?.shippingFee, 0)),
    note: `${quote?.note ?? ""}`,
  };
}

export function calculateQuoteDraft(quote: AdminQuoteDraft) {
  const lineItems: AdminCalculatedQuoteLine[] = quote.lineItems.map((line) => {
    const quantity = Math.max(1, Math.round(toFiniteNumber(line.quantity, 1)));
    const internalPrice = line.internalPrice && line.internalPrice > 0 ? line.internalPrice : 0;
    const lineDiscountPercent = clampPercent(line.lineDiscountPercent);
    const unitPriceAfterDiscount = Math.round(internalPrice * (1 - lineDiscountPercent / 100));
    const lineTotal = unitPriceAfterDiscount * quantity;

    return {
      ...line,
      quantity,
      internalPrice: internalPrice > 0 ? internalPrice : null,
      lineDiscountPercent,
      unitPriceAfterDiscount,
      lineTotal,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalDiscountAmount = Math.round(subtotal * (clampPercent(quote.totalDiscountPercent) / 100));
  const discountedSubtotal = Math.max(0, subtotal - totalDiscountAmount);
  const vatAmount = Math.round(discountedSubtotal * (clampPercent(quote.vatPercent) / 100));
  const grandTotal = discountedSubtotal + vatAmount + Math.max(0, Math.round(toFiniteNumber(quote.shippingFee, 0)));

  return {
    lineItems,
    totals: {
      subtotal,
      totalDiscountAmount,
      discountedSubtotal,
      vatAmount,
      grandTotal,
    } satisfies AdminCalculatedQuoteTotals,
  };
}

export function formatCurrencyVnd(value: number | null | undefined) {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

export function buildAdminQuoteText(detail: AdminRfqDetail, quote: AdminQuoteDraft) {
  const calculated = calculateQuoteDraft(quote);
  const itemLines = calculated.lineItems.map((line, index) => {
    const extraNotes = [line.customerNote ? `YC: ${line.customerNote}` : "", line.note ? `Ghi chu: ${line.note}` : ""]
      .filter(Boolean)
      .join(" | ");

    return `${index + 1}. ${line.code} | SL: ${line.quantity} ${line.unit} | Don gia: ${formatCurrencyVnd(line.unitPriceAfterDiscount)} | Thanh tien: ${formatCurrencyVnd(line.lineTotal)}${extraNotes ? ` | ${extraNotes}` : ""}`;
  });

  return [
    `BAO GIA SKF: ${detail.id}`,
    `Ngay tao RFQ: ${detail.createdAt}`,
    `Khach hang: ${detail.customer.name}`,
    `SDT/Zalo: ${detail.customer.zalo || detail.customer.phone}`,
    detail.customer.company ? `Cong ty: ${detail.customer.company}` : "",
    "",
    "Danh sach bao gia:",
    ...itemLines,
    "",
    `Tam tinh: ${formatCurrencyVnd(calculated.totals.subtotal)}`,
    `CK tong: ${quote.totalDiscountPercent}% (-${formatCurrencyVnd(calculated.totals.totalDiscountAmount)})`,
    `VAT: ${quote.vatPercent}% (+${formatCurrencyVnd(calculated.totals.vatAmount)})`,
    `Phi giao hang: ${formatCurrencyVnd(quote.shippingFee)}`,
    `Tong cong: ${formatCurrencyVnd(calculated.totals.grandTotal)}`,
    quote.note ? `Ghi chu bao gia: ${quote.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}