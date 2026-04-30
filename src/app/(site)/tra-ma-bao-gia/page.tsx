import { Suspense } from "react";
import { MessageCircle, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/shared/structured-data";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { SitePageHero } from "@/components/shared/site-page-hero";
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

      <div className="section-block bg-slate-50">
        <div className="page-shell space-y-8">
          <SitePageHero
            badge="TRA MÃ SKF / BÁO GIÁ"
            title="Tra mã SKF nhanh và gửi yêu cầu báo giá"
            highlightText="Tra mã SKF"
            description="Tìm theo mã, nhóm sản phẩm hoặc thông số d / D / B-T. Chọn nhiều mã và gửi yêu cầu qua Zalo."
            primaryCta={{
              label: "Mở trang tra mã",
              href: "#tra-ma-skf",
              icon: <Search className="mr-2 size-4" />,
              tone: "blue",
            }}
            secondaryCta={{
              label: "Zalo kinh doanh",
              href: siteConfig.zaloLink,
              external: true,
              icon: <MessageCircle className="mr-2 size-4" />,
              tone: "red",
            }}
            imageSrc="/images/tra-ma/hero-tra-ma-skf.png"
            imageAlt="Tra mã SKF nhanh và gửi yêu cầu báo giá"
            imagePriority
          />

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

        <a
          href={siteConfig.zaloLink}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-24 right-4 z-30 hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-900 md:flex lg:bottom-6"
        >
          <MessageCircle className="size-4" />
          Zalo kinh doanh
        </a>
      </div>
    </>
  );
}
