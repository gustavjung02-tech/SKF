import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { getProductVisual, productBenefitBullets } from "@/data/product-visuals";
import { productGroups } from "@/data/site-content";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Danh mục vật tư truyền động chính hãng THL",
  description:
    "Danh mục vật tư truyền động công nghiệp của THL gồm NTN, Tsubaki, Koyo và các nhóm ứng dụng NOK, Soho cho nhu cầu vận hành nhà máy.",
  path: "/san-pham",
});

const coreProducts = productGroups.filter((group) => group.slug === "ntn" || group.slug === "tsubaki");
const supportingProducts = productGroups.filter((group) => group.slug !== "ntn" && group.slug !== "tsubaki");

function ProductCard({ slug, layout = "horizontal" }: { slug: string; layout?: "horizontal" | "vertical" }) {
  const group = productGroups.find((item) => item.slug === slug);

  if (!group) return null;

  const visual = getProductVisual(group.slug);
  const isCore = group.slug === "ntn" || group.slug === "tsubaki";
  const isVertical = layout === "vertical";

  return (
    <Card key={group.slug} id={group.slug} className="rounded-lg border-slate-200 bg-white py-0 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.24)]">
      <div className={isVertical ? "grid gap-0" : "grid gap-0 md:grid-cols-[220px_1fr]"}>
        <div className={isVertical ? "relative aspect-[16/9] overflow-hidden" : "relative min-h-52 overflow-hidden md:min-h-full"}>
          <Image
            src={visual.image}
            alt={visual.imageAlt}
            fill
            sizes={isVertical ? "(max-width: 1280px) 100vw, 33vw" : "(max-width: 768px) 100vw, 220px"}
            className="object-cover"
          />
          <div className={isVertical ? "absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/12 to-transparent" : "absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent md:bg-slate-950/10"} />
          <span className="absolute left-3 top-3 rounded-md border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
            {isCore ? "Chính" : "Ứng dụng"}
          </span>
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-bold text-slate-950">{group.name}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{group.detailDescription}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ứng dụng phổ biến</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.popularApplications.slice(0, 5).map((application) => (
                <span key={application} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  {application}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            {productBenefitBullets.slice(0, 2).map((benefit) => (
              <p key={benefit} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-800" />
                {benefit}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-50">
              <Link href="/tra-ma-bao-gia">
                <Search className="mr-2 size-4" />
                Gửi mã cần tìm
              </Link>
            </Button>
            <Link href={`/san-pham/${group.slug}`} className="inline-flex items-center text-sm font-semibold text-blue-800 hover:text-blue-900">
              Xem chi tiết
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export default function ProductsPage() {
  const pageSchema = createWebPageSchema({
    title: "Danh mục vật tư truyền động chính hãng THL",
    description:
      "Danh mục vật tư truyền động công nghiệp của THL gồm NTN, Tsubaki, Koyo và các nhóm ứng dụng NOK, Soho cho nhu cầu vận hành nhà máy.",
    path: "/san-pham",
    type: "CollectionPage",
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/san-pham" },
  ]);

  return (
    <>
      <StructuredData data={[pageSchema, breadcrumbSchema]} />
      <div className="bg-white">
        <section className="section-block border-b border-slate-100">
        <div className="page-shell">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_36px_-30px_rgba(15,23,42,0.55)]">
            <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
              <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                <SectionTitle
                  eyebrow="Danh mục sản phẩm"
                  title="Danh mục vật tư truyền động chính hãng cho nhà máy"
                  description="THL tổ chức danh mục theo hệ vật tư truyền động Nhật Bản chính hãng: NTN cho vòng bi và cụm quay, Tsubaki cho xích và cơ cấu truyền động; Koyo cho nhóm vòng bi, cùng NOK và Soho theo từng ứng dụng."
                />
                <p className="max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                  Trang sản phẩm được chia theo nhóm thương hiệu và ứng dụng để bộ phận bảo trì, kỹ thuật và mua hàng khoanh nhanh đúng hướng trước khi đi vào chi tiết mã hàng.
                </p>
                <div className="grid max-w-xl gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Thương hiệu chính</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">NTN và Tsubaki</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phân phối chính thức</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">Koyo theo nhóm vòng bi</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bổ sung theo ứng dụng</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">NOK và Soho</p>
                  </div>
                </div>
                <Button asChild className="w-fit bg-blue-800 hover:bg-blue-900">
                  <Link href="/tra-ma-bao-gia">
                    <Search className="mr-2 size-4" />
                    Gửi yêu cầu kỹ thuật
                  </Link>
                </Button>
              </div>

              <div className="relative min-h-72 bg-slate-100">
                <Image
                  src="/images/seo/seo-san-pham-ntn-koyo-tsubaki-soho-nok.png"
                  alt="Danh mục vật tư truyền động THL với NTN, Tsubaki, Koyo, NOK và Soho"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/12 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/20 bg-slate-950/65 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Danh mục chính hãng</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">
                    Danh mục được trình bày rõ theo nhóm sản phẩm và nhu cầu ứng dụng để rút ngắn thời gian đối chiếu trước khi đặt hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>

        <section className="section-block bg-slate-50">
          <div className="page-shell space-y-10">
          <div className="space-y-5">
            <SectionTitle
              eyebrow="Thương hiệu chính"
              title="NTN và Tsubaki cho nhóm sản phẩm dùng nhiều"
              description="Hai thương hiệu này được trình bày riêng để người dùng tra cứu nhanh nhóm vòng bi và truyền động phổ biến trong nhà máy."
            />
            <div className="grid gap-5 lg:grid-cols-2">
              {coreProducts.map((group) => (
                <ProductCard key={group.slug} slug={group.slug} />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <SectionTitle
              eyebrow="Nhóm bổ sung theo ứng dụng"
              title="Koyo, NOK và Soho mở rộng phương án theo ứng dụng"
              description="Koyo được giữ là phương án phân phối chính thức trong nhóm vòng bi và gối đỡ; NOK và Soho hỗ trợ nhu cầu làm kín, truyền động theo điều kiện vận hành thực tế."
            />
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {supportingProducts.map((group) => (
                <ProductCard key={group.slug} slug={group.slug} layout="vertical" />
              ))}
            </div>
          </div>
          </div>
        </section>
      </div>
    </>
  );
}
