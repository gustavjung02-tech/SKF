"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_RFQ_STATUSES, buildAdminQuoteText, calculateQuoteDraft, formatCurrencyVnd, getAdminStatusLabel, normalizeAdminStatus, type AdminQuoteDraft, type AdminRfqDetail } from "@/lib/admin/quote";

function badgeVariantForStatus(status: string) {
  switch (status) {
    case "sent":
      return "default" as const;
    case "quoted":
      return "secondary" as const;
    case "closed":
      return "outline" as const;
    default:
      return "ghost" as const;
  }
}

type Props = {
  detail: AdminRfqDetail;
};

export function RfqQuoteEditor({ detail }: Props) {
  const [quote, setQuote] = useState<AdminQuoteDraft>(detail.quote);
  const [status, setStatus] = useState(detail.status);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const calculated = calculateQuoteDraft(quote);

  function updateLine(index: number, patch: Partial<AdminQuoteDraft["lineItems"][number]>) {
    setQuote((current) => ({
      ...current,
      lineItems: current.lineItems.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)),
    }));
  }

  function saveDraft() {
    setFeedback("");
    startTransition(async () => {
      const response = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfqId: detail.id, quote }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      setFeedback(payload.ok ? "Đã lưu bản nháp báo giá." : payload.error ?? "Không lưu được bản nháp báo giá.");
    });
  }

  function saveStatus() {
    setFeedback("");
    startTransition(async () => {
      const response = await fetch(`/api/admin/rfq/${detail.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      setFeedback(payload.ok ? "Đã cập nhật trạng thái RFQ." : payload.error ?? "Không cập nhật được trạng thái RFQ.");
    });
  }

  function copyQuote() {
    const text = buildAdminQuoteText(detail, quote);
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setFeedback("Đã copy nội dung báo giá để gửi Zalo/email.");
      } catch {
        setFeedback("Không copy được tự động. Vui lòng dùng trang in HTML để copy thủ công.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badgeVariantForStatus(status)}>{getAdminStatusLabel(status)}</Badge>
              <span className="text-xs text-slate-500">RFQ: {detail.id}</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-950">Xử lý phiếu yêu cầu báo giá SKF</h1>
            <p className="text-sm text-slate-600">Khách: {detail.customer.name || "Chưa rõ tên"} | SĐT/Zalo: {detail.customer.zalo || detail.customer.phone || "Chưa có"}</p>
            {detail.customer.company ? <p className="text-sm text-slate-600">Công ty: {detail.customer.company}</p> : null}
            {detail.customer.note ? <p className="text-sm text-slate-600">Ghi chú khách: {detail.customer.note}</p> : null}
          </div>

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button type="button" variant="outline" onClick={copyQuote} disabled={isPending}>
              Copy báo giá Zalo/email
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href={`/admin/bao-gia/${detail.id}/print`} target="_blank">
                Mở bản in HTML
              </Link>
            </Button>
            <Button type="button" className="bg-blue-800 text-white hover:bg-blue-900" onClick={saveDraft} disabled={isPending}>
              Lưu bản nháp
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mã</th>
                  <th className="px-4 py-3 font-semibold">Tên</th>
                  <th className="px-4 py-3 font-semibold">SL</th>
                  <th className="px-4 py-3 font-semibold">Giá nội bộ</th>
                  <th className="px-4 py-3 font-semibold">CK dòng %</th>
                  <th className="px-4 py-3 font-semibold">Đơn giá sau CK</th>
                  <th className="px-4 py-3 font-semibold">Thành tiền</th>
                  <th className="px-4 py-3 font-semibold">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((line, index) => {
                  const calculatedLine = calculated.lineItems[index];

                  return (
                    <tr key={`${line.code}-${index}`} className="border-t border-slate-200 align-top">
                      <td className="px-4 py-3 font-semibold text-slate-900">{line.code}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{line.name}</p>
                          {line.customerNote ? <p className="text-xs text-slate-500">YC khách: {line.customerNote}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          inputMode="numeric"
                          value={`${line.quantity}`}
                          onChange={(event) => updateLine(index, { quantity: Number(event.target.value.replace(/[^0-9]/g, "")) || 1 })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <Input
                            inputMode="numeric"
                            className="min-w-[7rem]"
                            value={line.internalPrice ? `${line.internalPrice}` : ""}
                            onChange={(event) => updateLine(index, { internalPrice: Number(event.target.value.replace(/[^0-9]/g, "")) || null })}
                            placeholder="Chưa có giá"
                          />
                          {!line.internalPrice ? <p className="text-xs text-amber-700">Chưa tìm thấy từ PRICE_MASTER.</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          inputMode="decimal"
                          value={`${line.lineDiscountPercent}`}
                          onChange={(event) => updateLine(index, { lineDiscountPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatCurrencyVnd(calculatedLine.unitPriceAfterDiscount)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-950">{formatCurrencyVnd(calculatedLine.lineTotal)}</td>
                      <td className="px-4 py-3">
                        <Textarea rows={3} value={line.note} onChange={(event) => updateLine(index, { note: event.target.value })} placeholder="Ghi chú nội bộ hoặc ghi chú dòng báo giá" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-slate-950">Tổng hợp báo giá</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="total-discount">CK tổng %</Label>
                <Input id="total-discount" inputMode="decimal" value={`${quote.totalDiscountPercent}`} onChange={(event) => setQuote((current) => ({ ...current, totalDiscountPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vat-percent">VAT %</Label>
                <Input id="vat-percent" inputMode="decimal" value={`${quote.vatPercent}`} onChange={(event) => setQuote((current) => ({ ...current, vatPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shipping-fee">Phí giao hàng</Label>
                <Input id="shipping-fee" inputMode="numeric" value={`${quote.shippingFee}`} onChange={(event) => setQuote((current) => ({ ...current, shippingFee: Number(event.target.value.replace(/[^0-9]/g, "")) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote-note">Ghi chú tổng</Label>
                <Textarea id="quote-note" rows={4} value={quote.note} onChange={(event) => setQuote((current) => ({ ...current, note: event.target.value }))} placeholder="Điều kiện giao hàng, thời gian hiệu lực báo giá..." />
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-600">Tạm tính</span><span className="font-semibold text-slate-950">{formatCurrencyVnd(calculated.totals.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-600">CK tổng</span><span className="font-semibold text-slate-950">{calculated.totals.totalDiscountAmount > 0 ? `-${formatCurrencyVnd(calculated.totals.totalDiscountAmount)}` : formatCurrencyVnd(0)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-600">VAT</span><span className="font-semibold text-slate-950">+{formatCurrencyVnd(calculated.totals.vatAmount)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-600">Phí giao hàng</span><span className="font-semibold text-slate-950">+{formatCurrencyVnd(quote.shippingFee)}</span></div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base"><span className="font-semibold text-slate-900">Tổng cộng</span><span className="font-bold text-blue-900">{formatCurrencyVnd(calculated.totals.grandTotal)}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-slate-950">Trạng thái</h2>
            <div className="mt-4 space-y-3">
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400"
                value={status}
                onChange={(event) => setStatus(normalizeAdminStatus(event.target.value))}
              >
                {ADMIN_RFQ_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {getAdminStatusLabel(option)}
                  </option>
                ))}
              </select>
              <Button type="button" variant="outline" className="w-full" onClick={saveStatus} disabled={isPending}>
                Cập nhật trạng thái
              </Button>
            </div>

            {feedback ? <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{feedback}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}