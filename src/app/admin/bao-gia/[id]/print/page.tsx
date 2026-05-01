import { buildAdminQuoteText, calculateQuoteDraft, formatCurrencyVnd } from "@/lib/admin/quote";
import { getAdminRfqDetail } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBaoGiaPrintPage({ params }: { params: { id: string } }) {
  const detail = await getAdminRfqDetail(params.id);
  if (!detail) {
    return <div className="p-8 text-sm text-red-700">Không tìm thấy RFQ để in.</div>;
  }

  const calculated = calculateQuoteDraft(detail.quote);
  const quoteText = buildAdminQuoteText(detail, detail.quote);

  return (
    <div className="mx-auto max-w-5xl bg-white px-6 py-8 text-slate-900 print:max-w-none print:p-0">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">SKF Công Nghiệp</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Báo giá nội bộ</h1>
        <p className="mt-2 text-sm text-slate-600">RFQ: {detail.id} | Khách hàng: {detail.customer.name} | Ngày tạo: {new Date(detail.createdAt).toLocaleString("vi-VN")}</p>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
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
              <tr key={line.code} className="border-t border-slate-200">
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

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="font-heading text-lg font-bold">Nội dung để copy</h2>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">{quoteText}</pre>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between py-1"><span>Tạm tính</span><span className="font-semibold">{formatCurrencyVnd(calculated.totals.subtotal)}</span></div>
          <div className="flex items-center justify-between py-1"><span>CK tổng</span><span className="font-semibold">-{formatCurrencyVnd(calculated.totals.totalDiscountAmount)}</span></div>
          <div className="flex items-center justify-between py-1"><span>VAT</span><span className="font-semibold">+{formatCurrencyVnd(calculated.totals.vatAmount)}</span></div>
          <div className="flex items-center justify-between py-1"><span>Phí giao hàng</span><span className="font-semibold">+{formatCurrencyVnd(detail.quote.shippingFee)}</span></div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3 text-base"><span className="font-semibold">Tổng cộng</span><span className="font-bold text-blue-900">{formatCurrencyVnd(calculated.totals.grandTotal)}</span></div>
        </div>
      </section>
    </div>
  );
}