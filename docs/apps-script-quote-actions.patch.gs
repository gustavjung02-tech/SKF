/**
 * Patch for Google Apps Script webhook to support quote actions:
 * - update_quote
 * - save_quote
 * - upsert_quote
 *
 * Expected tabs:
 * - RFQ
 * - RFQ_ITEMS
 * - QUOTES
 * - QUOTE_ITEMS
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
  // Hỗ trợ cả tên tab tiếng Việt mới và tên cũ (fallback)
  var quotesTabName = tabs.quotes || "BAO_GIA";
  var quoteItemsTabName = tabs.quoteItems || "CHI_TIET_BG";

  var files = DriveApp.getFilesByName(spreadsheetName);
  if (!files.hasNext()) return { ok: false, error: "Spreadsheet not found" };
  var ss = SpreadsheetApp.open(files.next());

  // Thử tên tab mới, nếu không có thì thử tên cũ
  var quotesSheet = ss.getSheetByName(quotesTabName) || ss.getSheetByName("QUOTES");
  if (!quotesSheet) return { ok: false, error: "Khong tim thay tab bao gia: " + quotesTabName };
  var quoteItemsSheet = ss.getSheetByName(quoteItemsTabName) || ss.getSheetByName("QUOTE_ITEMS");
  if (!quoteItemsSheet) return { ok: false, error: "Khong tim thay tab chi tiet bao gia: " + quoteItemsTabName };

  // Tiêu đề tiếng Việt cho tab BAO_GIA
  var quoteHeaders = _ensureHeader(quotesSheet, [
    "ma_bao_gia",
    "ma_yeu_cau",
    "don_vi_tien",
    "ck_tong_pt",
    "vat_pt",
    "phi_van_chuyen",
    "ghi_chu",
    "cap_nhat"
  ]);

  // Tiêu đề tiếng Việt cho tab CHI_TIET_BG
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
    "cap_nhat"
  ]);

  var quoteId = "Q-" + rfqId;
  var nowIso = new Date().toISOString();

  // Ghi dòng báo giá tổng
  var quoteRowValues = new Array(quotesSheet.getLastColumn()).fill("");
  quoteRowValues[quoteHeaders["ma_bao_gia"] - 1] = quoteId;
  quoteRowValues[quoteHeaders["ma_yeu_cau"] - 1] = rfqId;
  quoteRowValues[quoteHeaders["don_vi_tien"] - 1] = quote.currency || "VND";
  quoteRowValues[quoteHeaders["ck_tong_pt"] - 1] = Number(quote.totalDiscountPercent || 0);
  quoteRowValues[quoteHeaders["vat_pt"] - 1] = Number(quote.vatPercent || 0);
  quoteRowValues[quoteHeaders["phi_van_chuyen"] - 1] = Number(quote.shippingFee || 0);
  quoteRowValues[quoteHeaders["ghi_chu"] - 1] = String(quote.note || "");
  quoteRowValues[quoteHeaders["cap_nhat"] - 1] = nowIso;

  var existingQuoteRow = _findRowByValue(quotesSheet, quoteHeaders["ma_yeu_cau"], rfqId);
  if (existingQuoteRow > 0) {
    quotesSheet.getRange(existingQuoteRow, 1, 1, quoteRowValues.length).setValues([quoteRowValues]);
  } else {
    quotesSheet.appendRow(quoteRowValues);
  }

  // Xoá dòng cũ trong chi tiết báo giá rồi ghi lại
  var quoteItemsLastRow = quoteItemsSheet.getLastRow();
  if (quoteItemsLastRow >= 2) {
    var rfqCol = quoteItemsHeaders["ma_yeu_cau"];
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
    row[quoteItemsHeaders["ma_bao_gia"] - 1] = quoteId;
    row[quoteItemsHeaders["ma_yeu_cau"] - 1] = rfqId;
    row[quoteItemsHeaders["stt"] - 1] = li + 1;
    row[quoteItemsHeaders["ma_hang"] - 1] = String(line.code || "");
    row[quoteItemsHeaders["ma_chuan"] - 1] = String(line.normalizedCode || "");
    row[quoteItemsHeaders["ten_san_pham"] - 1] = String(line.name || "");
    row[quoteItemsHeaders["so_luong"] - 1] = Number(line.quantity || 0);
    row[quoteItemsHeaders["don_vi"] - 1] = String(line.unit || "");
    row[quoteItemsHeaders["ghi_chu_khach"] - 1] = String(line.customerNote || "");
    row[quoteItemsHeaders["gia_noi_bo"] - 1] = line.internalPrice == null ? "" : Number(line.internalPrice || 0);
    row[quoteItemsHeaders["ck_dong_pt"] - 1] = Number(line.lineDiscountPercent || 0);
    row[quoteItemsHeaders["ghi_chu"] - 1] = String(line.note || "");
    row[quoteItemsHeaders["cap_nhat"] - 1] = nowIso;
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
