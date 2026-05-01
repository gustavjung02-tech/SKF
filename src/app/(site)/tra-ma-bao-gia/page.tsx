import { Suspense } from "react";
import { MessageCircle, Search } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/shared/structured-data";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { SkfSearchQuoteExperience } from "@/components/skf/skf-search-quote-experience";

export const metadata = createPageMetadata({
  title: "Tra mã SKF và yêu cầu báo giá",
  description:
    "Tra mã sản phẩm SKF theo mã, nhóm sản phẩm và thông số d/D/B. Hỗ trợ tư vấn vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động cho nhà máy công nghiệp.",
  path: "/tra-ma-bao-gia",
});

export default function QuotePage() {
  const pageSchema = createWebPageSchema({
    title: "Tra mã SKF nhanh và gửi yêu cầu báo giá",
    description: "Tìm theo mã, nhóm sản phẩm hoặc thông số d / D / B-T. Chọn nhiều mã và gửi yêu cầu qua Zalo.",
    path: "/tra-ma-bao-gia",
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Tra mã SKF", path: "/tra-ma-bao-gia" },
  ]);

  return (
    <>
      <StructuredData data={[pageSchema, breadcrumbSchema]} />

      <div className="section-block bg-[#F3F7FC] py-4 sm:py-6">
        <div className="page-shell space-y-4 sm:space-y-5">
          <section className="rounded-2xl border border-[#C9DBF4] bg-gradient-to-r from-[#0050A4] via-[#0B5DB3] to-[#0050A4] px-4 py-4 text-white shadow-[0_16px_36px_-28px_rgba(0,80,164,0.75)] sm:px-5 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                  SKF TOOL
                </p>
                <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">Tra Mã &amp; Báo Giá</h1>
                <p className="mt-1 text-sm text-blue-100">Tra mã SKF theo mã hoặc kích thước</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="#tra-ma-skf"
                  className="inline-flex h-10 items-center rounded-lg border border-white/30 bg-white/10 px-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <Search className="mr-2 size-4" />
                  Tra mã ngay
                </a>
                <a
                  href="#gui-yeu-cau-zalo"
                  className="inline-flex h-10 items-center rounded-lg bg-[#E30613] px-3.5 text-sm font-semibold text-white transition hover:bg-[#c80511]"
                >
                  <MessageCircle className="mr-2 size-4" />
                  Gửi báo giá
                </a>
              </div>
            </div>
          </section>

          <Suspense
            fallback={
              <section className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.28)] sm:p-8">
                Đang tải tra mã SKF...
              </section>
            }
          >
            <div id="tra-ma-skf">
              <SkfSearchQuoteExperience />
            </div>
          </Suspense>
        </div>
      </div>
    </>
  );
}
