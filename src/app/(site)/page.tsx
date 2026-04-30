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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata = createPageMetadata({
  title: "SKF Công Nghiệp",
  description: "Website tra mã và tiếp nhận yêu cầu báo giá sản phẩm SKF cho khách hàng công nghiệp.",
  path: "/",
});

const homepageTitle = "SKF Công Nghiệp";
const homepageDescription = "Website tra mã và tiếp nhận yêu cầu báo giá sản phẩm SKF cho khách hàng công nghiệp.";

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

const searchExamples = ["22212", "6225", "6379", "IR 90X100X26", "UCP208", "60X90X10"] as const;

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
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
          <Image
            src="/images/giai-phap-khach-hang-hero.png"
            alt="Tra mã và tư vấn sản phẩm SKF cho nhà máy công nghiệp"
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/74" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,80,164,0.25),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(15,23,42,0.72))]" />

          <div className="page-shell relative grid gap-8 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
            <div className="max-w-3xl space-y-6">
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100 backdrop-blur">
                SKF cho nhà máy công nghiệp
              </p>
              <div className="space-y-4">
                <h1 className="font-heading text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-[3.3rem]">
                  SKF Công Nghiệp
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp. Cung cấp và tư vấn sản phẩm SKF theo mã,
                  ứng dụng và điều kiện vận hành.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild className="h-11 bg-[#0050A4] px-5 text-white hover:bg-[#003d7d]">
                  <Link href="/tra-ma-bao-gia">
                    <Search className="mr-2 size-4" />
                    Tra mã SKF
                  </Link>
                </Button>
                <Button asChild className="h-11 bg-[#E30613] px-5 text-white hover:bg-[#c80511]">
                  <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 size-4" />
                    Gửi Zalo
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-11 border-white/30 bg-white/10 px-5 text-white hover:bg-white hover:text-slate-950">
                  <Link href="/lien-he">
                    <PhoneCall className="mr-2 size-4" />
                    Liên hệ
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/12 bg-white/10 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.95)] backdrop-blur-md sm:p-6">
              <div className="rounded-[1.5rem] border border-white/12 bg-slate-950/70 p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Tra mã SKF</p>
                  <h2 className="font-heading text-2xl font-bold text-white">Nhập mã để chuyển nhanh sang trang tra mã chi tiết</h2>
                  <p className="text-sm leading-6 text-slate-300">Giữ thao tác ngắn gọn: nhập mã, mở trang tra mã, xử lý yêu cầu báo giá.</p>
                </div>

                <form action="/tra-ma-bao-gia" className="mt-5 space-y-3">
                  <Input
                    name="q"
                    type="text"
                    placeholder="6205, 6308, NU308, LGHP 2"
                    className="h-12 border-white/10 bg-white text-slate-950 placeholder:text-slate-400"
                    aria-label="Tra mã nhanh SKF"
                  />
                  <Button type="submit" className="h-11 w-full bg-[#0050A4] text-white hover:bg-[#003d7d]">
                    <Search className="mr-2 size-4" />
                    Mở trang tra mã SKF
                  </Button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                  {searchExamples.map((example) => (
                    <span key={example} className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-slate-200">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
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
