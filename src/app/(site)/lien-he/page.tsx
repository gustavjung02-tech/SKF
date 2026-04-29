import Image from "next/image";
import { Building2, Clock3, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getCoreBrandLogos } from "@/data/brand-logos";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { ContactForm } from "@/components/forms/contact-form";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";

export const metadata = createPageMetadata({
  title: "Liên hệ THL | Yêu cầu vật tư truyền động",
  description:
    "Liên hệ Công Ty TNHH Tân Hòa Lợi để gửi nhu cầu vật tư truyền động công nghiệp theo danh mục NTN, Tsubaki, Koyo và các nhóm triển khai theo ứng dụng.",
  path: "/lien-he",
});

export default function ContactPage() {
  const [ntnLogo, tsubakiLogo] = getCoreBrandLogos();
  const pageSchema = createWebPageSchema({
    title: "Liên hệ THL | Yêu cầu vật tư truyền động",
    description:
      "Liên hệ Công Ty TNHH Tân Hòa Lợi để gửi nhu cầu vật tư truyền động công nghiệp theo danh mục NTN, Tsubaki, Koyo và các nhóm triển khai theo ứng dụng.",
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
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.8)]">
            <div className="relative h-[280px] w-full sm:h-[320px] lg:h-[360px]">
              <Image
                src="/images/card-giai-phap-bo-phan-ky-thuat.png"
                alt="Đội kỹ thuật THL hỗ trợ đối chiếu vật tư truyền động công nghiệp"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/15" />
              <div className="absolute inset-0 flex items-end p-5 sm:p-7 lg:p-8">
                <div className="max-w-2xl space-y-3">
                  <p className="jp-eyebrow border-blue-200/40 bg-blue-500/20 text-blue-50">Liên hệ THL</p>
                  <h1 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">
                    Gửi nhu cầu vật tư truyền động cho THL
                  </h1>
                  <p className="text-sm leading-7 text-slate-200 sm:text-base">
                    THL tiếp nhận mã hàng, ảnh tem, thông tin cụm máy hoặc yêu cầu đặt hàng để đối
                    chiếu đúng danh mục NTN, Tsubaki, Koyo và các nhóm triển khai theo ứng dụng.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <SectionTitle
            eyebrow="Thông tin liên hệ"
            title="Kênh hỗ trợ nhanh cho nhà máy và đội mua hàng B2B"
            description="Chọn kênh phù hợp bên dưới để gửi nhu cầu, THL sẽ phản hồi trong giờ làm việc hoặc theo mức độ ưu tiên của yêu cầu."
          />

          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)] sm:p-6">
              <div className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                {ntnLogo ? <Image src={ntnLogo.src} alt={ntnLogo.alt} width={116} height={40} className="h-8 w-auto object-contain" /> : null}
                <span className="h-8 w-px bg-slate-200" aria-hidden />
                {tsubakiLogo ? <Image src={tsubakiLogo.src} alt={tsubakiLogo.alt} width={132} height={40} className="h-7 w-auto object-contain" /> : null}
              </div>

              <div>
                <p className="font-semibold text-slate-950">Công Ty TNHH Tân Hòa Lợi</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Nhà phân phối chính thức NTN, Tsubaki, Koyo cho vật tư truyền động công nghiệp.
                </p>
              </div>

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Building2 className="mt-0.5 size-4 text-blue-800" />
                  <span>{siteConfig.personalName}</span>
                </li>
                <li className="flex items-start gap-2">
                  <PhoneCall className="mt-0.5 size-4 text-blue-800" />
                  <a href={siteConfig.phoneHref} className="hover:text-blue-800">
                    {siteConfig.phone}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 size-4 text-blue-800" />
                  <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer" className="hover:text-blue-800">
                    {siteConfig.zaloLabel}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 text-blue-800" />
                  <span>{siteConfig.supportArea}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 size-4 text-blue-800" />
                  <span>{siteConfig.responseTime}</span>
                </li>
              </ul>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="bg-blue-800 hover:bg-blue-900">
                  <a href={siteConfig.phoneHref}>
                    <PhoneCall className="mr-2 size-4" />
                    Liên hệ B2B
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-100">
                  <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 size-4" />
                    Zalo kinh doanh
                  </a>
                </Button>
              </div>
            </section>

            <section>
              <ContactForm />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
