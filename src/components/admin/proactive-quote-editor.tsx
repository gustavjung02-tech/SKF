"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ADMIN_QUOTE_SOURCE_TYPES,
  ADMIN_QUOTE_STATUSES,
  buildProactiveQuoteCopyText,
  calculateProactiveQuote,
  createEmptyProactiveQuote,
  getAdminQuoteSourceLabel,
  getAdminQuoteStatusLabel,
  normalizeAdminQuoteSourceType,
  normalizeAdminQuoteStatus,
  normalizeProactiveQuoteItem,
  type AdminProactiveQuoteItem,
  type AdminProactiveQuoteRecord,
} from "@/lib/admin/proactive-quote";
import { formatCurrencyVnd } from "@/lib/admin/quote";
import type { AdminCatalogSearchResult } from "@/lib/admin/catalog-search";

type Props = {
  initialQuote?: AdminProactiveQuoteRecord;
};

function statusBadgeVariant(status: string) {
  if (status === "won") return "default" as const;
  if (status === "sent") return "secondary" as const;
  if (status === "lost" || status === "cancelled") return "outline" as const;
  return "ghost" as const;
}

export function ProactiveQuoteEditor({ initialQuote }: Props) {
  const [quote, setQuote] = useState<AdminProactiveQuoteRecord>(initialQuote ?? createEmptyProactiveQuote());
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<AdminCatalogSearchResult[]>([]);

  const calculated = useMemo(() => calculateProactiveQuote(quote), [quote]);

  useEffect(() => {
    const query = searchInput.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/admin/quotes/catalog-search?q=${encodeURIComponent(query)}`, {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as { ok?: boolean; items?: AdminCatalogSearchResult[]; error?: string };
        if (!response.ok || !payload.ok) {
          setSearchResults([]);
          setFeedback(payload.error ?? "Không tra được mã sản phẩm.");
          return;
        }

        setSearchResults(payload.items ?? []);
      } catch {
        setSearchResults([]);
        setFeedback("Không tra được mã sản phẩm.");
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  function updateCustomer<K extends keyof AdminProactiveQuoteRecord["customer"]>(key: K, value: AdminProactiveQuoteRecord["customer"][K]) {
    setQuote((current) => ({
      ...current,
      customer: {
        ...current.customer,
        [key]: value,
      },
    }));
  }

  function updateItem(index: number, patch: Partial<AdminProactiveQuoteItem>) {
    setQuote((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? normalizeProactiveQuoteItem({ ...item, ...patch }) : item)),
    }));
  }

  function removeItem(index: number) {
    setQuote((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addItemFromCatalog(item: AdminCatalogSearchResult) {
    setQuote((current) => {
      const exists = current.items.some((line) => line.normalizedCode === item.normalizedCode);
      if (exists) {
        return current;
      }

      return {
        ...current,
        items: [
          ...current.items,
          {
            code: item.code,
            normalizedCode: item.normalizedCode,
            name: item.name,
            productGroup: item.productGroup,
            productGroupLabel: item.productGroupLabel,
            quantity: 1,
            internalPrice: item.internalPrice,
            lineDiscountPercent: 0,
            note: "",
          },
        ],
      };
    });

    setSearchInput("");
    setSearchResults([]);
  }

  function copyQuote(mode: "zalo" | "email") {
    if (quote.items.length === 0) {
      setFeedback("Vui lòng thêm ít nhất 1 sản phẩm trước khi copy báo giá.");
      return;
    }

    const text = buildProactiveQuoteCopyText(
      {
        ...quote,
        subtotal: calculated.totals.subtotal,
        total: calculated.totals.grandTotal,
      },
      mode,
    );

    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setFeedback(mode === "zalo" ? "Đã copy nội dung báo giá Zalo." : "Đã copy nội dung báo giá Email.");
      } catch {
        setFeedback("Không copy được tự động. Vui lòng copy thủ công từ bản in HTML.");
      }
    });
  }

  function saveQuote() {
    if (quote.items.length === 0) {
      setFeedback("Vui lòng thêm ít nhất 1 sản phẩm.");
      return;
    }

    setFeedback("");
    startTransition(async () => {
      const response = await fetch("/api/admin/quotes/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote: {
            ...quote,
            subtotal: calculated.totals.subtotal,
            total: calculated.totals.grandTotal,
          },
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; quote?: AdminProactiveQuoteRecord; error?: string };
      if (!response.ok || !payload.ok || !payload.quote) {
        setFeedback(payload.error ?? "Không lưu được báo giá chủ động.");
        return;
      }

      setQuote(payload.quote);
      setFeedback("Đã lưu báo giá chủ động.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusBadgeVariant(quote.status)}>{getAdminQuoteStatusLabel(quote.status)}</Badge>
              <Badge variant="outline">{getAdminQuoteSourceLabel(quote.source_type)}</Badge>
              {quote.quote_id ? <span className="text-xs text-slate-500">Mã: {quote.quote_id}</span> : null}
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-950">Tạo báo giá chủ động</h1>
            <p className="text-sm text-slate-600">Dùng cho khách gọi điện, Zalo ngoài web, khách cũ hỏi lại hoặc sales chủ động lập báo giá.</p>
          </div>

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button type="button" variant="outline" onClick={() => copyQuote("zalo")} disabled={isPending}>
              Copy báo giá Zalo
            </Button>
            <Button type="button" variant="outline" onClick={() => copyQuote("email")} disabled={isPending}>
              Copy báo giá Email
            </Button>
            {quote.quote_id ? (
              <Button asChild type="button" variant="outline">
                <Link href={`/admin/bao-gia/${encodeURIComponent(quote.quote_id)}/print`} target="_blank">
                  HTML in/print
                </Link>
              </Button>
            ) : null}
            <Button type="button" className="bg-blue-800 text-white hover:bg-blue-900" onClick={saveQuote} disabled={isPending}>
              Lưu báo giá
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-slate-950">Thông tin khách</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5"><Label>Tên khách</Label><Input value={quote.customer.name} onChange={(event) => updateCustomer("name", event.target.value)} /></div>
              <div className="space-y-1.5"><Label>SĐT/Zalo</Label><Input value={quote.customer.phoneOrZalo} onChange={(event) => updateCustomer("phoneOrZalo", event.target.value)} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input value={quote.customer.email} onChange={(event) => updateCustomer("email", event.target.value)} /></div>
              <div className="space-y-1.5"><Label>Công ty</Label><Input value={quote.customer.company} onChange={(event) => updateCustomer("company", event.target.value)} /></div>
              <div className="space-y-1.5"><Label>Tỉnh/Thành</Label><Input value={quote.customer.province} onChange={(event) => updateCustomer("province", event.target.value)} /></div>
              <div className="space-y-1.5">
                <Label>Nguồn quote</Label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400"
                  value={quote.source_type}
                  onChange={(event) => setQuote((current) => ({ ...current, source_type: normalizeAdminQuoteSourceType(event.target.value) }))}
                >
                  {ADMIN_QUOTE_SOURCE_TYPES.map((source) => (
                    <option key={source} value={source}>{getAdminQuoteSourceLabel(source)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2"><Label>Ghi chú khách</Label><Textarea rows={3} value={quote.customer.note} onChange={(event) => updateCustomer("note", event.target.value)} /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-slate-950">Thêm sản phẩm</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Tra mã SKF</Label>
                <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Nhập code hoặc normalizedCode" />
              </div>

              {searchLoading ? <p className="text-xs text-slate-500">Đang tra mã...</p> : null}
              {searchResults.length > 0 ? (
                <div className="rounded-xl border border-slate-200">
                  <div className="max-h-56 overflow-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead className="bg-slate-50 text-left text-slate-600">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Mã</th>
                          <th className="px-3 py-2 font-semibold">Tên</th>
                          <th className="px-3 py-2 font-semibold">Nhóm</th>
                          <th className="px-3 py-2 font-semibold">Giá nội bộ</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((item) => (
                          <tr key={item.normalizedCode} className="border-t border-slate-200">
                            <td className="px-3 py-2 font-semibold text-slate-900">{item.code}</td>
                            <td className="px-3 py-2 text-slate-700">{item.name}</td>
                            <td className="px-3 py-2 text-slate-600">{item.productGroupLabel || item.productGroup}</td>
                            <td className="px-3 py-2 text-slate-700">{item.internalPrice ? formatCurrencyVnd(item.internalPrice) : "Chưa có"}</td>
                            <td className="px-3 py-2 text-right">
                              <Button type="button" size="sm" variant="outline" onClick={() => addItemFromCatalog(item)}>
                                Chọn mã
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Mã</th>
                      <th className="px-3 py-2 font-semibold">Tên / Nhóm</th>
                      <th className="px-3 py-2 font-semibold">SL</th>
                      <th className="px-3 py-2 font-semibold">Giá nội bộ</th>
                      <th className="px-3 py-2 font-semibold">CK dòng %</th>
                      <th className="px-3 py-2 font-semibold">Đơn giá sau CK</th>
                      <th className="px-3 py-2 font-semibold">Thành tiền</th>
                      <th className="px-3 py-2 font-semibold">Ghi chú dòng</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => {
                      const calculatedItem = calculated.items[index];
                      return (
                        <tr key={`${item.normalizedCode}-${index}`} className="border-t border-slate-200 align-top">
                          <td className="px-3 py-2 font-semibold text-slate-900">{item.code}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.productGroupLabel || item.productGroup}</p>
                          </td>
                          <td className="px-3 py-2"><Input inputMode="numeric" value={`${item.quantity}`} onChange={(event) => updateItem(index, { quantity: Number(event.target.value.replace(/[^0-9]/g, "")) || 1 })} /></td>
                          <td className="px-3 py-2"><Input inputMode="numeric" value={item.internalPrice ? `${item.internalPrice}` : ""} placeholder="Chưa có" onChange={(event) => updateItem(index, { internalPrice: Number(event.target.value.replace(/[^0-9]/g, "")) || null })} /></td>
                          <td className="px-3 py-2"><Input inputMode="decimal" value={`${item.lineDiscountPercent}`} onChange={(event) => updateItem(index, { lineDiscountPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 })} /></td>
                          <td className="px-3 py-2 font-medium text-slate-900">{formatCurrencyVnd(calculatedItem?.unitPriceAfterDiscount ?? 0)}</td>
                          <td className="px-3 py-2 font-semibold text-slate-950">{formatCurrencyVnd(calculatedItem?.lineTotal ?? 0)}</td>
                          <td className="px-3 py-2"><Textarea rows={2} value={item.note} onChange={(event) => updateItem(index, { note: event.target.value })} /></td>
                          <td className="px-3 py-2 text-right"><Button type="button" size="sm" variant="outline" onClick={() => removeItem(index)}>Xóa</Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {quote.items.length === 0 ? <p className="px-3 py-4 text-sm text-slate-500">Chưa có sản phẩm nào trong báo giá.</p> : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-slate-950">Tổng & điều kiện</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5"><Label>Chiết khấu tổng %</Label><Input inputMode="decimal" value={`${quote.discountPercent}`} onChange={(event) => setQuote((current) => ({ ...current, discountPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 }))} /></div>
              <div className="space-y-1.5"><Label>VAT %</Label><Input inputMode="decimal" value={`${quote.vatPercent}`} onChange={(event) => setQuote((current) => ({ ...current, vatPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 }))} /></div>
              <div className="space-y-1.5"><Label>Phí giao hàng</Label><Input inputMode="numeric" value={`${quote.shippingFee}`} onChange={(event) => setQuote((current) => ({ ...current, shippingFee: Number(event.target.value.replace(/[^0-9]/g, "")) || 0 }))} /></div>
              <div className="space-y-1.5"><Label>Thời gian giao</Label><Input value={quote.deliveryTime} onChange={(event) => setQuote((current) => ({ ...current, deliveryTime: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Hiệu lực báo giá</Label><Input value={quote.validUntil} onChange={(event) => setQuote((current) => ({ ...current, validUntil: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Điều kiện thanh toán</Label><Input value={quote.paymentTerm} onChange={(event) => setQuote((current) => ({ ...current, paymentTerm: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Ghi chú báo giá</Label><Textarea rows={4} value={quote.note} onChange={(event) => setQuote((current) => ({ ...current, note: event.target.value }))} /></div>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-600">Tạm tính</span><span className="font-semibold text-slate-950">{formatCurrencyVnd(calculated.totals.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-600">CK tổng</span><span className="font-semibold text-slate-950">-{formatCurrencyVnd(calculated.totals.totalDiscountAmount)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-600">VAT</span><span className="font-semibold text-slate-950">+{formatCurrencyVnd(calculated.totals.vatAmount)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-600">Phí giao hàng</span><span className="font-semibold text-slate-950">+{formatCurrencyVnd(quote.shippingFee)}</span></div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base"><span className="font-semibold text-slate-900">Tổng cộng</span><span className="font-bold text-blue-900">{formatCurrencyVnd(calculated.totals.grandTotal)}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-slate-950">Trạng thái quote</h2>
            <div className="mt-4 space-y-3">
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400"
                value={quote.status}
                onChange={(event) => setQuote((current) => ({ ...current, status: normalizeAdminQuoteStatus(event.target.value) }))}
              >
                {ADMIN_QUOTE_STATUSES.map((status) => (
                  <option key={status} value={status}>{getAdminQuoteStatusLabel(status)}</option>
                ))}
              </select>
            </div>
            {feedback ? <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{feedback}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
