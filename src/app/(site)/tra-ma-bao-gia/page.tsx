import { MessageCircle, PhoneCall } from "lucide-react";
import { siteConfig } from "@/config/site";
import { quoteGuideBullets } from "@/data/site-content";
import { createPageMetadata } from "@/lib/seo";
import { LeadForm } from "@/components/forms/lead-form";
import { StructuredData } from "@/components/shared/structured-data";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";

export const metadata = createPageMetadata({
  title: "Gửi yêu cầu kỹ thuật / báo giá",
  description:
    "Gửi mã hàng, ảnh tem, kích thước hoặc mô tả cụm máy để THL đối chiếu đúng danh mục NTN, Tsubaki, Koyo và nhóm triển khai theo ứng dụng.",
  path: "/tra-ma-bao-gia",
});

export default function QuotePage() {
  const pageSchema = createWebPageSchema({
    title: "Gửi yêu cầu kỹ thuật / báo giá",
    description:
      "Gửi mã hàng, ảnh tem, kích thước hoặc mô tả cụm máy để THL đối chiếu đúng danh mục NTN, Tsubaki, Koyo và nhóm triển khai theo ứng dụng.",
    path: "/tra-ma-bao-gia",
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Yêu cầu kỹ thuật", path: "/tra-ma-bao-gia" },
  ]);

  return (
    <>
      <StructuredData data={[pageSchema, breadcrumbSchema]} />
      <div className="section-block">
        <div className="page-shell space-y-8">
        <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.45)] sm:p-8">
          <SectionTitle
            eyebrow="Yêu cầu kỹ thuật / báo giá"
            title="Gửi thông tin để THL đối chiếu đúng nhóm vật tư"
            description="Mã hàng, ảnh tem, kích thước, vị trí lắp và điều kiện vận hành giúp khoanh đúng NTN, Tsubaki, Koyo hoặc nhóm triển khai theo ứng dụng trước khi chuyển báo giá."
          />

          <ul className="grid gap-2 text-sm leading-relaxed text-slate-700 sm:grid-cols-2">
            {quoteGuideBullets.map((tip) => (
              <li key={tip} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                {tip}
              </li>
            ))}
          </ul>

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

        <section>
          <LeadForm />
        </section>
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
