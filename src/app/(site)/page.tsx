import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, MessageCircle, PhoneCall, Search } from "lucide-react";
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
  title: "Tra mã và danh mục sản phẩm",
  description: "Trang chủ ưu tiên tra mã, danh mục sản phẩm và ứng dụng ngành với asset sẵn có trong repo.",
  path: "/",
});

const homepageTitle = "Tra mã và danh mục sản phẩm";
const homepageDescription = "Trang chủ ưu tiên tra mã, danh mục sản phẩm và ứng dụng ngành với asset sẵn có trong repo.";

const appBySlug = new Map(industryApplications.map((app) => [app.slug, app]));
const pumpFanApplication = appBySlug.get("bom-quat-dong-co") ?? industryApplications[0];
const conveyorApplication = appBySlug.get("bang-tai-truyen-dong") ?? industryApplications[0];
const cncApplication = appBySlug.get("cnc") ?? industryApplications[0];
const plasticApplication = appBySlug.get("ep-nhua") ?? industryApplications[0];
const woodApplication = appBySlug.get("may-go") ?? industryApplications[0];

const productCategories = [
  {
    title: "Vòng bi",
    summary: "Ưu tiên tra mã và nhóm vòng bi chính.",
    image: getProductVisual("ntn").image,
    alt: getProductVisual("ntn").imageAlt,
    href: "/san-pham/ntn",
    eyebrow: "NTN",
  },
  {
    title: "Gối đỡ",
    summary: "Nhóm gối đỡ và cụm đỡ trục.",
    image: getProductVisual("koyo").image,
    alt: getProductVisual("koyo").imageAlt,
    href: "/san-pham/koyo",
    eyebrow: "Koyo",
  },
  {
    title: "Phớt",
    summary: "Tập trung phớt và vị trí làm kín.",
    image: getProductVisual("nok").image,
    alt: getProductVisual("nok").imageAlt,
    href: "/san-pham/nok",
    eyebrow: "NOK",
  },
  {
    title: "Mỡ bôi trơn",
    summary: "Giữ chỗ sẵn để tra mã mỡ công nghiệp.",
    image: pumpFanApplication.image,
    alt: pumpFanApplication.imageAlt,
    href: "/tra-ma-bao-gia",
    eyebrow: "Tra mã",
  },
  {
    title: "Bảo trì",
    summary: "Đi nhanh vào nhu cầu thay thế định kỳ.",
    image: "/images/giai-phap-khach-hang-hero.png",
    alt: "Khối hỗ trợ bảo trì nhà máy",
    href: "/giai-phap-theo-khach-hang/bao-tri",
    eyebrow: "Hỗ trợ",
  },
  {
    title: "Truyền động",
    summary: "Chuỗi xích, băng tải và vật tư truyền động.",
    image: getProductVisual("tsubaki").image,
    alt: getProductVisual("tsubaki").imageAlt,
    href: "/san-pham/tsubaki",
    eyebrow: "Tsubaki",
  },
] as const;

const applicationCards = [
  {
    title: "Motor",
    href: "/ung-dung/bom-quat-dong-co",
    image: pumpFanApplication.image,
    alt: pumpFanApplication.imageAlt,
    tags: ["Vòng bi", "Mỡ bôi trơn"],
  },
  {
    title: "Bơm / Quạt",
    href: "/ung-dung/bom-quat-dong-co",
    image: pumpFanApplication.image,
    alt: pumpFanApplication.imageAlt,
    tags: ["Phớt", "Dây curoa"],
  },
  {
    title: "Băng tải",
    href: "/ung-dung/bang-tai-truyen-dong",
    image: conveyorApplication.image,
    alt: conveyorApplication.imageAlt,
    tags: ["Xích", "Gối đỡ"],
  },
  {
    title: "CNC",
    href: "/ung-dung/cnc",
    image: cncApplication.image,
    alt: cncApplication.imageAlt,
    tags: ["Vòng bi", "Phớt"],
  },
  {
    title: "Ép nhựa",
    href: "/ung-dung/ep-nhua",
    image: plasticApplication.image,
    alt: plasticApplication.imageAlt,
    tags: ["Phớt", "Mỡ bôi trơn"],
  },
  {
    title: "Máy gỗ",
    href: "/ung-dung/may-go",
    image: woodApplication.image,
    alt: woodApplication.imageAlt,
    tags: ["Vòng bi", "Truyền động"],
  },
] as const;

const searchExamples = ["6205", "6308", "NU308", "LGHP 2"] as const;

const supportCards = [
  {
    title: "Tuyển dụng",
    summary: "Xem nhanh khu vực tuyển dụng đang có trong hệ thống.",
    image: "/images/tuyen-dung/tuyen-dung-hero.png",
    alt: "Khối tuyển dụng",
    href: "/tuyen-dung",
    cta: "Xem tuyển dụng",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Hỗ trợ",
    summary: "Đi tới liên hệ hoặc gửi yêu cầu kỹ thuật khi cần tra mã sâu hơn.",
    image: "/images/giai-phap-khach-hang-hero.png",
    alt: "Khối hỗ trợ liên hệ",
    href: "/lien-he",
    cta: "Liên hệ",
    Icon: MessageCircle,
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
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
          <Image
            src="/images/giai-phap-khach-hang-hero.png"
            alt="Tra mã và danh mục sản phẩm công nghiệp"
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/72" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(15,23,42,0.74))]" />

          <div className="page-shell relative grid gap-8 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
            <div className="max-w-3xl space-y-6">
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100 backdrop-blur">
                Trang chủ ưu tiên tra mã
              </p>
              <div className="space-y-4">
                <h1 className="font-heading text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-[3.35rem]">
                  Tra mã nhanh, vào đúng danh mục và ứng dụng ngay từ trang chủ
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Giữ layout gọn, ưu tiên khu tra mã, danh mục sản phẩm chính và ứng dụng ngành bằng ảnh sẵn có trong repo.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild className="h-11 bg-blue-700 px-5 text-white hover:bg-blue-600">
                  <Link href="#tra-ma">
                    <Search className="mr-2 size-4" />
                    Tra mã
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 border-white/25 bg-white/10 px-5 text-white hover:bg-white hover:text-slate-950">
                  <Link href="#danh-muc">
                    Xem danh mục
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/12 bg-white/10 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.95)] backdrop-blur-md sm:p-6">
              <div className="rounded-[1.5rem] border border-white/12 bg-slate-950/70 p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Khối tra mã nhanh</p>
                  <h2 className="font-heading text-2xl font-bold text-white">Giữ sẵn cấu trúc để gắn data sau</h2>
                  <p className="text-sm leading-6 text-slate-300">
                    Nhập mã mẫu để đi tiếp tới trang tra mã hiện có, chưa cần data thật ở bước này.
                  </p>
                </div>

                <form action="/tra-ma-bao-gia" className="mt-5 space-y-3">
                  <Input
                    name="q"
                    type="text"
                    placeholder="6205, 6308, NU308, LGHP 2"
                    className="h-12 border-white/10 bg-white text-slate-950 placeholder:text-slate-400"
                    aria-label="Tra mã nhanh"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="h-11 flex-1 bg-blue-700 text-white hover:bg-blue-600">
                      <Search className="mr-2 size-4" />
                      Tra mã ngay
                    </Button>
                    <Button asChild variant="outline" className="h-11 border-white/15 bg-white/5 text-white hover:bg-white hover:text-slate-950">
                      <Link href="/san-pham">Xem tất cả danh mục</Link>
                    </Button>
                  </div>
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionTitle
                eyebrow="Danh mục chính"
                title="Ưu tiên 6 nhóm cần vào nhanh"
                description="Card gọn, dùng ảnh preview sẵn có và dẫn thẳng tới nhóm trang đang có trong repo."
              />
              <Button asChild variant="outline" className="w-fit border-blue-200 text-slate-900 hover:bg-blue-50">
                <Link href="/san-pham">
                  Xem trang sản phẩm
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {productCategories.map((category) => (
                <Link key={category.title} href={category.href} className="group">
                  <Card className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white py-0 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_-30px_rgba(15,23,42,0.34)]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/20 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900">
                        {category.eyebrow}
                      </span>
                    </div>
                    <CardContent className="space-y-3 p-5">
                      <div className="space-y-1.5">
                        <h3 className="font-heading text-xl font-bold text-slate-950">{category.title}</h3>
                        <p className="text-sm leading-6 text-slate-600">{category.summary}</p>
                      </div>
                      <p className="inline-flex items-center text-sm font-semibold text-blue-800">
                        Mở danh mục
                        <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block bg-slate-50">
          <div className="page-shell space-y-8">
            <SectionTitle
              eyebrow="Ứng dụng ngành"
              title="Đi từ loại máy tới nhóm vật tư nhanh hơn"
              description="Dùng lại ảnh preview hiện có để rút ngắn đường đi từ homepage sang khu ứng dụng."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {applicationCards.map((application) => (
                <Link key={application.title} href={application.href} className="group">
                  <Card className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white py-0 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.22)] transition hover:-translate-y-1 hover:shadow-[0_24px_52px_-30px_rgba(15,23,42,0.32)]">
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
                          <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-800" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="tra-ma" className="section-block bg-white">
          <div className="page-shell">
            <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_30px_80px_-44px_rgba(15,23,42,0.88)] sm:p-8 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Tra mã nhanh</p>
                  <h2 className="font-heading text-3xl font-bold leading-tight text-white">
                    Khối tra mã riêng, nổi bật và sẵn để nối data sau
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    Giữ sẵn ô nhập mã cho vòng bi, phớt, mỡ bôi trơn và các nhóm vật tư chính mà không thay đổi logic lớn hiện tại.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchExamples.map((example) => (
                    <span key={example} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-slate-200">
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              <form action="/tra-ma-bao-gia" className="rounded-[1.5rem] border border-white/10 bg-white p-5 text-slate-950 sm:p-6">
                <label htmlFor="homepage-lookup" className="text-sm font-semibold text-slate-900">
                  Nhập mã cần tra
                </label>
                <Input
                  id="homepage-lookup"
                  name="q"
                  type="text"
                  placeholder="6205, 6308, NU308, LGHP 2"
                  className="mt-3 h-12 border-slate-200 bg-slate-50"
                />
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Cấu trúc chỉ giữ sẵn cho bước nhập data tiếp theo, hiện vẫn dùng route tra mã hiện có của project.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" className="h-11 flex-1 bg-blue-700 text-white hover:bg-blue-600">
                    <Search className="mr-2 size-4" />
                    Tra mã
                  </Button>
                  <Button asChild variant="outline" className="h-11 border-slate-300 text-slate-900 hover:bg-slate-50">
                    <Link href="/tra-ma-bao-gia">Mở form đầy đủ</Link>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="section-block bg-slate-50">
          <div className="page-shell space-y-8">
            <SectionTitle
              eyebrow="Tuyển dụng / hỗ trợ"
              title="Giữ hai lối đi ngắn cho mobile và desktop"
              description="Không thêm nội dung dài, chỉ gom lại thành hai card rõ ràng để hỗ trợ hành động tiếp theo."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              {supportCards.map((card) => (
                <Link key={card.title} href={card.href} className="group">
                  <Card className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white py-0 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.24)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_-28px_rgba(15,23,42,0.32)]">
                    <div className="grid h-full lg:grid-cols-[0.92fr_1.08fr]">
                      <div className="relative min-h-64 overflow-hidden">
                        <Image
                          src={card.image}
                          alt={card.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/10 to-transparent lg:bg-gradient-to-r lg:from-slate-950/18 lg:to-transparent" />
                      </div>
                      <CardContent className="flex flex-col justify-between gap-5 p-6">
                        <div className="space-y-3">
                          <div className="inline-flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-800">
                            <card.Icon className="size-5" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-heading text-2xl font-bold text-slate-950">{card.title}</h3>
                            <p className="text-sm leading-6 text-slate-600">{card.summary}</p>
                          </div>
                        </div>
                        <p className="inline-flex items-center text-sm font-semibold text-blue-800">
                          {card.cta}
                          <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.2)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-950">Cần hỗ trợ thêm ngoài khối tra mã?</p>
                  <p className="text-sm text-slate-600">Giữ sẵn đường đi tới liên hệ và form hiện có, không thay đổi logic hệ thống.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-50">
                    <a href={siteConfig.phoneHref}>
                      <PhoneCall className="mr-2 size-4" />
                      Liên hệ
                    </a>
                  </Button>
                  <Button asChild className="bg-blue-700 text-white hover:bg-blue-600">
                    <Link href="/tra-ma-bao-gia">
                      <Search className="mr-2 size-4" />
                      Mở trang tra mã
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
