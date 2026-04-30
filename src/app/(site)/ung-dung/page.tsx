import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, MessageCircle } from "lucide-react";
import { industryApplications } from "@/data/industry-applications";
import { createPageMetadata } from "@/lib/seo";
import { SitePageHero } from "@/components/shared/site-page-hero";
import { Card, CardContent } from "@/components/ui/card";

function sanitizeBrandText(value: string) {
  return value;
}

export const metadata = createPageMetadata({
  title: "Ứng dụng ngành cho sản phẩm SKF",
  description: "Khoanh nhóm sản phẩm SKF theo loại máy và điều kiện vận hành.",
  path: "/ung-dung",
});

export default function IndustryApplicationsPage() {
  return (
    <div className="bg-white">
      <section className="section-block pb-6">
        <div className="page-shell">
          <SitePageHero
            badge="ỨNG DỤNG THEO NGÀNH"
            title="Giải pháp SKF theo từng môi trường vận hành"
            highlightText="môi trường vận hành"
            description="Gợi ý nhóm sản phẩm phù hợp cho ngành gỗ, thực phẩm, bao bì, xi măng, cơ khí và nhiều lĩnh vực sản xuất khác."
            primaryCta={{
              label: "Xem ứng dụng ngành",
              href: "#danh-sach-ung-dung",
              icon: <ClipboardCheck className="mr-2 size-4" />,
              tone: "blue",
            }}
            secondaryCta={{
              label: "Nhờ tư vấn",
              href: "/lien-he",
              icon: <MessageCircle className="mr-2 size-4" />,
              tone: "outline",
            }}
            imageSrc="/images/industry/hero-ung-dung-nganh-skf.png"
            imageAlt="Giải pháp SKF theo từng môi trường vận hành"
            imagePriority
          />
        </div>
      </section>

      <section id="danh-sach-ung-dung" className="section-block bg-slate-50">
        <div className="page-shell grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industryApplications.map((app) => (
            <Link key={app.slug} href={`/ung-dung/${app.slug}`} className="group">
              <Card className="h-full rounded-lg border-[#DDE7F3] bg-white py-0 transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.55)]">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={app.image}
                    alt={app.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/24 to-transparent" />
                  <h2 className="absolute bottom-4 left-4 right-4 font-heading text-lg font-bold text-white">{app.name}</h2>
                </div>
                <CardContent className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-slate-600">{sanitizeBrandText(app.description)}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm vật tư thường dùng</p>
                    <div className="flex flex-wrap gap-2">
                      {app.commonParts.map((part) => (
                        <span key={part} className="inline-flex items-center gap-1 rounded-md bg-[#EEF4FB] px-2.5 py-1 text-xs text-[#0050A4]">
                          <CheckCircle2 className="size-3" />
                          {sanitizeBrandText(part)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="inline-flex items-center text-sm font-semibold text-[#0050A4] group-hover:text-[#003d7d]">
                    Xem chi tiết ứng dụng
                    <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
