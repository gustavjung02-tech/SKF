import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getProductVisual } from "@/data/product-visuals";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
import { SitePageHero } from "@/components/shared/site-page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Sản phẩm SKF cho nhà máy công nghiệp",
  description: "Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành.",
  path: "/san-pham",
});

type ProductGroupCard = {
  slug: string;
  name: string;
  shortDescription: string;
  detailDescription: string;
  image: string;
  imageAlt: string;
  popularApplications: string[];
};

type ProductMiniCard = {
  slug: string;
  label: string;
  image: string;
  imageAlt: string;
};

const productGroupCards: ProductGroupCard[] = [
  {
    slug: "vong-bi-skf",
    name: "Vòng bi SKF",
    shortDescription: "Đối chiếu mã vòng bi theo tải, tốc độ và môi trường vận hành.",
    detailDescription: "Phù hợp cho motor, bơm, quạt, hộp số và các cụm quay cần độ ổn định cao.",
    image: getProductVisual("vong-bi-skf").image,
    imageAlt: "Vòng bi SKF trong ứng dụng công nghiệp",
    popularApplications: ["Motor", "Bơm", "Quạt", "Hộp số", "Con lăn"],
  },
  {
    slug: "goi-do-skf",
    name: "Gối đỡ SKF",
    shortDescription: "Khoanh nhanh nhóm gối đỡ theo loại trục và không gian lắp.",
    detailDescription: "Tối ưu cho băng tải, trục truyền động và các cụm máy chạy liên tục theo ca.",
    image: getProductVisual("goi-do-skf").image,
    imageAlt: "Gối đỡ SKF cho cụm trục công nghiệp",
    popularApplications: ["Băng tải", "Trục truyền", "Quạt", "Máy đóng gói"],
  },
  {
    slug: "phot-skf",
    name: "Phớt SKF",
    shortDescription: "Tra mã phớt theo kích thước cốt, vỏ và điều kiện làm kín.",
    detailDescription: "Phù hợp cụm trục, hộp số, bơm và vị trí cần kiểm soát dầu, bụi, độ ẩm.",
    image: getProductVisual("phot-skf").image,
    imageAlt: "Phớt SKF cho cụm làm kín",
    popularApplications: ["Hộp số", "Cụm trục", "Máy bơm", "Cụm thủy lực"],
  },
  {
    slug: "boi-tron-skf-lincoln",
    name: "Mỡ & hệ thống bôi trơn SKF/Lincoln",
    shortDescription: "Mỡ công nghiệp và hệ thống bôi trơn cho vận hành ổn định.",
    detailDescription: "Áp dụng cho dây chuyền tải liên tục, điểm bôi trơn khó tiếp cận và bảo trì theo chu kỳ.",
    image: getProductVisual("boi-tron-skf-lincoln").image,
    imageAlt: "Mỡ và hệ thống bôi trơn SKF Lincoln",
    popularApplications: ["Băng tải", "Trục quay", "Cụm chịu tải", "Bảo trì định kỳ"],
  },
  {
    slug: "dung-cu-bao-tri-skf",
    name: "Dụng cụ bảo trì SKF",
    shortDescription: "Hỗ trợ tháo lắp, căn chỉnh và kiểm tra thiết bị quay.",
    detailDescription: "Giúp đội bảo trì giảm thời gian dừng máy và chuẩn hóa thao tác kỹ thuật tại hiện trường.",
    image: getProductVisual("dung-cu-bao-tri-skf").image,
    imageAlt: "Dụng cụ bảo trì SKF cho nhà máy",
    popularApplications: ["Căn chỉnh", "Tháo lắp", "Kiểm tra", "Bảo trì nhanh"],
  },
  {
    slug: "truyen-dong-skf",
    name: "Truyền động SKF",
    shortDescription: "Nhóm truyền động cho hệ băng tải và cụm quay công nghiệp.",
    detailDescription: "Hỗ trợ khoanh nhóm theo vị trí máy, tải chạy và điều kiện vận hành thực tế.",
    image: getProductVisual("truyen-dong-skf").image,
    imageAlt: "Nhóm truyền động SKF cho dây chuyền",
    popularApplications: ["Băng tải", "Dây chuyền", "Cụm truyền", "Máy sản xuất"],
  },
];

const productMiniCards: ProductMiniCard[] = [
  {
    slug: "vong-bi-skf",
    label: "Vòng bi SKF",
    image: getProductVisual("vong-bi-skf").image,
    imageAlt: "Vòng bi SKF",
  },
  {
    slug: "goi-do-skf",
    label: "Gối đỡ SKF",
    image: getProductVisual("goi-do-skf").image,
    imageAlt: "Gối đỡ SKF",
  },
  {
    slug: "phot-skf",
    label: "Phớt SKF",
    image: getProductVisual("phot-skf").image,
    imageAlt: "Phớt SKF",
  },
  {
    slug: "boi-tron-skf-lincoln",
    label: "Bôi trơn SKF",
    image: getProductVisual("boi-tron-skf-lincoln").image,
    imageAlt: "Bôi trơn SKF",
  },
  {
    slug: "dung-cu-bao-tri-skf",
    label: "Dụng cụ bảo trì",
    image: getProductVisual("dung-cu-bao-tri-skf").image,
    imageAlt: "Dụng cụ bảo trì SKF",
  },
  {
    slug: "truyen-dong-skf",
    label: "Truyền động SKF",
    image: getProductVisual("truyen-dong-skf").image,
    imageAlt: "Truyền động SKF",
  },
];

const productMiniCardsLoop = [...productMiniCards, ...productMiniCards];

function ProductCard({ item }: { item: ProductGroupCard }) {
  return (
    <Card id={item.slug} className="rounded-lg border-[#DDE7F3] bg-white py-0 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.24)]">
      <div className="grid gap-0">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 1280px) 100vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/12 to-transparent" />
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-bold text-slate-950">{item.name}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{item.shortDescription}</p>
            <p className="text-sm leading-relaxed text-slate-600">{item.detailDescription}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ứng dụng phổ biến</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.popularApplications.slice(0, 5).map((application) => (
                <span key={application} className="rounded-md border border-[#DDE7F3] bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  {application}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0050A4]" />
              Tra mã theo nhu cầu thực tế của cụm máy.
            </p>
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0050A4]" />
              Ưu tiên thao tác nhanh cho bảo trì, kỹ thuật và mua hàng.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Button asChild className="h-9 bg-[#0050A4] text-white hover:bg-[#003d7d]">
              <Link href="/tra-ma-bao-gia">
                <Search className="mr-2 size-4" />
                Tra mã
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 border-[#DDE7F3] text-slate-900 hover:bg-[#EEF4FB]">
              <Link href="/san-pham">Xem nhóm</Link>
            </Button>
            <Button asChild className="h-9 bg-[#E30613] text-white hover:bg-[#c80511]">
              <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 size-4" />
                Gửi Zalo
              </a>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export default function ProductsPage() {
  const pageSchema = createWebPageSchema({
    title: "Sản phẩm SKF cho nhà máy công nghiệp",
    description: "Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành.",
    path: "/san-pham",
    type: "CollectionPage",
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm SKF", path: "/san-pham" },
  ]);

  return (
    <>
      <StructuredData data={[pageSchema, breadcrumbSchema]} />
      <div className="bg-white">
        <section className="section-block pb-6">
          <div className="page-shell">
            <SitePageHero
              badge="DANH MỤC SẢN PHẨM SKF"
              title="Sản phẩm SKF theo từng nhóm ứng dụng"
              highlightText="SKF"
              primaryCta={{
                label: "Xem nhóm sản phẩm",
                href: "#nhom-san-pham",
                icon: <ArrowRight className="mr-2 size-4" />,
                tone: "blue",
              }}
              secondaryCta={{
                label: "Liên hệ tư vấn",
                href: "/lien-he",
                icon: <MessageCircle className="mr-2 size-4" />,
                tone: "outline",
              }}
              imageSrc="/images/brands/hero-san-pham-skf.png"
              imageAlt="Sản phẩm SKF theo từng nhóm ứng dụng"
              imagePriority
              imageContainerClassName="min-h-[220px] lg:min-h-[300px]"
            />

            <div className="mt-4 rounded-lg border border-[#DDE7F3] bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050A4]">Nhóm sản phẩm chính</p>
              <div className="relative mt-3 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent" />
                <div className="group/marquee flex w-max gap-3 [animation:product-mini-marquee_26s_linear_infinite]">
                  {productMiniCardsLoop.map((item, index) => (
                    <Link
                      key={`${item.slug}-${index}`}
                      href={`#${item.slug}`}
                      className="group"
                    >
                      <div className="flex aspect-square w-[94px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#DDE7F3] bg-slate-50 transition hover:-translate-y-0.5 hover:border-[#0050A4]/40 hover:bg-[#EEF4FB] sm:w-[112px] lg:w-[128px]">
                        <div className="relative h-[62%] w-full overflow-hidden border-b border-[#DDE7F3] bg-white">
                          <Image
                            src={item.image}
                            alt={item.imageAlt}
                            fill
                            sizes="(max-width: 640px) 94px, (max-width: 1024px) 112px, 128px"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex h-[38%] items-center justify-center px-2 text-center">
                          <span className="text-[11px] font-semibold leading-tight text-slate-700 sm:text-xs">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="nhom-san-pham" className="section-block bg-slate-50">
          <div className="page-shell space-y-5">
            <SectionTitle
              eyebrow="6 nhóm chính"
              title="Chọn nhóm phù hợp rồi gửi yêu cầu ngay"
              description="Không dùng link thương hiệu cũ trên giao diện chính. Nếu cần, tất cả nhóm đều có thể đi thẳng vào tra mã SKF."
            />
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {productGroupCards.map((item) => (
                <ProductCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <style>{`
        @keyframes product-mini-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .group\\/marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}
