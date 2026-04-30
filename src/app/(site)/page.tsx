import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, PhoneCall, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { industryApplications } from "@/data/industry-applications";
import { getProductVisual } from "@/data/product-visuals";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createOrganizationSchema, createWebPageSchema, createWebSiteSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { SitePageHero } from "@/components/shared/site-page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "SKF Công Nghiệp - Tra mã, tư vấn và báo giá sản phẩm SKF",
  description:
    "Tra mã sản phẩm SKF theo mã, nhóm sản phẩm và thông số d/D/B. Hỗ trợ tư vấn vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động cho nhà máy công nghiệp.",
  path: "/",
});

const homepageTitle = "SKF Công Nghiệp cho nhà máy hiện đại";
const homepageDescription =
  "Tra mã, chọn nhóm sản phẩm và gửi yêu cầu báo giá nhanh cho vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động.";

const appBySlug = new Map(industryApplications.map((app) => [app.slug, app]));
const pumpFanApplication = appBySlug.get("bom-quat-dong-co") ?? industryApplications[0];
const conveyorApplication = appBySlug.get("bang-tai-truyen-dong") ?? industryApplications[0];
const cncApplication = appBySlug.get("cnc") ?? industryApplications[0];
const plasticApplication = appBySlug.get("ep-nhua") ?? industryApplications[0];
const woodApplication = appBySlug.get("may-go") ?? industryApplications[0];

const productCategories = [
  {
    title: "Vòng bi SKF",
    summary: "Tra theo mã và điều kiện tải cho cụm quay chính.",
    image: getProductVisual("vong-bi-skf").image,
    alt: "Vòng bi SKF cho dây chuyền công nghiệp",
  },
  {
    title: "Gối đỡ SKF",
    summary: "Khoanh nhanh nhóm gối đỡ theo cụm trục và vị trí lắp.",
    image: getProductVisual("goi-do-skf").image,
    alt: "Gối đỡ SKF cho trục truyền động",
  },
  {
    title: "Phớt SKF",
    summary: "Đối chiếu phớt theo môi trường dầu, bụi và nhiệt.",
    image: getProductVisual("phot-skf").image,
    alt: "Phớt SKF cho cụm làm kín công nghiệp",
  },
  {
    title: "Mỡ & hệ thống bôi trơn SKF/Lincoln",
    summary: "Mỡ và hệ thống bôi trơn cho vận hành ổn định.",
    image: getProductVisual("boi-tron-skf-lincoln").image,
    alt: "Mỡ và hệ thống bôi trơn SKF Lincoln",
  },
  {
    title: "Dụng cụ bảo trì SKF",
    summary: "Thiết bị hỗ trợ tháo lắp, kiểm tra và bảo trì định kỳ.",
    image: getProductVisual("dung-cu-bao-tri-skf").image,
    alt: "Dụng cụ bảo trì SKF trong nhà máy",
  },
  {
    title: "Truyền động SKF",
    summary: "Nhóm truyền động cho băng tải, cụm quay và dây chuyền.",
    image: getProductVisual("truyen-dong-skf").image,
    alt: "Nhóm truyền động SKF cho dây chuyền sản xuất",
  },
] as const;

const applicationCards = [
  {
    title: "Motor",
    href: "/ung-dung/bom-quat-dong-co",
    image: pumpFanApplication.image,
    alt: "Ứng dụng SKF cho motor công nghiệp",
    tags: ["Vòng bi", "Bôi trơn"],
  },
  {
    title: "Bơm / Quạt",
    href: "/ung-dung/bom-quat-dong-co",
    image: pumpFanApplication.image,
    alt: "Ứng dụng SKF cho bơm và quạt công nghiệp",
    tags: ["Phớt", "Gối đỡ"],
  },
  {
    title: "Băng tải",
    href: "/ung-dung/bang-tai-truyen-dong",
    image: conveyorApplication.image,
    alt: "Ứng dụng SKF cho hệ băng tải",
    tags: ["Truyền động", "Gối đỡ"],
  },
  {
    title: "CNC",
    href: "/ung-dung/cnc",
    image: cncApplication.image,
    alt: "Ứng dụng SKF cho máy CNC",
    tags: ["Vòng bi", "Bảo trì"],
  },
  {
    title: "Ép nhựa",
    href: "/ung-dung/ep-nhua",
    image: plasticApplication.image,
    alt: "Ứng dụng SKF cho máy ép nhựa",
    tags: ["Phớt", "Bôi trơn"],
  },
  {
    title: "Máy gỗ",
    href: "/ung-dung/may-go",
    image: woodApplication.image,
    alt: "Ứng dụng SKF cho máy gỗ công nghiệp",
    tags: ["Vòng bi", "Truyền động"],
  },
] as const;

export default function Home() {
  const pageSchema = createWebPageSchema({
    title: homepageTitle,
    description: homepageDescription,
    path: "/",
  });

  const breadcrumbSchema = createBreadcrumbSchema([{ name: "Trang chủ", path: "/" }]);

  return (
    <>
      <StructuredData data={[createOrganizationSchema(), createWebSiteSchema(), pageSchema, breadcrumbSchema]} />

      <div className="overflow-x-hidden bg-slate-50">
        <section className="section-block pb-6">
          <div className="page-shell">
            <SitePageHero
              badge="SKF CHO NHÀ MÁY CÔNG NGHIỆP"
              title="SKF Công Nghiệp cho nhà máy hiện đại"
              highlightText="SKF Công Nghiệp"
              description="Tra mã, chọn nhóm sản phẩm và gửi yêu cầu báo giá nhanh cho vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động."
              primaryCta={{
                label: "Tra mã SKF",
                href: "/tra-ma-bao-gia",
                icon: <Search className="mr-2 size-4" />,
                tone: "blue",
              }}
              secondaryCta={{
                label: "Gửi Zalo",
                href: siteConfig.zaloLink,
                external: true,
                icon: <MessageCircle className="mr-2 size-4" />,
                tone: "red",
              }}
              imageSrc="/images/heroes/home/hero-home-skf-main.png"
              imageAlt="Giải pháp SKF công nghiệp cho nhà máy hiện đại"
              imagePriority
            />
          </div>
        </section>

        <section id="danh-muc" className="section-block bg-white">
          <div className="page-shell space-y-8">
            <SectionTitle
              eyebrow="Danh mục SKF"
              title="SKF cho nhà máy công nghiệp: vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động"
              description="Nhấn Tra mã, Xem nhóm hoặc Gửi Zalo tùy cách làm việc của đội kỹ thuật và mua hàng."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {productCategories.map((category) => (
                <Card
                  key={category.title}
                  className="h-full overflow-hidden rounded-3xl border border-[#DDE7F3] bg-white py-0 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.28)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                  </div>
                  <CardContent className="space-y-3 p-5">
                    <div className="space-y-1.5">
                      <h3 className="font-heading text-xl font-bold text-slate-950">{category.title}</h3>
                      <p className="text-sm leading-6 text-slate-600">{category.summary}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Button asChild className="h-9 bg-[#0050A4] text-white hover:bg-[#003d7d]">
                        <Link href="/tra-ma-bao-gia">Tra mã</Link>
                      </Button>
                      <Button asChild variant="outline" className="h-9 border-[#DDE7F3] text-slate-900 hover:bg-[#EEF4FB]">
                        <Link href="/san-pham">Xem nhóm</Link>
                      </Button>
                      <Button asChild className="h-9 bg-[#E30613] text-white hover:bg-[#c80511]">
                        <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                          Gửi Zalo
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block bg-slate-50">
          <div className="page-shell space-y-8">
            <SectionTitle
              eyebrow="Ứng dụng ngành"
              title="Khoanh nhanh theo loại máy"
              description="Đi từ bối cảnh máy vận hành sang nhóm vật tư phù hợp, sau đó tra mã chi tiết trên trang SKF."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {applicationCards.map((application) => (
                <Link key={application.title} href={application.href} className="group">
                  <Card className="h-full overflow-hidden rounded-3xl border border-[#DDE7F3] bg-white py-0 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.22)] transition hover:-translate-y-1 hover:shadow-[0_24px_52px_-30px_rgba(15,23,42,0.32)]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={application.image}
                        alt={application.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/84 via-slate-950/18 to-transparent" />
                      <h3 className="absolute inset-x-4 bottom-4 font-heading text-2xl font-bold text-white">{application.title}</h3>
                    </div>
                    <CardContent className="flex items-center justify-between gap-3 p-5">
                      <div className="flex flex-wrap gap-2">
                        {application.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#EEF4FB] px-3 py-1 text-xs font-medium text-[#0F172A]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#0050A4]" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="page-shell">
            <div className="grid gap-5 rounded-[1.75rem] border border-[#DDE7F3] bg-white p-6 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.24)] sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050A4]">Liên hệ nhanh</p>
                <h2 className="font-heading text-3xl font-bold text-slate-950">Ưu tiên kênh Zalo cho xử lý báo giá nhanh</h2>
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp. Nếu cần xử lý nhanh,
                  gửi mã qua Zalo để đội kỹ thuật phản hồi sớm.
                </p>
              </div>
              <div className="grid gap-3">
                <Button asChild className="h-11 bg-[#E30613] text-white hover:bg-[#c80511]">
                  <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 size-4" />
                    Zalo: 0969 155 751
                  </a>
                </Button>
                <Button asChild className="h-11 bg-[#0050A4] text-white hover:bg-[#003d7d]">
                  <a href={siteConfig.phoneHref}>
                    <PhoneCall className="mr-2 size-4" />
                    Gọi: 0969 155 751
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-11 border-[#DDE7F3] text-slate-900 hover:bg-[#EEF4FB]">
                  <Link href="/lien-he">
                    <PhoneCall className="mr-2 size-4" />
                    Liên hệ
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
