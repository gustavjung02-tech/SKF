import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, ClipboardCheck, Factory, ShieldCheck } from "lucide-react";
import { customerSegments, productGroups, supportProcess } from "@/data/site-content";
import { brandLogos, getBrandLogoById } from "@/data/brand-logos";
import { getProductVisual } from "@/data/product-visuals";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Giới thiệu THL | Nhà phân phối chính thức NTN, Tsubaki, Koyo",
  description:
    "Công Ty TNHH Tân Hòa Lợi là nhà phân phối chính thức NTN, Tsubaki, Koyo và triển khai tư vấn vật tư truyền động công nghiệp theo chuẩn B2B.",
  path: "/gioi-thieu",
});

const capabilityBlocks = [
  {
    title: "Nhà phân phối chính thức",
    description: "THL định vị rõ vai trò doanh nghiệp trong hệ phân phối chính thức NTN, Tsubaki và Koyo cho khách hàng công nghiệp.",
    Icon: ShieldCheck,
  },
  {
    title: "Danh mục triển khai có trọng tâm",
    description: "THL phân phối chính thức NTN, Tsubaki, Koyo và cung cấp thêm NOK, Soho theo nhu cầu ứng dụng thực tế.",
    Icon: BadgeCheck,
  },
  {
    title: "Xử lý kỹ thuật B2B",
    description: "Tiếp nhận mã, ảnh tem, kích thước và mô tả cụm máy để đối chiếu theo điều kiện vận hành.",
    Icon: ClipboardCheck,
  },
  {
    title: "Phục vụ nhà máy",
    description: "Phối hợp với bảo trì, kỹ thuật và mua hàng để rút ngắn vòng xác nhận trước khi đặt hàng.",
    Icon: Factory,
  },
];

export default function AboutPage() {
  const pageSchema = createWebPageSchema({
    title: "Giới thiệu THL | Nhà phân phối chính thức NTN, Tsubaki, Koyo",
    description:
      "Công Ty TNHH Tân Hòa Lợi là nhà phân phối chính thức NTN, Tsubaki, Koyo và triển khai tư vấn vật tư truyền động công nghiệp theo chuẩn B2B.",
    path: "/gioi-thieu",
    type: "AboutPage",
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/gioi-thieu" },
  ]);

  return (
    <>
      <StructuredData data={[pageSchema, breadcrumbSchema]} />
      <div className="section-block">
        <div className="page-shell space-y-12">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_36px_-30px_rgba(15,23,42,0.55)]">
          <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
            <div className="space-y-6 p-6 sm:p-8 lg:p-10">
              <SectionTitle
                eyebrow="Giới thiệu THL"
                title="Nhà phân phối chính thức NTN, Tsubaki, Koyo cho vật tư truyền động công nghiệp"
                description="Công Ty TNHH Tân Hòa Lợi cung cấp danh mục vật tư truyền động chính hãng cho nhà máy, với hệ thương hiệu rõ ràng theo từng nhóm sản phẩm và nhu cầu ứng dụng."
              />
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                THL làm việc theo hướng doanh nghiệp B2B: tiếp nhận nhu cầu kỹ thuật, đối chiếu mã và ứng dụng, sau đó chuyển hướng báo giá rõ ràng để bộ phận bảo trì, kỹ thuật và mua hàng cùng kiểm tra.
              </p>
              <div className="grid max-w-md grid-cols-3 gap-2">
                {brandLogos.slice(0, 3).map((brand) => (
                  <div key={brand.id} className="flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white p-2">
                    <Image src={brand.src} alt={brand.alt} width={96} height={30} className="h-auto max-h-7 w-auto max-w-full object-contain" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-blue-800 hover:bg-blue-900">
                  <Link href="/san-pham">
                    Xem danh mục
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-50">
                  <Link href="/tra-ma-bao-gia">Gửi yêu cầu kỹ thuật</Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-72 bg-slate-100">
              <Image
                src="/images/cards/solutions/ky-thuat.png"
                alt="Đội kỹ thuật THL đối chiếu vật tư truyền động theo cụm máy tại nhà máy"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle
            eyebrow="Năng lực doanh nghiệp"
            title="Cách THL hỗ trợ nhà máy"
            description="Các điểm chạm chính được tổ chức theo ngôn ngữ kỹ thuật, gọn và rõ để phù hợp với quy trình mua hàng công nghiệp."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilityBlocks.map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-blue-50 text-blue-800">
                  <item.Icon className="size-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle
            eyebrow="Thương hiệu phân phối"
            title="Hệ thương hiệu chính hãng theo từng nhóm nhu cầu"
            description="THL phân phối chính thức NTN, Tsubaki, Koyo và cung cấp thêm NOK, Soho cho các nhu cầu làm kín và truyền động theo ứng dụng thực tế."
          />

          <div className="grid gap-3 sm:grid-cols-5">
            {brandLogos.map((brand) => (
              <div key={brand.id} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-center">
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={brand.id === "soho" ? 150 : 120}
                  height={brand.id === "soho" ? 66 : 44}
                  className="h-auto max-h-12 w-auto max-w-full object-contain"
                />
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  {brand.role === "core" ? "Chính" : "Ứng dụng"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <SectionTitle
            eyebrow="Quy trình tiếp nhận"
            title="Từ nhu cầu kỹ thuật đến thông tin đặt hàng"
            description="THL ưu tiên xử lý yêu cầu có đủ mã cũ, ảnh tem, kích thước hoặc mô tả cụm máy để rút ngắn thời gian đối chiếu."
          />

          <div className="space-y-3">
            {supportProcess.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-800 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle
            eyebrow="Nhóm sản phẩm"
            title="Danh mục vật tư truyền động chính"
            description="Các nhóm hàng được sắp theo vai trò sử dụng: NTN, Tsubaki cho nhu cầu phổ biến; Koyo cho nhóm vòng bi, cùng NOK và Soho theo ứng dụng vận hành."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {productGroups.map((group) => {
              const visual = getProductVisual(group.slug);
              const logo = getBrandLogoById(group.slug);
              const isCore = group.slug === "ntn" || group.slug === "tsubaki";

              return (
                <Card key={group.slug} className="overflow-hidden border-slate-200 bg-white py-0 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={visual.image}
                      alt={visual.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                      {isCore ? "Chính" : "Ứng dụng"}
                    </span>
                    {logo ? (
                      <div className="absolute bottom-3 left-3 flex h-9 w-24 items-center justify-center rounded-md border border-white/30 bg-white/95 p-1.5 shadow-sm">
                        <Image src={logo.src} alt={logo.alt} width={88} height={26} className="h-auto max-h-6 w-auto max-w-full object-contain" />
                      </div>
                    ) : null}
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <h3 className="text-base font-bold text-slate-900">{group.name}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{group.shortDescription}</p>
                    <Link href={`/san-pham/${group.slug}`} className="inline-flex items-center text-sm font-semibold text-blue-800 hover:text-blue-900">
                      Xem chi tiết
                      <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle
            eyebrow="Nhóm khách hàng"
            title="Phù hợp với quy trình mua hàng công nghiệp"
            description="THL phục vụ các nhóm cần xác nhận rõ thương hiệu, mã hàng và điều kiện vận hành trước khi đặt vật tư."
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {customerSegments.map((segment) => (
              <div key={segment.name} className="rounded-lg border border-slate-200 bg-white p-4">
                <Building2 className="mb-3 size-5 text-blue-800" />
                <p className="text-sm font-semibold text-slate-900">{segment.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{segment.summary}</p>
              </div>
            ))}
          </div>
        </section>
        </div>
      </div>
    </>
  );
}
