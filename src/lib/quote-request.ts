export type QuoteRequestCustomerForm = {
  name: string;
  email: string;
  phone: string;
  zalo: string;
  company: string;
  province: string;
  note: string;
};

export type QuoteRequestInputItem = {
  code: string;
  normalizedCode: string;
  name: string;
  productGroup: string;
  quantity: number;
  unit: string;
  customerNote: string;
};

export type QuoteRequestItem = {
  code: string;
  normalizedCode: string;
  name: string;
  productGroup: string;
  quantity: number;
  unit: string;
  customerNote: string;
};

export type QuoteRequest = {
  id: string;
  createdAt: string;
  source: "website-tra-ma-bao-gia";
  channel: "zalo" | "email";
  status: "new";
  customer: {
    name: string;
    email: string;
    phone: string;
    zalo: string;
    company: string;
    province: string;
    note: string;
  };
  items: QuoteRequestItem[];
  pricing: {
    currency: "VND";
    status: "not_priced";
  };
};

const RFQ_STORAGE_KEY = "skf_quote_requests";

function pad2(value: number) {
  return `${value}`.padStart(2, "0");
}

function createRfqId(now: Date) {
  const date = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  const time = `${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;
  return `RFQ-SKF-${date}-${time}`;
}

export function buildQuoteRequest(
  selectedItems: QuoteRequestInputItem[],
  customerForm: QuoteRequestCustomerForm,
  channel: QuoteRequest["channel"],
): QuoteRequest {
  const now = new Date();
  return {
    id: createRfqId(now),
    createdAt: now.toISOString(),
    source: "website-tra-ma-bao-gia",
    channel,
    status: "new",
    customer: {
      name: customerForm.name.trim(),
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim(),
      zalo: customerForm.zalo.trim(),
      company: customerForm.company.trim(),
      province: customerForm.province.trim(),
      note: customerForm.note.trim(),
    },
    items: selectedItems.map((item) => ({
      code: item.code,
      normalizedCode: item.normalizedCode,
      name: item.name,
      productGroup: item.productGroup,
      quantity: item.quantity,
      unit: item.unit,
      customerNote: item.customerNote.trim(),
    })),
    pricing: {
      currency: "VND",
      status: "not_priced",
    },
  };
}

export function buildZaloQuoteMessage(rfq: QuoteRequest) {
  const itemLines = rfq.items.map((item, index) => {
    const notePart = item.customerNote ? ` | Ghi chu: ${item.customerNote}` : "";
    return `${index + 1}. ${item.code} | SL: ${item.quantity} ${item.unit}${notePart}`;
  });

  return [
    `PHIEU YEU CAU BAO GIA: ${rfq.id}`,
    `Thoi gian: ${rfq.createdAt}`,
    "",
    "Thong tin khach hang:",
    `- Ho ten: ${rfq.customer.name}`,
    `- Email: ${rfq.customer.email || "(khong co)"}`,
    `- SDT/Zalo: ${rfq.customer.phone}`,
    `- Cong ty: ${rfq.customer.company || "(khong co)"}`,
    `- Tinh thanh: ${rfq.customer.province || "(khong co)"}`,
    `- Ghi chu chung: ${rfq.customer.note || "(khong co)"}`,
    "",
    "Danh sach ma can bao gia:",
    ...itemLines,
  ].join("\n");
}

export function buildEmailQuoteMessage(rfq: QuoteRequest) {
  const itemLines = rfq.items.map((item, index) => {
    const notePart = item.customerNote ? ` | Ghi chu: ${item.customerNote}` : "";
    return `${index + 1}. ${item.code} | SL: ${item.quantity} ${item.unit}${notePart}`;
  });

  const subject = `[${rfq.id}] Yeu cau bao gia SKF`;
  const body = [
    `Ma yeu cau: ${rfq.id}`,
    `Kenh tiep nhan: ${rfq.channel}`,
    `Thoi gian: ${rfq.createdAt}`,
    "",
    "Thong tin khach hang:",
    `- Ho ten: ${rfq.customer.name}`,
    `- Email: ${rfq.customer.email || "(khong co)"}`,
    `- SDT/Zalo: ${rfq.customer.phone || rfq.customer.zalo || "(khong co)"}`,
    `- Cong ty: ${rfq.customer.company || "(khong co)"}`,
    `- Tinh thanh: ${rfq.customer.province || "(khong co)"}`,
    `- Ghi chu chung: ${rfq.customer.note || "(khong co)"}`,
    "",
    "Danh sach ma can bao gia:",
    ...itemLines,
  ].join("\n");

  return {
    subject,
    body,
  };
}

export function saveQuoteRequestDraft(rfq: QuoteRequest) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = window.localStorage.getItem(RFQ_STORAGE_KEY);
  const currentList = raw ? (JSON.parse(raw) as QuoteRequest[]) : [];
  const nextList = [rfq, ...currentList];
  window.localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(nextList));
}

export function exportQuoteRequestJson(rfq: QuoteRequest) {
  return JSON.stringify(rfq, null, 2);
}
