import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, ClipboardCheck, Factory, ShieldCheck } from "lucide-react";
import { customerSegments, productGroups, supportProcess } from "@/data/site-content";
import { brandLogos } from "@/data/brand-logos";
import { getProductVisual } from "@/data/product-visuals";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Giới thiệu SKF Công Nghiệp",
  description:
    "Website tra mã và tiếp nhận yêu cầu báo giá sản phẩm SKF cho khách hàng công nghiệp.",
  path: "/gioi-thieu",
});

const capabilityBlocks = [
  {
    title: "Tập trung sản phẩm SKF",
    description:
      "Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành.",
    Icon: ShieldCheck,
  },
  {
    title: "Danh mục đúng bối cảnh nhà máy",
    description:
      "Sắp nhóm theo vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động để dễ đối chiếu.",
    Icon: BadgeCheck,
  },
  {
    title: "Xử lý kỹ thuật B2B",
    description:
      "Tiếp nhận mã, ảnh tem, kích thước và mô tả cụm máy để khoanh nhóm sản phẩm phù hợp.",
    Icon: ClipboardCheck,
  },
  {
    title: "Phục vụ vận hành công nghiệp",
    description:
      "Phối hợp với bảo trì, kỹ thuật và mua hàng để rút ngắn vòng xác nhận trước khi đặt hàng.",
    Icon: Factory,
  },
];

export default function AboutPage() {
  const pageSchema = createWebPageSchema({
    title: "Giới thiệu SKF Công Nghiệp",
    description:
      "Website tra mã và tiếp nhận yêu cầu báo giá sản phẩm SKF cho khách hàng công nghiệp.",
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
                  eyebrow="SKF Công Nghiệp"
                  title="Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp"
                  description="SKF cho nhà máy công nghiệp: vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động."
                />
                <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                  Website tra mã và tiếp nhận yêu cầu báo giá sản phẩm SKF cho khách hàng công nghiệp. Đội ngũ hỗ trợ đối chiếu theo mã, ứng dụng, kích thước và điều kiện vận hành thực tế.
                </p>
                <div className="grid max-w-md grid-cols-3 gap-2">
                  {brandLogos.slice(0, 3).map((brand) => (
                    <div key={brand.id} className="flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white p-2">
                      <Image src={brand.src} alt={brand.alt} width={120} height={40} className="h-auto max-h-8 w-auto max-w-full object-contain" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="bg-[#0050A4] hover:bg-[#003d7d]">
                    <Link href="/tra-ma-bao-gia">
                      Tra mã SKF
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-[#0050A4]/30 text-[#0050A4] hover:bg-[#EEF4FB]">
                    <Link href="/lien-he">Liên hệ</Link>
                  </Button>
                </div>
              </div>

              <div className="relative min-h-72 bg-slate-100">
                <Image
                  src="/images/cards/solutions/ky-thuat.png"
                  alt="Đội kỹ thuật đối chiếu sản phẩm SKF theo cụm máy tại nhà máy"
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
              eyebrow="Năng lực hỗ trợ"
              title="Cách SKF Công Nghiệp hỗ trợ nhà máy"
              description="Các điểm chạm chính được tổ chức theo ngôn ngữ kỹ thuật, gọn và rõ để phù hợp với quy trình mua hàng công nghiệp."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {capabilityBlocks.map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-[#EEF4FB] text-[#0050A4]">
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
              eyebrow="Nhóm sản phẩm"
              title="SKF cho nhà máy công nghiệp"
              description="Các nhóm hàng được sắp theo vai trò sử dụng: vòng bi, gối đỡ, phớt, mỡ và hệ thống bôi trơn, dụng cụ bảo trì và truyền động."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productGroups.map((group) => {
                const visual = getProductVisual(group.slug);
                const logo = brandLogos.find((brand) => brand.id === group.slug);

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
                        SKF
                      </span>
                      {logo ? (
                        <div className="absolute bottom-3 left-3 flex h-9 w-28 items-center justify-center rounded-md border border-white/30 bg-white/95 p-1.5 shadow-sm">
                          <Image src={logo.src} alt={logo.alt} width={112} height={34} className="h-auto max-h-7 w-auto max-w-full object-contain" />
                        </div>
                      ) : null}
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <h3 className="text-base font-bold text-slate-900">{group.name}</h3>
                      <p className="text-sm leading-relaxed text-slate-600">{group.shortDescription}</p>
                      <Link href={`/san-pham/${group.slug}`} className="inline-flex items-center text-sm font-semibold text-[#0050A4] hover:text-[#003d7d]">
                        Xem chi tiết
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <SectionTitle
              eyebrow="Quy trình tiếp nhận"
              title="Từ nhu cầu kỹ thuật đến thông tin báo giá"
              description="Ưu tiên xử lý yêu cầu có mã cũ, ảnh tem, kích thước hoặc mô tả cụm máy để rút ngắn thời gian đối chiếu."
            />

            <div className="space-y-3">
              {supportProcess.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#0050A4] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <SectionTitle
              eyebrow="Nhóm khách hàng"
              title="Phù hợp với quy trình mua hàng công nghiệp"
              description="Phục vụ các nhóm cần xác nhận rõ mã hàng, nhóm sản phẩm và điều kiện vận hành trước khi đặt vật tư."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {customerSegments.map((segment) => (
                <div key={segment.name} className="rounded-lg border border-slate-200 bg-white p-4">
                  <Building2 className="mb-3 size-5 text-[#0050A4]" />
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
