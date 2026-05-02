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

type ProductTypeFilter = "all" | "bearings" | "housings" | "seals" | "power-transmission" | "lubrication" | "maintenance";

const PRODUCT_TYPE_OPTIONS: Array<{ value: ProductTypeFilter; label: string }> = [
  { value: "all", label: "Tất cả loại" },
  { value: "bearings", label: "Vòng bi" },
  { value: "housings", label: "Gối đỡ" },
  { value: "seals", label: "Phớt" },
  { value: "power-transmission", label: "Truyền động" },
  { value: "lubrication", label: "Bôi trơn" },
  { value: "maintenance", label: "Bảo trì" },
];

function matchesProductType(item: Pick<AdminCatalogSearchResult, "productGroup" | "productGroupLabel" | "name">, filter: ProductTypeFilter) {
  if (filter === "all") {
    return true;
  }

  const searchableText = `${item.productGroup} ${item.productGroupLabel} ${item.name}`.trim().toLowerCase();
  if (!searchableText) {
    return false;
  }

  if (filter === "bearings") {
    return searchableText.includes("vòng bi") || searchableText.includes("vong bi") || searchableText.includes("bearing");
  }

  if (filter === "housings") {
    return searchableText.includes("gối đỡ") || searchableText.includes("goi do") || searchableText.includes("housing");
  }

  if (filter === "seals") {
    return searchableText.includes("phớt") || searchableText.includes("phot") || searchableText.includes("seal");
  }

  if (filter === "power-transmission") {
    return searchableText.includes("truyền động") || searchableText.includes("truyen dong") || searchableText.includes("belt") || searchableText.includes("xích") || searchableText.includes("xich");
  }

  if (filter === "lubrication") {
    return searchableText.includes("bôi trơn") || searchableText.includes("boi tron") || searchableText.includes("lincoln") || searchableText.includes("mỡ") || searchableText.includes("mo ") || searchableText.includes("grease");
  }

  if (filter === "maintenance") {
    return searchableText.includes("bảo trì") || searchableText.includes("bao tri") || searchableText.includes("dụng cụ") || searchableText.includes("dung cu") || searchableText.includes("maintenance");
  }

  return true;
}

export function ProactiveQuoteEditor({ initialQuote }: Props) {
  const [quote, setQuote] = useState<AdminProactiveQuoteRecord>(initialQuote ?? createEmptyProactiveQuote());
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<ProductTypeFilter>("all");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<AdminCatalogSearchResult[]>([]);
  const [selectedSearchCodes, setSelectedSearchCodes] = useState<string[]>([]);

  const calculated = useMemo(() => calculateProactiveQuote(quote), [quote]);
  const filteredSearchResults = useMemo(
    () => searchResults.filter((item) => matchesProductType(item, selectedProductType)),
    [searchResults, selectedProductType],
  );
  const existingQuoteCodeSet = useMemo(() => new Set(quote.items.map((item) => item.normalizedCode)), [quote.items]);
  const selectableFilteredResults = useMemo(
    () => filteredSearchResults.filter((item) => !existingQuoteCodeSet.has(item.normalizedCode)),
    [filteredSearchResults, existingQuoteCodeSet],
  );
  const allSelectableFilteredChecked = selectableFilteredResults.length > 0 && selectableFilteredResults.every((item) => selectedSearchCodes.includes(item.normalizedCode));
  const quickPreviewItems = useMemo(() => calculated.items.slice(0, 5), [calculated.items]);

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

  useEffect(() => {
    setSelectedSearchCodes((current) => current.filter((code) => filteredSearchResults.some((item) => item.normalizedCode === code)));
  }, [filteredSearchResults]);

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
    setSelectedSearchCodes((current) => current.filter((code) => code !== item.normalizedCode));
  }

  function toggleSearchSelection(normalizedCode: string, checked: boolean) {
    setSelectedSearchCodes((current) => {
      if (checked) {
        return current.includes(normalizedCode) ? current : [...current, normalizedCode];
      }

      return current.filter((code) => code !== normalizedCode);
    });
  }

  function toggleSelectAllFiltered(checked: boolean) {
    if (!checked) {
      setSelectedSearchCodes((current) => current.filter((code) => !selectableFilteredResults.some((item) => item.normalizedCode === code)));
      return;
    }

    setSelectedSearchCodes((current) => {
      const merged = new Set(current);
      for (const item of selectableFilteredResults) {
        merged.add(item.normalizedCode);
      }
      return Array.from(merged);
    });
  }

  function addSelectedItemsFromCatalog() {
    if (selectedSearchCodes.length === 0) {
      return;
    }

    setQuote((current) => {
      const existing = new Set(current.items.map((item) => item.normalizedCode));
      const selectedSet = new Set(selectedSearchCodes);
      const nextItems = [...current.items];

      for (const item of searchResults) {
        if (!selectedSet.has(item.normalizedCode) || existing.has(item.normalizedCode)) {
          continue;
        }

        nextItems.push({
          code: item.code,
          normalizedCode: item.normalizedCode,
          name: item.name,
          productGroup: item.productGroup,
          productGroupLabel: item.productGroupLabel,
          quantity: 1,
          internalPrice: item.internalPrice,
          lineDiscountPercent: 0,
          note: "",
        });
      }

      return {
        ...current,
        items: nextItems,
      };
    });

    setSelectedSearchCodes([]);
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
      const saved = await persistQuote();
      if (!saved) {
        return;
      }

      setFeedback("Đã lưu báo giá chủ động.");
    });
  }

  async function persistQuote() {
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
      return null;
    }

    setQuote(payload.quote);
    return payload.quote;
  }

  function exportPdfWithLog() {
    if (quote.items.length === 0) {
      setFeedback("Vui lòng thêm ít nhất 1 sản phẩm trước khi xuất PDF.");
      return;
    }

    setFeedback("");
    startTransition(async () => {
      const saved = await persistQuote();
      if (!saved?.quote_id) {
        return;
      }

        const encoded = Buffer.from(JSON.stringify(saved)).toString("base64url");
        const exportUrl = `/admin/bao-gia/${encodeURIComponent(saved.quote_id)}/print?mode=pdf&d=${encoded}`;

      const printWindow = window.open(exportUrl, "_blank", "noopener,noreferrer");
      if (printWindow) {
        window.setTimeout(() => {
          try {
            printWindow.print();
          } catch {
            // Fallback to manual Ctrl+P in opened tab when browser blocks auto-print.
          }
        }, 900);
      }

      setFeedback("Đã mở chế độ xuất PDF. File in sẽ kèm log xuất ở cuối trang.");
    });
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="overflow-hidden rounded-[28px] border border-[#274f87] bg-[radial-gradient(circle_at_top_left,rgba(248,205,70,0.16),transparent_24%),linear-gradient(135deg,#07162e_0%,#0a1d3f_52%,#102b56_100%)] p-6 shadow-[0_28px_90px_rgba(2,6,23,0.42)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border border-[#3e6ba9] bg-[#10315d] text-slate-100" variant={statusBadgeVariant(quote.status)}>{getAdminQuoteStatusLabel(quote.status)}</Badge>
              <Badge className="border border-[#f7c948]/30 bg-[#1f2f16] text-[#f7c948]" variant="outline">{getAdminQuoteSourceLabel(quote.source_type)}</Badge>
              {quote.quote_id ? <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Mã: {quote.quote_id}</span> : null}
            </div>
            <h1 className="font-heading text-3xl font-bold text-white">Tạo báo giá chủ động</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">Không gian làm quote được tối ưu cho đội vận hành: tra mã nhanh, lọc đúng nhóm hàng và giữ toàn bộ báo giá trong một giao diện dark theo màu SKF.</p>
          </div>

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button type="button" variant="outline" className="border-[#315d95] bg-[#0a1a34] text-slate-100 hover:bg-[#13305b] hover:text-white" onClick={() => copyQuote("zalo")} disabled={isPending}>
              Copy báo giá Zalo
            </Button>
            <Button type="button" variant="outline" className="border-[#315d95] bg-[#0a1a34] text-slate-100 hover:bg-[#13305b] hover:text-white" onClick={() => copyQuote("email")} disabled={isPending}>
              Copy báo giá Email
            </Button>
            {quote.quote_id ? (
              <Button asChild type="button" variant="outline" className="border-[#315d95] bg-[#0a1a34] text-slate-100 hover:bg-[#13305b] hover:text-white">
                <Link href={`/admin/bao-gia/${encodeURIComponent(quote.quote_id)}/print`} target="_blank">
                  HTML in/print
                </Link>
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="border-[#f7c948]/50 bg-[#1f2f16] text-[#f7c948] hover:bg-[#2b3f1d] hover:text-[#ffe081]" onClick={exportPdfWithLog} disabled={isPending}>
              Xuất PDF + log
            </Button>
            <Button type="button" className="border border-[#f7c948]/40 bg-[#f7c948] text-[#08101f] hover:bg-[#ffd967]" onClick={saveQuote} disabled={isPending}>
              Lưu báo giá
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#1e3b68] bg-[linear-gradient(180deg,rgba(6,18,39,0.98),rgba(10,27,56,0.94))] p-4 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <h2 className="font-heading text-base font-bold text-white">Thông tin khách</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1"><Label className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-300">Tên khách</Label><Input className="h-9 border-[#214a86] bg-[#08162d] text-sm text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.customer.name} onChange={(event) => updateCustomer("name", event.target.value)} /></div>
              <div className="space-y-1"><Label className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-300">SĐT/Zalo</Label><Input className="h-9 border-[#214a86] bg-[#08162d] text-sm text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.customer.phoneOrZalo} onChange={(event) => updateCustomer("phoneOrZalo", event.target.value)} /></div>
              <div className="space-y-1"><Label className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-300">Email</Label><Input className="h-9 border-[#214a86] bg-[#08162d] text-sm text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.customer.email} onChange={(event) => updateCustomer("email", event.target.value)} /></div>
              <div className="space-y-1"><Label className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-300">Công ty</Label><Input className="h-9 border-[#214a86] bg-[#08162d] text-sm text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.customer.company} onChange={(event) => updateCustomer("company", event.target.value)} /></div>
              <div className="space-y-1"><Label className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-300">Tỉnh/Thành</Label><Input className="h-9 border-[#214a86] bg-[#08162d] text-sm text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.customer.province} onChange={(event) => updateCustomer("province", event.target.value)} /></div>
              <div className="space-y-1.5">
                <Label className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-300">Nguồn quote</Label>
                <select
                  className="h-9 w-full rounded-lg border border-[#214a86] bg-[#08162d] px-3 text-sm text-slate-50 outline-none focus:border-[#f7c948]"
                  value={quote.source_type}
                  onChange={(event) => setQuote((current) => ({ ...current, source_type: normalizeAdminQuoteSourceType(event.target.value) }))}
                >
                  {ADMIN_QUOTE_SOURCE_TYPES.map((source) => (
                    <option key={source} value={source}>{getAdminQuoteSourceLabel(source)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2 xl:col-span-3"><Label className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-300">Ghi chú khách</Label><Textarea className="min-h-16 border-[#214a86] bg-[#08162d] text-sm text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" rows={2} value={quote.customer.note} onChange={(event) => updateCustomer("note", event.target.value)} /></div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1e3b68] bg-[linear-gradient(180deg,rgba(6,18,39,0.98),rgba(10,27,56,0.94))] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-white">Thêm sản phẩm</h2>
                <p className="mt-1 text-sm text-slate-400">Tra mã nhanh, lọc đúng ngành hàng và thêm trực tiếp vào báo giá mà không rời màn hình.</p>
              </div>
              <div className="inline-flex items-center rounded-full border border-[#335d95] bg-[#0a1a34] px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                Theme SKF Dark Desk
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-1.5">
                  <Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Tra mã SKF</Label>
                  <Input className="h-12 border-[#214a86] bg-[#08162d] text-lg text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Nhập code hoặc normalizedCode" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Lọc theo loại</Label>
                  <select
                    className="h-12 w-full rounded-lg border border-[#214a86] bg-[#08162d] px-3 text-sm text-slate-50 outline-none focus:border-[#f7c948]"
                    value={selectedProductType}
                    onChange={(event) => setSelectedProductType(event.target.value as ProductTypeFilter)}
                  >
                    {PRODUCT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-[#2a4f84] bg-[#09182f] px-3 py-1">Kết quả gốc: {searchResults.length}</span>
                <span className="rounded-full border border-[#2a4f84] bg-[#09182f] px-3 py-1">Sau lọc: {filteredSearchResults.length}</span>
                <span className="rounded-full border border-[#2a4f84] bg-[#09182f] px-3 py-1">Đã tích: {selectedSearchCodes.length}</span>
                {selectedProductType !== "all" ? <span className="rounded-full border border-[#f7c948]/30 bg-[#2a260f] px-3 py-1 text-[#f7c948]">Đang lọc: {PRODUCT_TYPE_OPTIONS.find((option) => option.value === selectedProductType)?.label}</span> : null}
              </div>

              {filteredSearchResults.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-[#315d95] bg-[#0a1a34] text-slate-100 hover:bg-[#13305b] hover:text-white"
                    onClick={() => toggleSelectAllFiltered(!allSelectableFilteredChecked)}
                    disabled={selectableFilteredResults.length === 0}
                  >
                    {allSelectableFilteredChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="border border-[#f7c948]/40 bg-[#f7c948] text-[#08101f] hover:bg-[#ffd967]"
                    onClick={addSelectedItemsFromCatalog}
                    disabled={selectedSearchCodes.length === 0}
                  >
                    Thêm mã đã chọn ({selectedSearchCodes.length})
                  </Button>
                </div>
              ) : null}

              {searchLoading ? <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Đang tra mã...</p> : null}
              {searchResults.length > 0 ? (
                <div className="rounded-2xl border border-[#1f467c] bg-[#071427]">
                  <div className="max-h-56 overflow-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead className="bg-[#0e2245] text-left text-slate-300">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Tích</th>
                          <th className="px-3 py-2 font-semibold">Mã</th>
                          <th className="px-3 py-2 font-semibold">Tên</th>
                          <th className="px-3 py-2 font-semibold">Nhóm</th>
                          <th className="px-3 py-2 font-semibold">Giá hệ thống</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSearchResults.map((item) => (
                          <tr key={item.normalizedCode} className="border-t border-[#15345f] align-top">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border border-[#3b5f95] bg-[#08162d] accent-[#f7c948]"
                                checked={selectedSearchCodes.includes(item.normalizedCode)}
                                disabled={existingQuoteCodeSet.has(item.normalizedCode)}
                                onChange={(event) => toggleSearchSelection(item.normalizedCode, event.target.checked)}
                              />
                            </td>
                            <td className="px-3 py-2 font-semibold text-white">{item.code}</td>
                            <td className="px-3 py-2 text-slate-200">{item.name}</td>
                            <td className="px-3 py-2 text-slate-400">{item.productGroupLabel || item.productGroup}</td>
                            <td className="px-3 py-2 text-slate-200">{item.internalPrice ? formatCurrencyVnd(item.internalPrice) : "Chưa có"}</td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-[#315d95] bg-[#0a1a34] text-slate-100 hover:bg-[#13305b] hover:text-white"
                                onClick={() => addItemFromCatalog(item)}
                                disabled={existingQuoteCodeSet.has(item.normalizedCode)}
                              >
                                {existingQuoteCodeSet.has(item.normalizedCode) ? "Đã thêm" : "Thêm nhanh"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {filteredSearchResults.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-5 text-center text-sm text-slate-400">Không có kết quả nào khớp bộ lọc hiện tại. Hãy đổi loại sản phẩm hoặc nhập mã khác.</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#1f467c] bg-[#071427]">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-[#0e2245] text-left text-slate-300">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Mã</th>
                      <th className="px-3 py-2 font-semibold">Tên / Nhóm</th>
                      <th className="px-3 py-2 font-semibold">SL</th>
                      <th className="px-3 py-2 font-semibold">Giá hệ thống</th>
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
                        <tr key={`${item.normalizedCode}-${index}`} className="border-t border-[#15345f] align-top">
                          <td className="px-3 py-2 font-semibold text-white">{item.code}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-100">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.productGroupLabel || item.productGroup}</p>
                          </td>
                          <td className="px-3 py-2"><Input className="h-10 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" inputMode="numeric" value={`${item.quantity}`} onChange={(event) => updateItem(index, { quantity: Number(event.target.value.replace(/[^0-9]/g, "")) || 1 })} /></td>
                          <td className="px-3 py-2"><Input className="h-10 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" inputMode="numeric" value={item.internalPrice ? `${item.internalPrice}` : ""} placeholder="Chưa có" onChange={(event) => updateItem(index, { internalPrice: Number(event.target.value.replace(/[^0-9]/g, "")) || null })} /></td>
                          <td className="px-3 py-2"><Input className="h-10 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" inputMode="decimal" value={`${item.lineDiscountPercent}`} onChange={(event) => updateItem(index, { lineDiscountPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 })} /></td>
                          <td className="px-3 py-2 font-medium text-slate-100">{formatCurrencyVnd(calculatedItem?.unitPriceAfterDiscount ?? 0)}</td>
                          <td className="px-3 py-2 font-semibold text-[#f7c948]">{formatCurrencyVnd(calculatedItem?.lineTotal ?? 0)}</td>
                          <td className="px-3 py-2"><Textarea className="min-h-20 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" rows={2} value={item.note} onChange={(event) => updateItem(index, { note: event.target.value })} /></td>
                          <td className="px-3 py-2 text-right"><Button type="button" size="sm" variant="outline" className="border-[#315d95] bg-[#0a1a34] text-slate-100 hover:bg-[#13305b] hover:text-white" onClick={() => removeItem(index)}>Xóa</Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {quote.items.length === 0 ? <p className="px-3 py-4 text-sm text-slate-400">Chưa có sản phẩm nào trong báo giá.</p> : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#1e3b68] bg-[linear-gradient(180deg,rgba(6,18,39,0.98),rgba(10,27,56,0.94))] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-white">Xem nhanh</h2>
              <span className="rounded-full border border-[#2a4f84] bg-[#09182f] px-3 py-1 text-xs text-slate-300">{quote.items.length} mã</span>
            </div>

            <div className="mt-4 space-y-2">
              {quickPreviewItems.length > 0 ? (
                quickPreviewItems.map((item) => (
                  <div key={`${item.normalizedCode}-quick`} className="rounded-xl border border-[#1b3f71] bg-[#08162d] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-100">{item.code}</p>
                      <p className="shrink-0 text-sm font-semibold text-[#f7c948]">{formatCurrencyVnd(item.lineTotal)}</p>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">{item.name}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-[#1b3f71] bg-[#08162d] px-3 py-3 text-sm text-slate-400">Chưa có dữ liệu để xem nhanh.</p>
              )}

              {quote.items.length > quickPreviewItems.length ? (
                <p className="text-xs text-slate-400">+ {quote.items.length - quickPreviewItems.length} mã khác trong báo giá.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1e3b68] bg-[linear-gradient(180deg,rgba(6,18,39,0.98),rgba(10,27,56,0.94))] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <h2 className="font-heading text-lg font-bold text-white">Tổng & điều kiện</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5"><Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Chiết khấu tổng %</Label><Input className="h-11 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" inputMode="decimal" value={`${quote.discountPercent}`} onChange={(event) => setQuote((current) => ({ ...current, discountPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 }))} /></div>
              <div className="space-y-1.5"><Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">VAT %</Label><Input className="h-11 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" inputMode="decimal" value={`${quote.vatPercent}`} onChange={(event) => setQuote((current) => ({ ...current, vatPercent: Number(event.target.value.replace(/[^0-9.]/g, "")) || 0 }))} /></div>
              <div className="space-y-1.5"><Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Phí giao hàng</Label><Input className="h-11 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" inputMode="numeric" value={`${quote.shippingFee}`} onChange={(event) => setQuote((current) => ({ ...current, shippingFee: Number(event.target.value.replace(/[^0-9]/g, "")) || 0 }))} /></div>
              <div className="space-y-1.5"><Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Thời gian giao</Label><Input className="h-11 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.deliveryTime} onChange={(event) => setQuote((current) => ({ ...current, deliveryTime: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Hiệu lực báo giá</Label><Input className="h-11 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.validUntil} onChange={(event) => setQuote((current) => ({ ...current, validUntil: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Điều kiện thanh toán</Label><Input className="h-11 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" value={quote.paymentTerm} onChange={(event) => setQuote((current) => ({ ...current, paymentTerm: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-300">Ghi chú báo giá</Label><Textarea className="min-h-28 border-[#214a86] bg-[#08162d] text-slate-50 placeholder:text-slate-500 focus-visible:border-[#f7c948] focus-visible:bg-[#0d2245] focus-visible:ring-[#f7c948]/20" rows={4} value={quote.note} onChange={(event) => setQuote((current) => ({ ...current, note: event.target.value }))} /></div>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl border border-[#234a81] bg-[#08162d] p-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-400">Tạm tính</span><span className="font-semibold text-slate-100">{formatCurrencyVnd(calculated.totals.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">CK tổng</span><span className="font-semibold text-slate-100">-{formatCurrencyVnd(calculated.totals.totalDiscountAmount)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">VAT</span><span className="font-semibold text-slate-100">+{formatCurrencyVnd(calculated.totals.vatAmount)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Phí giao hàng</span><span className="font-semibold text-slate-100">+{formatCurrencyVnd(quote.shippingFee)}</span></div>
              <div className="flex items-center justify-between border-t border-[#15345f] pt-2 text-base"><span className="font-semibold text-white">Tổng cộng</span><span className="font-bold text-[#f7c948]">{formatCurrencyVnd(calculated.totals.grandTotal)}</span></div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1e3b68] bg-[linear-gradient(180deg,rgba(6,18,39,0.98),rgba(10,27,56,0.94))] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <h2 className="font-heading text-lg font-bold text-white">Trạng thái quote</h2>
            <div className="mt-4 space-y-3">
              <select
                className="h-11 w-full rounded-lg border border-[#214a86] bg-[#08162d] px-3 text-sm text-slate-50 outline-none focus:border-[#f7c948]"
                value={quote.status}
                onChange={(event) => setQuote((current) => ({ ...current, status: normalizeAdminQuoteStatus(event.target.value) }))}
              >
                {ADMIN_QUOTE_STATUSES.map((status) => (
                  <option key={status} value={status}>{getAdminQuoteStatusLabel(status)}</option>
                ))}
              </select>
            </div>
            {feedback ? <p className="mt-4 rounded-xl border border-[#234a81] bg-[#08162d] px-3 py-2 text-sm text-slate-200">{feedback}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
