import { Building2, Clock3, Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { ContactForm } from "@/components/forms/contact-form";
import { SitePageHero } from "@/components/shared/site-page-hero";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";

export const metadata = createPageMetadata({
  title: "Liên hệ SKF Công Nghiệp",
  description: "Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp.",
  path: "/lien-he",
});

export default function ContactPage() {
  const pageSchema = createWebPageSchema({
    title: "Liên hệ SKF Công Nghiệp",
    description: "Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp.",
    path: "/lien-he",
    type: "ContactPage",
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Liên hệ", path: "/lien-he" },
  ]);

  return (
    <>
      <StructuredData data={[pageSchema, breadcrumbSchema]} />
      <div className="section-block">
        <div className="page-shell space-y-8">
          <SitePageHero
            badge="LIÊN HỆ / TƯ VẤN"
            title="Kết nối nhanh để được tư vấn đúng nhu cầu"
            highlightText="tư vấn đúng nhu cầu"
            description="Liên hệ để được hỗ trợ tra mã, chọn sản phẩm SKF và tiếp nhận yêu cầu báo giá cho nhà máy, xưởng và bộ phận kỹ thuật."
            primaryCta={{
              label: "Liên hệ ngay",
              href: "#form-lien-he",
              icon: <PhoneCall className="mr-2 size-4" />,
              tone: "blue",
            }}
            secondaryCta={{
              label: "Zalo kinh doanh",
              href: siteConfig.zaloLink,
              external: true,
              icon: <MessageCircle className="mr-2 size-4" />,
              tone: "red",
            }}
            imageSrc="/images/lien-he/hero-lien-he-skf.png"
            imageAlt="Kết nối nhanh để được tư vấn đúng nhu cầu"
            imagePriority
          />

          <SectionTitle
            eyebrow="Thông tin liên hệ"
            title="Kênh hỗ trợ nhanh cho nhà máy và đội mua hàng B2B"
            description="Chọn kênh phù hợp bên dưới để gửi nhu cầu. Đội tư vấn phản hồi trong giờ làm việc hoặc theo mức độ ưu tiên của yêu cầu."
          />

          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <section className="space-y-5 rounded-lg border border-[#DDE7F3] bg-white p-5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)] sm:p-6">
              <div>
                <p className="font-semibold text-slate-950">{siteConfig.brandName}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp.
                </p>
              </div>

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Building2 className="mt-0.5 size-4 text-[#0050A4]" />
                  <span>{siteConfig.personalName}</span>
                </li>
                <li className="flex items-start gap-2">
                  <PhoneCall className="mt-0.5 size-4 text-[#0050A4]" />
                  <a href={siteConfig.phoneHref} className="hover:text-[#0050A4]">
                    {siteConfig.phone}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-4 text-[#0050A4]" />
                  <a href={siteConfig.emailHref} className="hover:text-[#0050A4]">
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 size-4 text-[#0050A4]" />
                  <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer" className="hover:text-[#0050A4]">
                    {siteConfig.zaloLabel}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 text-[#0050A4]" />
                  <span>{siteConfig.supportArea}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 size-4 text-[#0050A4]" />
                  <span>{siteConfig.responseTime}</span>
                </li>
              </ul>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="bg-[#0050A4] hover:bg-[#003d7d]">
                  <a href={siteConfig.phoneHref}>
                    <PhoneCall className="mr-2 size-4" />
                    Liên hệ
                  </a>
                </Button>
                <Button asChild className="bg-[#E30613] text-white hover:bg-[#c80511]">
                  <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 size-4" />
                    Gửi Zalo
                  </a>
                </Button>
              </div>
            </section>

            <section id="form-lien-he">
              <ContactForm />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
