# Google Sheet Webhook Contract (Admin Bao Gia)

This document captures the verified webhook contract currently used by the admin RFQ flow.

## Endpoint

- URL: `GOOGLE_SHEET_WEBHOOK_URL`
- Method: `POST`
- Content-Type: `application/json`

## Security

- Auth field: `secret`
- Value source: `GOOGLE_SHEET_WEBHOOK_SECRET`
- Never expose `secret` to client-side code.

## Common Request Body Shape

```json
{
  "action": "create_rfq",
  "secret": "...",
  "sheetContext": {
    "spreadsheetName": "SKF_Admin_Bao_Gia",
    "tabs": {
      "rfq": "RFQ",
      "rfqItems": "RFQ_ITEMS",
      "priceMaster": "PRICE_MASTER",
      "quotes": "QUOTES",
      "quoteItems": "QUOTE_ITEMS"
    }
  },
  "payload": {
    "rfq_id": "RFQ-..."
  },
  "rfq_id": "RFQ-..."
}
```

Note: Apps Script currently requires important keys (for example `rfq_id`) at root level in addition to `payload`.

## Verified Actions

### `create_rfq`

- Status: supported
- Purpose: create RFQ + RFQ_ITEMS rows
- Input: full RFQ object
- Response example:

```json
{
  "ok": true,
  "message": "..."
}
```

### `list_rfqs`

- Status: supported
- Purpose: return RFQ list for admin table
- Response fields seen:
  - `rfq_id`
  - `created_at`
  - `status`
  - `customer_name`
  - `phone`
  - `zalo`
  - `company`
  - `province`
  - `note`
  - `source`

### `get_rfq`

- Status: supported
- Required request key: `rfq_id` at root body
- Response shape seen:

```json
{
  "ok": true,
  "data": {
    "rfq": {
      "rfq_id": "RFQ-...",
      "created_at": "...",
      "status": "sent",
      "customer_name": "...",
      "phone": "...",
      "zalo": "...",
      "company": "...",
      "province": "...",
      "note": "...",
      "source": "website-tra-ma-bao-gia"
    },
    "items": [
      {
        "rfq_id": "RFQ-...",
        "line_no": 1,
        "code": "6205",
        "normalized_code": "6205",
        "name": "...",
        "product_group": "vong-bi",
        "quantity": 1,
        "unit": "cai",
        "customer_note": "..."
      }
    ]
  }
}
```

### `update_status`

- Status: supported
- Required key: `rfq_id` at root body
- Input keys: `rfq_id`, `status`
- Response example:

```json
{
  "ok": true,
  "rfq_id": "RFQ-...",
  "status": "draft"
}
```

### Quote update actions

- Tried: `update_quote`, `save_quote`, `upsert_quote`
- Current backend behavior: `Unknown action`
- Current app behavior: keep UI responsive and return warning `QUOTE_ACTION_NOT_SUPPORTED`.

## Delivery Files For Step 1-2

- Apps Script patch file to enable quote actions:
  - `docs/apps-script-quote-actions.patch.gs`
- Local probe script for retest after applying patch:
  - `scripts/skf/probe-webhook-contract.mjs`

Run probe:

```bash
node scripts/skf/probe-webhook-contract.mjs RFQ-TEST-1777603514778
```

## Error Semantics

- Auth error:

```json
{ "ok": false, "error": "Unauthorized" }
```

- Missing RFQ:

```json
{ "ok": false, "error": "RFQ not found" }
```

- Unknown action:

```json
{ "ok": false, "error": "Unknown action" }
```

## Notes

- Use snake_case compatibility in parser for webhook data fields.
- Keep internal price fallback server-side only.
- Do not expose price master or secret in public routes.
