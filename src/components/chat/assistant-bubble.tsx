"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";

type NtnSearchProduct = {
  code: string;
  name: string;
  application: string;
  application_detail: string;
  size_text: string;
  d_mm: number;
  D_mm: number;
  B_T_mm: number;
  group: string;
  search_text: string;
};

type NtnSearchPayload = {
  meta?: {
    dataset?: string;
    total?: number;
    generated_at?: string;
  };
  products?: NtnSearchProduct[];
};

type LoadState = "idle" | "loading" | "ready" | "error";

type FilterValues = {
  code: string;
  innerDiameter: string;
  outerDiameter: string;
  thickness: string;
};

const defaultFilters: FilterValues = {
  code: "",
  innerDiameter: "",
  outerDiameter: "",
  thickness: "",
};

const MAX_VISIBLE = 25;

function parseNumericFilter(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function getCodeMatchScore(product: NtnSearchProduct, query: string): number {
  if (!query) {
    return 0;
  }

  const exactCode = normalizeCode(product.code);
  const queryCode = normalizeCode(query);

  if (!queryCode) {
    return 5;
  }

  if (queryCode && exactCode === queryCode) {
    return 0;
  }

  if (queryCode && exactCode.startsWith(queryCode)) {
    return 1;
  }

  if (queryCode.length >= 3 && exactCode.includes(queryCode)) {
    return 2;
  }

  return 5;
}

function buildApplicationLabel(product: NtnSearchProduct): string {
  const application = product.application.trim();
  const detail = product.application_detail.trim();

  if (!detail || detail === application) {
    return application;
  }

  return `${application} - ${detail}`;
}

function hasAnyFilter(filters: FilterValues): boolean {
  return Object.values(filters).some((value) => value.trim().length > 0);
}

export function AssistantBubble() {
  const [open, setOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [products, setProducts] = useState<NtnSearchProduct[]>([]);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) {
        return;
      }

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoadState("loading");

      try {
        const response = await fetch("/ntn-product-search.json");
        if (!response.ok) {
          throw new Error("Cannot load NTN product search data.");
        }
        const payload = (await response.json()) as NtnSearchPayload;

        if (cancelled) return;

        const nextProducts = Array.isArray(payload.products) ? payload.products : [];
        setProducts(nextProducts);
        setLoadState("ready");
      } catch {
        if (cancelled) return;
        setLoadState("error");
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const codeQuery = filters.code.trim();
  const innerDiameter = parseNumericFilter(filters.innerDiameter);
  const outerDiameter = parseNumericFilter(filters.outerDiameter);
  const thickness = parseNumericFilter(filters.thickness);
  const hasFilters = hasAnyFilter(filters);

  const matchedProducts = hasFilters
    ? products
        .filter((product) => {
          if (codeQuery.length > 0 && getCodeMatchScore(product, codeQuery) >= 5) {
            return false;
          }
          if (innerDiameter !== null && product.d_mm !== innerDiameter) {
            return false;
          }
          if (outerDiameter !== null && product.D_mm !== outerDiameter) {
            return false;
          }
          if (thickness !== null && product.B_T_mm !== thickness) {
            return false;
          }
          return true;
        })
        .sort((left, right) => {
          const scoreDifference =
            getCodeMatchScore(left, codeQuery) - getCodeMatchScore(right, codeQuery);
          if (scoreDifference !== 0) return scoreDifference;
          if (left.d_mm !== right.d_mm) return left.d_mm - right.d_mm;
          if (left.D_mm !== right.D_mm) return left.D_mm - right.D_mm;
          if (left.B_T_mm !== right.B_T_mm) return left.B_T_mm - right.B_T_mm;
          return left.code.localeCompare(right.code);
        })
    : [];

  const visibleProducts = matchedProducts.slice(0, MAX_VISIBLE);

  function updateFilter<K extends keyof FilterValues>(key: K, value: FilterValues[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-[calc(6.2rem+env(safe-area-inset-bottom))] right-4 z-50 lg:bottom-6 lg:right-5"
    >
      {open ? (
        <div className="mb-3 w-[min(92vw,430px)] overflow-hidden rounded-xl border border-[#008fd3]/30 bg-white shadow-[0_24px_52px_-28px_rgba(15,23,42,0.45)]">
          <div className="flex items-start justify-between gap-3 border-b border-[#008fd3]/20 bg-gradient-to-r from-[#e7f7ff] to-white px-3 py-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#00699f]">Tra mã sản phẩm NTN</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Gõ mã hoặc kích thước – kết quả cập nhật ngay.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Đóng bảng tra mã"
              title="Đóng"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-2.5 p-3">
            <div className="grid gap-1.5 sm:grid-cols-2">
              <label className="col-span-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">Đầu mã / Mã sản phẩm NTN</span>
                <div className="flex items-center gap-1.5">
                  <Search className="size-3.5 shrink-0 text-slate-500" />
                  <input
                    id="quick-lookup-keyword"
                    type="text"
                    autoComplete="off"
                    value={filters.code}
                    onChange={(event) => updateFilter("code", event.target.value)}
                    placeholder="VD: 6205, 7210, 22310..."
                    className="w-full bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  {filters.code ? (
                    <button
                      type="button"
                      onClick={() => updateFilter("code", "")}
                      className="shrink-0 text-slate-400 hover:text-slate-600"
                      aria-label="Xóa mã"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </label>

              <label className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">Vòng trong d (mm)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={filters.innerDiameter}
                  onChange={(event) => updateFilter("innerDiameter", event.target.value)}
                  placeholder="25"
                  className="w-full bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">Vòng ngoài D (mm)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={filters.outerDiameter}
                  onChange={(event) => updateFilter("outerDiameter", event.target.value)}
                  placeholder="52"
                  className="w-full bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">Độ dày B/T (mm)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={filters.thickness}
                  onChange={(event) => updateFilter("thickness", event.target.value)}
                  placeholder="15"
                  className="w-full bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-2">
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-[#00699f] transition hover:text-[#00527d]"
                >
                  Xoá bộ lọc
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Gõ mã hoặc chọn kích thước</span>
              )}

              {hasFilters && loadState === "ready" ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {matchedProducts.length} kết quả
                </span>
              ) : null}
            </div>

            {loadState === "loading" ? (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <LoaderCircle className="size-3.5 animate-spin" />
                Đang tải dữ liệu NTN...
              </div>
            ) : null}

            {loadState === "error" ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] text-red-700">
                Không tải được dữ liệu NTN. Vui lòng thử lại.
              </div>
            ) : null}

            {loadState === "ready" && hasFilters && visibleProducts.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-600">
                Chưa tìm thấy mã phù hợp. Thử đổi mã SP hoặc giảm bớt điều kiện kích thước.
              </div>
            ) : null}

            {loadState === "ready" && hasFilters && visibleProducts.length > 0 ? (
              <div className="space-y-2">
                {matchedProducts.length > visibleProducts.length ? (
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Hiển thị {visibleProducts.length}/{matchedProducts.length} kết quả gần nhất. Thêm mã SP hoặc kích thước để thu hẹp.
                  </p>
                ) : null}

                <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
                  {visibleProducts.map((product) => (
                    <div
                      key={`${product.code}-${product.d_mm}-${product.D_mm}-${product.B_T_mm}`}
                      className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.35)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Mã SP</p>
                          <p className="truncate text-sm font-semibold text-slate-900">{product.code}</p>
                        </div>
                        <span className="rounded-full border border-[#008fd3]/20 bg-[#e7f7ff] px-2 py-1 text-[10px] font-medium text-[#00699f]">
                          d {product.d_mm} | D {product.D_mm} | B/T {product.B_T_mm}
                        </span>
                      </div>

                      <div className="mt-1.5 space-y-1 text-[13px] text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-900">Ứng dụng máy:</span> {buildApplicationLabel(product)}
                        </p>
                        <p className="text-xs text-slate-500">Kích thước gốc: {product.size_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#008fd3]/35 bg-[#008fd3] text-white shadow-[0_14px_34px_-20px_rgba(0,143,211,0.85)] transition hover:-translate-y-0.5 hover:bg-[#007db8] sm:w-auto sm:gap-1.5 sm:px-3"
        aria-label={open ? "Đóng popup tra mã" : "Mở popup tra mã"}
        title="Tra mã sản phẩm"
      >
        <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">Tìm sản phẩm</span>
        {open ? <X className="size-4" /> : <Search className="size-4" />}
      </button>
    </div>
  );
}
