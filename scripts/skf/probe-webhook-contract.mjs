const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || "";
const WEBHOOK_SECRET = process.env.GOOGLE_SHEET_WEBHOOK_SECRET || "";

if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
  console.error("Missing GOOGLE_SHEET_WEBHOOK_URL or GOOGLE_SHEET_WEBHOOK_SECRET");
  process.exit(1);
}

const RFQ_ID = process.argv[2] || "";

if (!RFQ_ID) {
  console.error("Usage: node scripts/skf/probe-webhook-contract.mjs <RFQ_ID>");
  process.exit(1);
}

const sheetContext = {
  spreadsheetName: "SKF_Admin_Bao_Gia",
  tabs: {
    rfq: "RFQ",
    rfqItems: "RFQ_ITEMS",
    priceMaster: "PRICE_MASTER",
    quotes: "QUOTES",
    quoteItems: "QUOTE_ITEMS",
  },
};

const quoteDraft = {
  currency: "VND",
  lineItems: [
    {
      code: "6205",
      normalizedCode: "6205",
      name: "Vong bi 6205",
      quantity: 2,
      unit: "cai",
      customerNote: "probe",
      internalPrice: 77000,
      lineDiscountPercent: 0,
      note: "",
    },
  ],
  totalDiscountPercent: 0,
  vatPercent: 8,
  shippingFee: 0,
  note: "probe",
};

const checks = [
  { action: "get_rfq", body: { rfq_id: RFQ_ID } },
  { action: "update_status", body: { rfq_id: RFQ_ID, status: "draft" } },
  { action: "update_quote", body: { rfq_id: RFQ_ID, quote: quoteDraft } },
  { action: "save_quote", body: { rfq_id: RFQ_ID, quote: quoteDraft } },
  { action: "upsert_quote", body: { rfq_id: RFQ_ID, quote: quoteDraft } },
  { action: "update_status", body: { rfq_id: RFQ_ID, status: "sent" } },
];

async function callWebhook(action, extraBody) {
  const body = {
    action,
    secret: WEBHOOK_SECRET,
    sheetContext,
    payload: extraBody,
    ...extraBody,
  };

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  return {
    status: response.status,
    body: parsed,
  };
}

(async () => {
  console.log("Probing webhook contract for RFQ:", RFQ_ID);
  for (const check of checks) {
    const result = await callWebhook(check.action, check.body);
    console.log("---", check.action, "status", result.status);
    console.log(JSON.stringify(result.body));
  }
})();
