import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getProductVisual } from "@/data/product-visuals";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { SectionTitle } from "@/components/shared/section-title";
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

const productGroupCards: ProductGroupCard[] = [
  {
    slug: "vong-bi-skf",
    name: "Vòng bi SKF",
    shortDescription: "Đối chiếu mã vòng bi theo tải, tốc độ và môi trường vận hành.",
    detailDescription: "Phù hợp cho motor, bơm, quạt, hộp số và các cụm quay cần độ ổn định cao.",
    image: getProductVisual("ntn").image,
    imageAlt: "Vòng bi SKF trong ứng dụng công nghiệp",
    popularApplications: ["Motor", "Bơm", "Quạt", "Hộp số", "Con lăn"],
  },
  {
    slug: "goi-do-skf",
    name: "Gối đỡ SKF",
    shortDescription: "Khoanh nhanh nhóm gối đỡ theo loại trục và không gian lắp.",
    detailDescription: "Tối ưu cho băng tải, trục truyền động và các cụm máy chạy liên tục theo ca.",
    image: getProductVisual("koyo").image,
    imageAlt: "Gối đỡ SKF cho cụm trục công nghiệp",
    popularApplications: ["Băng tải", "Trục truyền", "Quạt", "Máy đóng gói"],
  },
  {
    slug: "phot-skf",
    name: "Phớt SKF",
    shortDescription: "Tra mã phớt theo kích thước cốt, vỏ và điều kiện làm kín.",
    detailDescription: "Phù hợp cụm trục, hộp số, bơm và vị trí cần kiểm soát dầu, bụi, độ ẩm.",
    image: getProductVisual("nok").image,
    imageAlt: "Phớt SKF cho cụm làm kín",
    popularApplications: ["Hộp số", "Cụm trục", "Máy bơm", "Cụm thủy lực"],
  },
  {
    slug: "boi-tron-skf-lincoln",
    name: "Bôi trơn SKF/Lincoln",
    shortDescription: "Mỡ công nghiệp và hệ thống bôi trơn cho vận hành ổn định.",
    detailDescription: "Áp dụng cho dây chuyền tải liên tục, điểm bôi trơn khó tiếp cận và bảo trì theo chu kỳ.",
    image: "/images/backgrounds/he-sinh-thai-home.jpeg",
    imageAlt: "Mỡ và hệ thống bôi trơn SKF Lincoln",
    popularApplications: ["Băng tải", "Trục quay", "Cụm chịu tải", "Bảo trì định kỳ"],
  },
  {
    slug: "dung-cu-bao-tri-skf",
    name: "Dụng cụ bảo trì SKF",
    shortDescription: "Hỗ trợ tháo lắp, căn chỉnh và kiểm tra thiết bị quay.",
    detailDescription: "Giúp đội bảo trì giảm thời gian dừng máy và chuẩn hóa thao tác kỹ thuật tại hiện trường.",
    image: "/images/giai-phap-khach-hang-hero.png",
    imageAlt: "Dụng cụ bảo trì SKF cho nhà máy",
    popularApplications: ["Căn chỉnh", "Tháo lắp", "Kiểm tra", "Bảo trì nhanh"],
  },
  {
    slug: "truyen-dong-skf",
    name: "Truyền động SKF",
    shortDescription: "Nhóm truyền động cho hệ băng tải và cụm quay công nghiệp.",
    detailDescription: "Hỗ trợ khoanh nhóm theo vị trí máy, tải chạy và điều kiện vận hành thực tế.",
    image: getProductVisual("tsubaki").image,
    imageAlt: "Nhóm truyền động SKF cho dây chuyền",
    popularApplications: ["Băng tải", "Dây chuyền", "Cụm truyền", "Máy sản xuất"],
  },
];

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
        <section className="section-block border-b border-[#DDE7F3]">
          <div className="page-shell">
            <div className="overflow-hidden rounded-lg border border-[#DDE7F3] bg-white shadow-[0_16px_36px_-30px_rgba(15,23,42,0.28)]">
              <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
                <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                  <SectionTitle
                    eyebrow="Sản phẩm SKF"
                    title="Danh mục sản phẩm SKF cho nhà máy công nghiệp"
                    description="Cấu trúc gọn theo nhóm sản phẩm chính để tra nhanh, lọc nhanh và gửi yêu cầu nhanh."
                  />
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                    Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành. Toàn bộ CTA ưu tiên tra mã và xử lý qua
                    Zalo cho đội kỹ thuật.
                  </p>
                  <Button asChild className="w-fit bg-[#0050A4] hover:bg-[#003d7d]">
                    <Link href="/tra-ma-bao-gia">
                      <Search className="mr-2 size-4" />
                      Mở Tra mã SKF
                    </Link>
                  </Button>
                </div>

                <div className="relative min-h-72 bg-slate-100">
                  <Image
                    src="/images/backgrounds/he-sinh-thai-home.jpeg"
                    alt="Danh mục sản phẩm SKF cho nhà máy công nghiệp"
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/12 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/20 bg-slate-950/65 px-4 py-3 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">SKF B2B</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block bg-slate-50">
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
    </>
  );
}
