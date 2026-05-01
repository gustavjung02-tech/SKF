/**
 * Patch for Google Apps Script webhook to support quote actions:
 * - update_quote
 * - save_quote
 * - upsert_quote
 *
 * Expected tabs (supports both naming styles):
 * - BAO_GIA or QUOTES
 * - CHI_TIET_BG or QUOTE_ITEMS
 */

function _jsonOk(data) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: data || null }))
    .setMimeType(ContentService.MimeType.JSON);
}

function _jsonError(message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: message || "Unknown error" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function _normalizeRfqId(input) {
  var body = input || {};
  return (
    String(body.rfq_id || body.rfqId || body.id || body.requestId || "").trim() ||
    String((body.payload || {}).rfq_id || (body.payload || {}).rfqId || (body.payload || {}).id || (body.payload || {}).requestId || "").trim()
  );
}

function _resolveQuoteObject(input) {
  var body = input || {};
  if (body.quote && typeof body.quote === "object") return body.quote;
  if (body.quoteDraft && typeof body.quoteDraft === "object") return body.quoteDraft;
  if (body.pricingDraft && typeof body.pricingDraft === "object") return body.pricingDraft;
  if (body.payload && typeof body.payload === "object") {
    if (body.payload.quote && typeof body.payload.quote === "object") return body.payload.quote;
    if (body.payload.quoteDraft && typeof body.payload.quoteDraft === "object") return body.payload.quoteDraft;
    if (body.payload.pricingDraft && typeof body.payload.pricingDraft === "object") return body.payload.pricingDraft;
  }
  return null;
}

function _sheetByName(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    throw new Error("Missing sheet: " + name);
  }
  return sh;
}

function _sheetByAnyName(ss, names) {
  var list = Array.isArray(names) ? names : [];
  for (var i = 0; i < list.length; i += 1) {
    var candidate = String(list[i] || "").trim();
    if (!candidate) continue;
    var sh = ss.getSheetByName(candidate);
    if (sh) return sh;
  }
  throw new Error("Missing sheet: " + list.join(" | "));
}

function _readHeaderMap(sheet) {
  var lastCol = Math.max(1, sheet.getLastColumn());
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i += 1) {
    var key = String(headers[i] || "").trim();
    if (key) map[key] = i + 1;
  }
  return map;
}

function _ensureHeader(sheet, requiredHeaders) {
  var map = _readHeaderMap(sheet);
  var missing = [];
  for (var i = 0; i < requiredHeaders.length; i += 1) {
    if (!map[requiredHeaders[i]]) missing.push(requiredHeaders[i]);
  }
  if (missing.length === 0) return _readHeaderMap(sheet);

  var currentLastCol = Math.max(1, sheet.getLastColumn());
  var appendStart = currentLastCol + 1;
  sheet.getRange(1, appendStart, 1, missing.length).setValues([missing]);
  return _readHeaderMap(sheet);
}

function _resolveHeader(sheet, map, aliases, requiredLabel) {
  var list = Array.isArray(aliases) ? aliases : [];
  for (var i = 0; i < list.length; i += 1) {
    var key = String(list[i] || "").trim();
    if (key && map[key]) return map[key];
  }
  throw new Error("Missing header: " + requiredLabel + " @ " + sheet.getName());
}

function _findRowByValue(sheet, colIndex, value) {
  if (!colIndex || !value) return 0;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  var values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  var needle = String(value).trim();
  for (var i = 0; i < values.length; i += 1) {
    if (String(values[i][0] || "").trim() === needle) {
      return i + 2;
    }
  }
  return 0;
}

function _upsertQuote(input) {
  var rfqId = _normalizeRfqId(input);
  if (!rfqId) return { ok: false, error: "RFQ not found" };

  var quote = _resolveQuoteObject(input);
  if (!quote) return { ok: false, error: "Invalid quote payload" };

  var sheetContext = input.sheetContext || {};
  var spreadsheetName = sheetContext.spreadsheetName || "SKF_Admin_Bao_Gia";
  var tabs = sheetContext.tabs || {};
  var quotesTabCandidates = [tabs.quotes, "BAO_GIA", "QUOTES"];
  var quoteItemsTabCandidates = [tabs.quoteItems, "CHI_TIET_BG", "QUOTE_ITEMS"];

  var files = DriveApp.getFilesByName(spreadsheetName);
  if (!files.hasNext()) return { ok: false, error: "Spreadsheet not found" };
  var ss = SpreadsheetApp.open(files.next());

  var quotesSheet = _sheetByAnyName(ss, quotesTabCandidates);
  var quoteItemsSheet = _sheetByAnyName(ss, quoteItemsTabCandidates);

  var quoteHeaders = _ensureHeader(quotesSheet, [
    "ma_bao_gia",
    "ma_yeu_cau",
    "don_vi_tien",
    "ck_tong_pt",
    "vat_pt",
    "phi_van_chuyen",
    "ghi_chu",
    "cap_nhat",
    "quote_id",
    "rfq_id",
    "currency",
    "total_discount_percent",
    "vat_percent",
    "shipping_fee",
    "note",
    "updated_at"
  ]);

  var quoteItemsHeaders = _ensureHeader(quoteItemsSheet, [
    "ma_bao_gia",
    "ma_yeu_cau",
    "stt",
    "ma_hang",
    "ma_chuan",
    "ten_san_pham",
    "so_luong",
    "don_vi",
    "ghi_chu_khach",
    "gia_noi_bo",
    "ck_dong_pt",
    "ghi_chu",
    "cap_nhat",
    "quote_id",
    "rfq_id",
    "line_no",
    "code",
    "normalized_code",
    "name",
    "quantity",
    "unit",
    "customer_note",
    "internal_price",
    "line_discount_percent",
    "note",
    "updated_at"
  ]);

  var qQuoteId = _resolveHeader(quotesSheet, quotesHeaders, ["ma_bao_gia", "quote_id"], "quote id");
  var qRfqId = _resolveHeader(quotesSheet, quotesHeaders, ["ma_yeu_cau", "rfq_id"], "rfq id");
  var qCurrency = _resolveHeader(quotesSheet, quotesHeaders, ["don_vi_tien", "currency"], "currency");
  var qTotalDiscount = _resolveHeader(quotesSheet, quotesHeaders, ["ck_tong_pt", "total_discount_percent"], "total discount");
  var qVat = _resolveHeader(quotesSheet, quotesHeaders, ["vat_pt", "vat_percent"], "vat percent");
  var qShipping = _resolveHeader(quotesSheet, quotesHeaders, ["phi_van_chuyen", "shipping_fee"], "shipping fee");
  var qNote = _resolveHeader(quotesSheet, quotesHeaders, ["ghi_chu", "note"], "note");
  var qUpdatedAt = _resolveHeader(quotesSheet, quotesHeaders, ["cap_nhat", "updated_at"], "updated at");

  var qiQuoteId = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ma_bao_gia", "quote_id"], "quote item quote id");
  var qiRfqId = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ma_yeu_cau", "rfq_id"], "quote item rfq id");
  var qiLineNo = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["stt", "line_no"], "line no");
  var qiCode = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ma_hang", "code"], "code");
  var qiNormalizedCode = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ma_chuan", "normalized_code"], "normalized code");
  var qiName = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ten_san_pham", "name"], "name");
  var qiQuantity = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["so_luong", "quantity"], "quantity");
  var qiUnit = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["don_vi", "unit"], "unit");
  var qiCustomerNote = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ghi_chu_khach", "customer_note"], "customer note");
  var qiInternalPrice = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["gia_noi_bo", "internal_price"], "internal price");
  var qiLineDiscount = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ck_dong_pt", "line_discount_percent"], "line discount percent");
  var qiNote = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["ghi_chu", "note"], "quote item note");
  var qiUpdatedAt = _resolveHeader(quoteItemsSheet, quoteItemsHeaders, ["cap_nhat", "updated_at"], "quote item updated at");

  var quoteId = "Q-" + rfqId;
  var nowIso = new Date().toISOString();

  var quoteRowValues = new Array(quotesSheet.getLastColumn()).fill("");
  quoteRowValues[qQuoteId - 1] = quoteId;
  quoteRowValues[qRfqId - 1] = rfqId;
  quoteRowValues[qCurrency - 1] = quote.currency || "VND";
  quoteRowValues[qTotalDiscount - 1] = Number(quote.totalDiscountPercent || 0);
  quoteRowValues[qVat - 1] = Number(quote.vatPercent || 0);
  quoteRowValues[qShipping - 1] = Number(quote.shippingFee || 0);
  quoteRowValues[qNote - 1] = String(quote.note || "");
  quoteRowValues[qUpdatedAt - 1] = nowIso;

  var existingQuoteRow = _findRowByValue(quotesSheet, qRfqId, rfqId);
  if (existingQuoteRow > 0) {
    quotesSheet.getRange(existingQuoteRow, 1, 1, quoteRowValues.length).setValues([quoteRowValues]);
  } else {
    quotesSheet.appendRow(quoteRowValues);
  }

  var quoteItemsLastRow = quoteItemsSheet.getLastRow();
  if (quoteItemsLastRow >= 2) {
    var rfqCol = qiRfqId;
    var existing = quoteItemsSheet.getRange(2, rfqCol, quoteItemsLastRow - 1, 1).getValues();
    for (var i = existing.length - 1; i >= 0; i -= 1) {
      if (String(existing[i][0] || "").trim() === rfqId) {
        quoteItemsSheet.deleteRow(i + 2);
      }
    }
  }

  var lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : [];
  for (var li = 0; li < lineItems.length; li += 1) {
    var line = lineItems[li] || {};
    var row = new Array(quoteItemsSheet.getLastColumn()).fill("");
    row[qiQuoteId - 1] = quoteId;
    row[qiRfqId - 1] = rfqId;
    row[qiLineNo - 1] = li + 1;
    row[qiCode - 1] = String(line.code || "");
    row[qiNormalizedCode - 1] = String(line.normalizedCode || "");
    row[qiName - 1] = String(line.name || "");
    row[qiQuantity - 1] = Number(line.quantity || 0);
    row[qiUnit - 1] = String(line.unit || "");
    row[qiCustomerNote - 1] = String(line.customerNote || "");
    row[qiInternalPrice - 1] = line.internalPrice == null ? "" : Number(line.internalPrice || 0);
    row[qiLineDiscount - 1] = Number(line.lineDiscountPercent || 0);
    row[qiNote - 1] = String(line.note || "");
    row[qiUpdatedAt - 1] = nowIso;
    quoteItemsSheet.appendRow(row);
  }

  return {
    ok: true,
    quote_id: quoteId,
    rfq_id: rfqId,
    items_count: lineItems.length
  };
}

/**
 * Example integration into doPost:
 *
 * function doPost(e) {
 *   try {
 *     var body = JSON.parse(e.postData.contents || "{}");
 *     var action = String(body.action || "").trim();
 *
 *     if (action === "update_quote" || action === "save_quote" || action === "upsert_quote") {
 *       var result = _upsertQuote(body);
 *       return result.ok ? _jsonOk(result) : _jsonError(result.error);
 *     }
 *
 *     // existing actions...
 *   } catch (err) {
 *     return _jsonError(err && err.message ? err.message : "Unhandled error");
 *   }
 * }
 */
