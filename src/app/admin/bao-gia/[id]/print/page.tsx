import Image from "next/image";
import { buildAdminQuoteText, calculateQuoteDraft, formatCurrencyVnd } from "@/lib/admin/quote";
import { buildProactiveQuoteCopyText, calculateProactiveQuote, getAdminQuoteSourceLabel, getAdminQuoteStatusLabel, hydrateProactiveQuote } from "@/lib/admin/proactive-quote";
import { getProactiveQuoteById } from "@/lib/admin/proactive-quote-store";
import { getAdminRfqDetail } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PrintSearchParams = {
  mode?: string | string[];
  logBy?: string | string[];
  logSource?: string | string[];
  /** base64url-encoded AdminProactiveQuoteRecord — fallback when store lookup misses (serverless cold-start). */
  d?: string | string[];
};

function normalizeQueryValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return `${value ?? ""}`;
}

function resolveExportLog(quoteId: string, searchParams?: PrintSearchParams) {
  const isPdfMode = normalizeQueryValue(searchParams?.mode) === "pdf";
  if (!isPdfMode) {
    return null;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const timestampCompact = nowIso.replace(/[^0-9]/g, "").slice(0, 14);
  const logBy = normalizeQueryValue(searchParams?.logBy) || "admin-web";
  const logSource = normalizeQueryValue(searchParams?.logSource) || "admin-proactive-quote";

  return {
    mode: "PDF",
    logId: `PDF-${quoteId}-${timestampCompact}`,
    logAt: nowIso,
    logBy,
    logSource,
  };
}

function decodeQuoteParam(rawD?: string | string[]) {
  const encoded = normalizeQueryValue(rawD);
  if (!encoded) return null;
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf-8");
    return hydrateProactiveQuote(JSON.parse(json));
  } catch {
    return null;
  }
}

function ExportLogBlock({ log }: { log: ReturnType<typeof resolveExportLog> }) {
  if (!log) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
      <h2 className="font-heading text-base font-bold text-slate-900">Log xuất file</h2>
      <div className="mt-2 grid gap-1">
        <p>Chế độ xuất: {log.mode}</p>
        <p>Mã log: {log.logId}</p>
        <p>Thời gian xuất: {new Date(log.logAt).toLocaleString("vi-VN")}</p>
        <p>Nguồn xuất: {log.logSource}</p>
        <p>Thực hiện bởi: {log.logBy}</p>
      </div>
    </section>
  );
}

export default async function AdminBaoGiaPrintPage({ params, searchParams }: { params: { id: string }; searchParams?: PrintSearchParams }) {
  const exportLog = resolveExportLog(params.id, searchParams);
  const printedAt = new Date().toLocaleString("vi-VN");
  const proactiveQuote = (await getProactiveQuoteById(params.id)) ?? decodeQuoteParam(searchParams?.d);
  if (proactiveQuote) {
    const calculated = calculateProactiveQuote(proactiveQuote);
    const quoteText = buildProactiveQuoteCopyText(proactiveQuote, "zalo");

    return (
      <div className="mx-auto max-w-5xl bg-slate-100 px-4 py-6 text-slate-900 print:max-w-none print:bg-white print:p-0">
        <div className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm print:rounded-none print:border print:shadow-none">
          <header className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Image src="/images/logo-skf-cong-nghiep-header.png" alt="SKF Cong Nghiep" width={240} height={60} className="h-11 w-auto" priority />
                <h1 className="mt-3 font-heading text-3xl font-bold text-slate-900">Báo giá chủ động</h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">SKF Industrial Solutions</p>
              </div>

              <div className="min-w-[240px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                <p><span className="font-semibold text-slate-700">Mã báo giá:</span> {proactiveQuote.quote_id}</p>
                <p><span className="font-semibold text-slate-700">Nguồn:</span> {getAdminQuoteSourceLabel(proactiveQuote.source_type)}</p>
                <p><span className="font-semibold text-slate-700">Trạng thái:</span> {getAdminQuoteStatusLabel(proactiveQuote.status)}</p>
                <p><span className="font-semibold text-slate-700">Ngày in:</span> {printedAt}</p>
              </div>
            </div>
          </header>

          <section className="mt-4 rounded-xl border border-slate-300 bg-white p-4 text-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Thông tin khách hàng</h2>
            <div className="grid gap-1 sm:grid-cols-2">
              <p><span className="font-semibold">Khách hàng:</span> {proactiveQuote.customer.name || "Khách lẻ"}</p>
              <p><span className="font-semibold">SĐT/Zalo:</span> {proactiveQuote.customer.phoneOrZalo || ""}</p>
              <p><span className="font-semibold">Email:</span> {proactiveQuote.customer.email || "-"}</p>
              <p><span className="font-semibold">Công ty:</span> {proactiveQuote.customer.company || "-"}</p>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-300">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Mã</th>
                <th className="px-4 py-3 font-semibold">Tên</th>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Đơn giá sau CK</th>
                <th className="px-4 py-3 font-semibold">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {calculated.items.map((line) => (
                <tr key={`${line.normalizedCode}-${line.code}`} className="border-t border-slate-300">
                  <td className="px-4 py-3 font-semibold">{line.code}</td>
                  <td className="px-4 py-3">{line.name}</td>
                  <td className="px-4 py-3">{line.quantity}</td>
                  <td className="px-4 py-3">{formatCurrencyVnd(line.unitPriceAfterDiscount)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrencyVnd(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <h2 className="font-heading text-lg font-bold text-slate-900">Nội dung tư vấn nhanh</h2>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">{quoteText}</pre>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-white p-4 text-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Tổng hợp giá trị</h2>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between py-1"><span>Tạm tính</span><span className="font-semibold">{formatCurrencyVnd(calculated.totals.subtotal)}</span></div>
                <div className="flex items-center justify-between py-1"><span>CK tổng</span><span className="font-semibold">-{formatCurrencyVnd(calculated.totals.totalDiscountAmount)}</span></div>
                <div className="flex items-center justify-between py-1"><span>VAT</span><span className="font-semibold">+{formatCurrencyVnd(calculated.totals.vatAmount)}</span></div>
                <div className="flex items-center justify-between py-1"><span>Phí giao hàng</span><span className="font-semibold">+{formatCurrencyVnd(proactiveQuote.shippingFee)}</span></div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-300 pt-3 text-base"><span className="font-semibold">Tổng cộng</span><span className="font-bold text-blue-900">{formatCurrencyVnd(calculated.totals.grandTotal)}</span></div>
              </div>
            </div>
          </section>

          <ExportLogBlock log={exportLog} />
        </div>
      </div>
    );
  }

  const detail = await getAdminRfqDetail(params.id);
  if (!detail) {
    return <div className="p-8 text-sm text-red-700">Không tìm thấy RFQ để in.</div>;
  }

  const calculated = calculateQuoteDraft(detail.quote);
  const quoteText = buildAdminQuoteText(detail, detail.quote);

  return (
    <div className="mx-auto max-w-5xl bg-slate-100 px-4 py-6 text-slate-900 print:max-w-none print:bg-white print:p-0">
      <div className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-sm print:rounded-none print:border print:shadow-none">
        <header className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Image src="/images/logo-skf-cong-nghiep-header.png" alt="SKF Cong Nghiep" width={240} height={60} className="h-11 w-auto" priority />
              <h1 className="mt-3 font-heading text-3xl font-bold text-slate-900">Báo giá sản phẩm</h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">SKF Industrial Solutions</p>
            </div>

            <div className="min-w-[240px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
              <p><span className="font-semibold text-slate-700">Mã RFQ:</span> {detail.id}</p>
              <p><span className="font-semibold text-slate-700">Khách hàng:</span> {detail.customer.name}</p>
              <p><span className="font-semibold text-slate-700">Ngày tạo RFQ:</span> {new Date(detail.createdAt).toLocaleString("vi-VN")}</p>
              <p><span className="font-semibold text-slate-700">Ngày in:</span> {printedAt}</p>
            </div>
          </div>
        </header>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-300">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Mã</th>
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">SL</th>
              <th className="px-4 py-3 font-semibold">Đơn giá sau CK</th>
              <th className="px-4 py-3 font-semibold">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {calculated.lineItems.map((line) => (
              <tr key={line.code} className="border-t border-slate-300">
                <td className="px-4 py-3 font-semibold">{line.code}</td>
                <td className="px-4 py-3">{line.name}</td>
                <td className="px-4 py-3">{line.quantity} {line.unit}</td>
                <td className="px-4 py-3">{formatCurrencyVnd(line.unitPriceAfterDiscount)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrencyVnd(line.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
            <h2 className="font-heading text-lg font-bold text-slate-900">Nội dung tư vấn nhanh</h2>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">{quoteText}</pre>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Tổng hợp giá trị</h2>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between py-1"><span>Tạm tính</span><span className="font-semibold">{formatCurrencyVnd(calculated.totals.subtotal)}</span></div>
              <div className="flex items-center justify-between py-1"><span>CK tổng</span><span className="font-semibold">-{formatCurrencyVnd(calculated.totals.totalDiscountAmount)}</span></div>
              <div className="flex items-center justify-between py-1"><span>VAT</span><span className="font-semibold">+{formatCurrencyVnd(calculated.totals.vatAmount)}</span></div>
              <div className="flex items-center justify-between py-1"><span>Phí giao hàng</span><span className="font-semibold">+{formatCurrencyVnd(detail.quote.shippingFee)}</span></div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-300 pt-3 text-base"><span className="font-semibold">Tổng cộng</span><span className="font-bold text-blue-900">{formatCurrencyVnd(calculated.totals.grandTotal)}</span></div>
            </div>
          </div>
        </section>

        <ExportLogBlock log={exportLog} />
      </div>
    </div>
  );
}