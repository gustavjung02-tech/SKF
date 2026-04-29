import { Suspense } from "react";
import { MessageCircle, PhoneCall } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/shared/structured-data";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { SkfSearchQuoteExperience } from "@/components/skf/skf-search-quote-experience";

export const metadata = createPageMetadata({
  title: "Tra mã SKF / yêu cầu báo giá",
  description: "Tra mã SKF bằng dữ liệu local trong public/data, lọc theo nhóm và gửi yêu cầu báo giá ngay trên cùng một trang.",
  path: "/tra-ma-bao-gia",
});

export default function QuotePage() {
  const pageSchema = createWebPageSchema({
    title: "Tra mã SKF / yêu cầu báo giá",
    description: "Tra mã SKF bằng dữ liệu local trong public/data, lọc theo nhóm và gửi yêu cầu báo giá ngay trên cùng một trang.",
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
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.28)] sm:p-8">
            <SectionTitle
              eyebrow="Tra mã SKF / báo giá"
              title="Tra mã, lọc nhóm sản phẩm và gửi yêu cầu báo giá trên cùng một luồng"
              description="Trang này chỉ dùng dữ liệu local trong public/data để search theo code, normalizedCode, tên, nhóm sản phẩm, phân nhóm và ứng dụng."
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-100">
                <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 size-4" />
                  Zalo kinh doanh
                </a>
              </Button>
              <Button asChild variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-50">
                <a href={siteConfig.phoneHref}>
                  <PhoneCall className="mr-2 size-4" />
                  Liên hệ B2B
                </a>
              </Button>
            </div>
          </section>

          <Suspense
            fallback={
              <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.28)] sm:p-8">
                Đang tải tra mã SKF...
              </section>
            }
          >
            <SkfSearchQuoteExperience />
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
