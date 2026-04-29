import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  Factory,
  Gauge,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { brandDescriptions, brandLogos } from "@/data/brand-logos";
import { industryApplications } from "@/data/industry-applications";
import { getProductVisual, productBenefitBullets } from "@/data/product-visuals";
import { productGroups, supportProcess, trustBullets } from "@/data/site-content";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createOrganizationSchema, createWebPageSchema, createWebSiteSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Nhà phân phối chính thức NTN, Tsubaki, Koyo",
  description:
    "Công Ty TNHH Tân Hòa Lợi là nhà phân phối chính thức NTN, Tsubaki và Koyo cho hệ vật tư truyền động công nghiệp Nhật Bản.",
  path: "/",
});

const homepageTitle = "Nhà phân phối chính thức NTN, Tsubaki, Koyo";
const homepageDescription =
  "Công Ty TNHH Tân Hòa Lợi là nhà phân phối chính thức NTN, Tsubaki và Koyo cho hệ vật tư truyền động công nghiệp Nhật Bản.";

const coreProducts = productGroups.filter((group) => group.slug === "ntn" || group.slug === "tsubaki");
const supportingProducts = productGroups.filter((group) => group.slug !== "ntn" && group.slug !== "tsubaki");

const heroStats = [
  { value: "2", label: "thương hiệu Nhật Bản chính" },
  { value: "3", label: "thương hiệu theo ứng dụng" },
  { value: "24h", label: "phản hồi B2B ưu tiên" },
];

const heroFocusCards = [
  { label: "Phân phối chính thức", value: "NTN · Tsubaki · Koyo", helper: "Danh mục rõ ràng theo nhóm sản phẩm" },
  { label: "Năng lực kỹ thuật", value: "Đối chiếu theo cụm máy", helper: "mã, ảnh tem, tải và môi trường chạy" },
  { label: "Ứng dụng nhà máy", value: "Bảo trì & thay thế", helper: "Phù hợp nhu cầu bảo trì và thay thế" },
];

const brandLogoById = new Map(brandLogos.map((brand) => [brand.id, brand]));

const brandThemes: Record<
  string,
  {
    accent: string;
    border: string;
    logoSurface: string;
    text: string;
    chip: string;
  }
> = {
  ntn: {
    accent: "bg-[#008fd3]",
    border: "border-[#008fd3]/30",
    logoSurface: "bg-[#e7f7ff]",
    text: "text-[#0078b8]",
    chip: "border-[#008fd3]/20 bg-[#e7f7ff] text-[#00699f]",
  },
  tsubaki: {
    accent: "bg-[#00a0df]",
    border: "border-[#00a0df]/30",
    logoSurface: "bg-[#e8f8ff]",
    text: "text-[#0078a8]",
    chip: "border-[#00a0df]/20 bg-[#e8f8ff] text-[#075985]",
  },
  koyo: {
    accent: "bg-[#d71920]",
    border: "border-[#d71920]/25",
    logoSurface: "bg-[#fff1f2]",
    text: "text-[#b6151b]",
    chip: "border-[#d71920]/20 bg-[#fff1f2] text-[#991b1b]",
  },
  nok: {
    accent: "bg-[#005bac]",
    border: "border-[#005bac]/30",
    logoSurface: "bg-[#edf5ff]",
    text: "text-[#00519a]",
    chip: "border-[#005bac]/20 bg-[#edf5ff] text-[#1d4ed8]",
  },
  soho: {
    accent: "bg-[#39a935]",
    border: "border-[#39a935]/25",
    logoSurface: "bg-[#effbf0]",
    text: "text-[#237a2a]",
    chip: "border-[#39a935]/20 bg-[#effbf0] text-[#166534]",
  },
};

const defaultBrandTheme = brandThemes.ntn;

function getBrandTheme(brandId: string) {
  return brandThemes[brandId] ?? defaultBrandTheme;
}

const trustArchitecture = [
  {
    title: "Nhà phân phối chính thức",
    description: "THL phân phối chính thức NTN, Tsubaki, Koyo theo chuẩn danh mục Nhật Bản.",
    Icon: ShieldCheck,
  },
  {
    title: "Danh mục thương hiệu rõ ràng",
    description: "THL phân phối chính thức NTN, Tsubaki, Koyo; đồng thời cung cấp NOK và Soho theo nhu cầu ứng dụng.",
    Icon: BadgeCheck,
  },
  {
    title: "Đối chiếu kỹ thuật",
    description: "Xử lý theo mã, ảnh tem, vị trí lắp và điều kiện vận hành.",
    Icon: Search,
  },
  {
    title: "Phục vụ nhà máy toàn quốc",
    description: "Phối hợp bảo trì, kỹ thuật và mua hàng trong quy trình B2B.",
    Icon: Factory,
  },
];

const processCards = [
  {
    title: "Tiếp nhận thông tin",
    description: "Mã cũ, ảnh tem, kích thước hoặc mô tả cụm máy đang cần thay.",
    Icon: MessageCircle,
  },
  {
    title: "Đối chiếu kỹ thuật",
    description: "Đối chiếu đúng NTN, Tsubaki, Koyo hoặc nhóm phù hợp theo điều kiện vận hành.",
    Icon: Search,
  },
  {
    title: "Chuyển hướng báo giá",
    description: "Tách rõ mã, ứng dụng và ghi chú để mua hàng xử lý rành mạch.",
    Icon: ClipboardCheck,
  },
];

const whyChooseItems = [
  {
    title: "Vai trò phân phối rõ ràng",
    description: trustBullets[0],
    Icon: ShieldCheck,
  },
  {
    title: "Danh mục có trọng tâm",
    description: trustBullets[1],
    Icon: BadgeCheck,
  },
  {
    title: "Tư vấn theo vận hành thực tế",
    description: trustBullets[2],
    Icon: Gauge,
  },
  {
    title: "Giảm rủi ro đặt sai vật tư",
    description: trustBullets[3],
    Icon: Clock3,
  },
];

const capabilityItems = [
  {
    title: "NTN cho cụm quay",
    description: "Vòng bi, motor, bơm, quạt, hộp số và vị trí cần độ ổn định cao.",
    Icon: Wrench,
  },
  {
    title: "Tsubaki cho truyền động",
    description: "Xích công nghiệp, băng tải xích, nhông xích và cơ cấu chạy tải.",
    Icon: BadgeCheck,
  },
  {
    title: "Koyo / NOK / Soho theo ứng dụng",
    description: "Koyo là phương án phân phối chính thức cho vòng bi; NOK và Soho phục vụ các nhu cầu làm kín, truyền động theo thực tế vận hành.",
    Icon: Factory,
  },
];

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
      <div className="overflow-x-hidden bg-white">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image
          src="/images/cards/products/ntn.png"
          alt="Cụm vật tư truyền động công nghiệp gồm vòng bi, trục và bánh răng"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/66" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/84 to-slate-950/35" />

        <div className="page-shell relative grid min-h-[620px] items-center gap-10 py-20 sm:min-h-[660px] lg:grid-cols-[0.94fr_1.06fr] lg:py-24">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100 backdrop-blur">
              Nhà phân phối chính thức NTN, Tsubaki, Koyo
            </p>
            <h1 className="hero-ntn-title font-heading text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-[3.25rem]">
              Vật tư truyền động Nhật Bản cho nhà máy
            </h1>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="h-11 bg-blue-700 px-5 text-white hover:bg-blue-800">
                <Link href="/san-pham">
                  <BadgeCheck className="mr-2 size-4" />
                  Xem danh mục
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-white/30 bg-white/10 px-5 text-white hover:bg-white hover:text-slate-950">
                <Link href="/lien-he">
                  <MessageCircle className="mr-2 size-4" />
                  Liên hệ THL
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4 lg:max-w-xl lg:justify-self-end">
            <div className="grid max-w-3xl gap-3 sm:grid-cols-3 lg:max-w-xl">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/12 bg-white/[0.08] p-4 backdrop-blur">
                  <p className="font-heading text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-sm leading-snug text-slate-200">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-lg border border-white/12 bg-white/[0.08] p-5 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.95)] backdrop-blur-md lg:block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Hệ danh mục Nhật Bản</p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-white">Danh mục thương hiệu chính hãng</h2>
                </div>
                <div className="rounded-md bg-blue-500 px-3 py-1 text-xs font-bold text-white">Chính thức</div>
              </div>

              <div className="mt-5 grid gap-3">
                {heroFocusCards.map((item) => (
                  <div key={item.label} className="grid grid-cols-[126px_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/52 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">{item.label}</p>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{item.helper}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-white/12 bg-white p-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hệ thương hiệu cung ứng</p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {brandLogos.map((brand) => {
                    const theme = getBrandTheme(brand.id);

                    return (
                      <div key={brand.id} className={`relative flex h-14 items-center justify-center overflow-hidden rounded-md border ${theme.border} bg-white p-2`}>
                        <span className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />
                        <Image
                          src={brand.src}
                          alt={brand.alt}
                          width={brand.id === "soho" ? 110 : 86}
                          height={brand.id === "soho" ? 46 : 34}
                          className={brand.id === "soho" ? "h-auto max-h-10 w-auto max-w-full object-contain" : "h-auto max-h-8 w-auto max-w-full object-contain"}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-5">
        <div className="page-shell grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustArchitecture.map((item) => (
            <div key={item.title} className="jp-panel-muted flex gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-800">
                <item.Icon className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block bg-white">
        <div className="page-shell space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Thương hiệu chính hãng"
              title="Danh mục thương hiệu phù hợp từng nhu cầu vận hành"
              description="THL phân phối chính thức NTN, Tsubaki, Koyo và cung cấp thêm NOK, Soho theo yêu cầu ứng dụng thực tế tại nhà máy."
            />
            <Button asChild variant="outline" className="w-fit border-blue-200 text-slate-800 hover:bg-blue-50">
              <Link href="/san-pham">
                Xem toàn bộ danh mục
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {coreProducts.map((group) => {
              const visual = getProductVisual(group.slug);
              const brand = brandLogoById.get(group.slug);
              const theme = getBrandTheme(group.slug);

              return (
                <Link key={group.slug} href={`/san-pham/${group.slug}`} className="group">
                  <Card className={`h-full overflow-hidden rounded-lg border bg-slate-950 py-0 text-white ${theme.border} shadow-[0_24px_56px_-42px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5`}>
                    <div className="grid min-h-full md:grid-cols-[0.95fr_1.05fr]">
                      <div className="relative min-h-72 overflow-hidden">
                        <Image
                          src={visual.image}
                          alt={visual.imageAlt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 520px"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/15 to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
                          Thương hiệu chính
                        </span>
                        {brand ? (
                          <div className="absolute bottom-4 left-4 flex h-16 w-40 items-center justify-center rounded-md border border-white/20 bg-white p-3 shadow-[0_18px_42px_-28px_rgba(15,23,42,0.7)]">
                            <Image src={brand.src} alt={brand.alt} width={144} height={58} className="h-auto max-h-11 w-auto max-w-full object-contain" />
                          </div>
                        ) : null}
                      </div>
                      <CardContent className="flex flex-col justify-between gap-6 p-6">
                        <div className="space-y-3">
                          <p className={`text-xs font-semibold uppercase tracking-wide ${group.slug === "ntn" ? "text-blue-200" : "text-sky-200"}`}>
                            {brandDescriptions[group.slug] ?? "Thương hiệu chính hãng"}
                          </p>
                          <h3 className="font-heading text-3xl font-bold text-white">{group.name}</h3>
                          <p className="text-sm leading-relaxed text-slate-300">{group.detailDescription}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.popularApplications.slice(0, 4).map((item) => (
                            <span key={item} className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-slate-100">
                              {item}
                            </span>
                          ))}
                        </div>
                        <p className="inline-flex items-center text-sm font-semibold text-blue-200 group-hover:text-blue-100">
                          Xem {group.name}
                          <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {supportingProducts.map((group) => {
              const brand = brandLogoById.get(group.slug);
              const theme = getBrandTheme(group.slug);

              return (
                <Link key={group.slug} href={`/san-pham/${group.slug}`} className="group">
                    <Card className={`h-full overflow-hidden rounded-lg border bg-white py-0 ${theme.border} shadow-[0_14px_36px_-30px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-30px_rgba(15,23,42,0.38)]`}>
                    <div className={`relative flex h-28 items-center justify-center overflow-hidden ${theme.logoSurface} p-5`}>
                      <span className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />
                      {brand ? (
                        <Image
                          src={brand.src}
                          alt={brand.alt}
                          width={group.slug === "soho" ? 170 : 132}
                          height={group.slug === "soho" ? 72 : 52}
                          className="relative h-auto max-h-16 w-auto max-w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.text}`}>
                            {brandDescriptions[group.slug] ?? "Danh mục triển khai"}
                          </p>
                          <h3 className="mt-1 font-heading text-lg font-bold text-slate-950">{group.name}</h3>
                        </div>
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${theme.logoSurface} ${theme.text}`}>
                          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{group.shortDescription}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.popularApplications.slice(0, 2).map((item) => (
                          <span key={item} className={`rounded-md border px-2 py-1 text-xs ${theme.chip}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-block bg-slate-50">
        <div className="page-shell space-y-8">
          <SectionTitle
            eyebrow="Quy trình B2B"
            title="Từ thông tin kỹ thuật đến phương án đặt hàng rõ ràng"
            description="THL tách dữ liệu kỹ thuật, nhóm thương hiệu và ghi chú mua hàng để các bộ phận trong nhà máy cùng kiểm tra rành mạch."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {processCards.map((item, index) => (
              <div key={item.title} className="jp-panel-muted relative p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-md bg-blue-50 text-blue-800">
                    <item.Icon className="size-5" />
                  </div>
                  <span className="font-heading text-3xl font-bold text-slate-200">{index + 1}</span>
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                {index < processCards.length - 1 ? (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden size-6 -translate-y-1/2 text-slate-300 lg:block" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block bg-white">
        <div className="page-shell space-y-8">
          <SectionTitle
            eyebrow="Ứng dụng theo ngành"
            title="Khoanh vùng vật tư theo loại máy và điều kiện vận hành"
            description="Các trang ứng dụng giúp xác định nhóm vật tư thường dùng cho máy gỗ, CNC, ép nhựa, bơm quạt, động cơ và băng tải trước khi chốt mã thay thế."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {industryApplications.map((app) => (
              <Link key={app.slug} href={`/ung-dung/${app.slug}`} className="group">
                <Card className="h-full rounded-lg border-slate-200 bg-white py-0 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-26px_rgba(15,23,42,0.34)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={app.image}
                      alt={app.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white">{app.name}</h3>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <p className="text-sm leading-relaxed text-slate-600">{app.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.commonParts.slice(0, 3).map((part) => (
                        <span key={part} className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-800">
                          {part}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block bg-white">
        <div className="page-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionTitle
            eyebrow="Năng lực THL"
            title="Đúng thương hiệu, đúng ứng dụng, đúng tiến độ bảo trì"
            description="Mỗi yêu cầu được xử lý theo vai trò phân phối, mã hàng, vị trí lắp và điều kiện vận hành để giảm rủi ro đặt sai vật tư."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {whyChooseItems.map((item) => (
              <div key={item.title} className="jp-panel p-5">
                <div className="mb-4 inline-flex rounded-md bg-blue-50 p-2 text-blue-800">
                  <item.Icon className="size-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block bg-slate-950 text-white">
        <div className="page-shell space-y-10">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="inline-flex rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                  Hỗ trợ công nghiệp B2B
                </p>
                <h2 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
                  Một đầu mối cho NTN, Tsubaki, Koyo và nhóm triển khai trọng tâm
                </h2>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                  Đội THL B2B tiếp nhận thông tin, đối chiếu kỹ thuật và chuyển hướng báo giá theo nhu cầu thực tế của nhà máy.
                </p>
              </div>

              <div className="space-y-3">
                {supportProcess.slice(0, 4).map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {brandLogos.map((brand) => {
                  const theme = getBrandTheme(brand.id);

                  return (
                    <div key={brand.id} className={`relative flex min-h-20 items-center justify-center overflow-hidden rounded-lg border ${theme.border} bg-white p-3`}>
                      <span className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />
                      <Image
                        src={brand.src}
                        alt={brand.alt}
                        width={brand.id === "soho" ? 180 : 130}
                        height={brand.id === "soho" ? 82 : 46}
                        className={brand.id === "soho" ? "h-auto max-h-14 w-auto max-w-full object-contain sm:max-h-16" : "h-auto max-h-10 w-auto max-w-full object-contain"}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {capabilityItems.map((item) => (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <item.Icon className="size-5 text-blue-300" />
                    <h3 className="mt-3 text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_46px_-34px_rgba(37,99,235,0.55)] sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl space-y-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200">
                <CheckCircle2 className="size-4" />
                Làm rõ phương án trước khi đặt hàng
              </p>
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                Gửi mã, ảnh tem hoặc mô tả cụm máy cho THL
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                THL đối chiếu theo điều kiện vận hành thực tế để đề xuất đúng nhóm hàng: NTN, Tsubaki, Koyo cho danh mục chính hãng và NOK, Soho cho nhu cầu ứng dụng phù hợp.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {productBenefitBullets.map((item) => (
                  <span key={item} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button asChild className="h-11 bg-blue-700 px-5 text-white hover:bg-blue-600">
                <Link href="/tra-ma-bao-gia">
                  <Search className="mr-2 size-4" />
                  Gửi yêu cầu
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-blue-300/40 bg-white/5 px-5 text-blue-100 hover:bg-white hover:text-slate-950">
                <a href={siteConfig.phoneHref}>
                  <PhoneCall className="mr-2 size-4" />
                  Liên hệ B2B
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
