import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";

type SolutionGroup = {
  id: string;
  name: string;
  quickDescription: string;
  image: string;
  problem: string;
  support: string;
  products: string;
  clientNeedsToSend: string;
};

const solutionGroups: SolutionGroup[] = [
  {
    id: "nha-may-san-xuat",
    name: "Nhà máy sản xuất",
    quickDescription: "Cần sản phẩm SKF đúng mã để giảm dừng máy và giữ tiến độ sản xuất.",
    image: "/images/giai-phap-nha-may-san-xuat.png",
    problem:
      "Dây chuyền dừng vì vòng bi, phớt, gối đỡ, bôi trơn hoặc cụm truyền động hư hỏng làm ảnh hưởng trực tiếp đến tiến độ sản xuất.",
    support:
      "Tiếp nhận mã cũ, ảnh tem, vị trí lắp và điều kiện vận hành để khoanh nhanh nhóm sản phẩm SKF phù hợp.",
    products: "Vòng bi SKF, gối đỡ SKF, phớt SKF, bôi trơn SKF/Lincoln, truyền động SKF.",
    clientNeedsToSend: "Mã cũ, ảnh tem, ảnh vị trí lắp, số lượng, mức độ gấp.",
  },
  {
    id: "bo-phan-bao-tri",
    name: "Bộ phận bảo trì",
    quickDescription: "Cần đối chiếu nhanh mã cũ, ảnh tem, kích thước và tình trạng thực tế.",
    image: "/images/giai-phap-bao-tri.png",
    problem: "Mã cũ bị mờ, hàng tháo từ máy không còn bao bì hoặc cần thay nhanh để máy chạy lại.",
    support:
      "Đối chiếu theo ảnh thực tế, kích thước đo được, lịch sử thay thế và điều kiện làm việc.",
    products: "Vòng bi motor, vòng bi trục, gối đỡ, phớt, mỡ và dụng cụ bảo trì SKF.",
    clientNeedsToSend: "Ảnh sản phẩm tháo ra, ảnh tem, kích thước trong/ngoài/dày, vị trí lắp.",
  },
  {
    id: "bo-phan-ky-thuat",
    name: "Bộ phận kỹ thuật",
    quickDescription: "Cần kiểm tra thông số, tải, tốc độ và môi trường trước khi thay.",
    image: "/images/giai-phap-ky-thuat.png",
    problem:
      "Cụm máy chịu tải, nhiệt, bụi, dầu hoặc chạy liên tục cần chọn đúng thông số để tránh giảm tuổi thọ thiết bị.",
    support:
      "Kiểm tra thông tin tải, tốc độ, môi trường làm việc và nhóm sản phẩm trước khi đề xuất.",
    products: "Vòng bi chịu tải, gối đỡ, phớt, bôi trơn và truyền động SKF.",
    clientNeedsToSend:
      "Thông số máy, tốc độ quay, tải, môi trường làm việc, bản vẽ hoặc ảnh cụm máy.",
  },
  {
    id: "bo-phan-mua-hang",
    name: "Bộ phận mua hàng",
    quickDescription:
      "Cần báo giá rõ mã, nhóm sản phẩm, số lượng và phương án thay thế.",
    image: "/images/giai-phap-mua-hang.png",
    problem:
      "Cần thông tin rõ mã, số lượng, thời gian phản hồi và phương án thay thế nếu mã khó tìm.",
    support:
      "Tách thông tin kỹ thuật và thông tin thương mại để dễ xử lý đề nghị mua.",
    products: "Danh mục SKF theo mã, ứng dụng và điều kiện vận hành.",
    clientNeedsToSend: "File danh sách mã, số lượng, yêu cầu kỹ thuật, thời gian cần hàng.",
  },
  {
    id: "xuong-co-khi",
    name: "Xưởng cơ khí",
    quickDescription: "Cần vòng bi, phớt, gối đỡ và truyền động phù hợp cho máy chạy ca.",
    image: "/images/giai-phap-xuong-co-khi.png",
    problem:
      "Máy tiện, máy phay, CNC, máy chế tạo hoặc cụm trục cần vật tư đúng để vận hành ổn định.",
    support:
      "Đối chiếu sản phẩm SKF theo mã hoặc theo kích thước thực tế.",
    products: "Vòng bi SKF, gối đỡ SKF, phớt SKF, truyền động SKF.",
    clientNeedsToSend: "Mã cũ, kích thước đo được, ảnh cụm lắp, loại máy đang sử dụng.",
  },
  {
    id: "nha-thau-co-dien",
    name: "Nhà thầu cơ điện",
    quickDescription:
      "Cần phản hồi nhanh theo danh sách vật tư và tiến độ công trình.",
    image: "/images/giai-phap-nha-thau-co-dien.png",
    problem:
      "Cần xử lý danh sách vật tư theo tiến độ công trình, hạn chế sai mã và thiếu hàng khi lắp đặt.",
    support:
      "Kiểm tra danh sách mã, nhóm sản phẩm và hỗ trợ phản hồi theo từng hạng mục.",
    products: "Gối đỡ SKF, truyền động SKF, vòng bi SKF và dụng cụ bảo trì SKF.",
    clientNeedsToSend: "Danh sách vật tư, bản vẽ nếu có, số lượng, thời gian cần hàng.",
  },
  {
    id: "khach-thay-the-dinh-ky",
    name: "Khách thay thế định kỳ",
    quickDescription:
      "Cần gom mã vật tư theo chu kỳ bảo trì để chủ động đặt hàng.",
    image: "/images/giai-phap-thay-the-dinh-ky.png",
    problem:
      "Nhà máy cần gom vật tư theo chu kỳ bảo trì để giảm rủi ro dừng máy và chủ động kế hoạch mua hàng.",
    support:
      "Phân nhóm mã vật tư theo loại hàng, cụm máy và tần suất thay thế.",
    products: "Vòng bi SKF, phớt SKF, bôi trơn SKF/Lincoln và truyền động SKF.",
    clientNeedsToSend: "Danh sách mã, số lượng dùng mỗi kỳ, lịch bảo trì, nhóm máy hoặc dây chuyền.",
  },
];

const demandRows = [
  {
    demand: "Thay vòng bi gấp",
    requiredInfo: "Mã vòng bi, ảnh tem, kích thước, vị trí lắp",
    handling: "Đối chiếu theo mã SKF hoặc kích thước tương đương phù hợp",
  },
  {
    demand: "Thay gối đỡ",
    requiredInfo: "Kiểu thân gối, đường kính trục, ảnh vị trí lắp",
    handling: "Khoanh nhóm gối đỡ SKF theo kiểu lắp và điều kiện tải",
  },
  {
    demand: "Thay phớt",
    requiredInfo: "Kích thước trong/ngoài/dày, ảnh phớt, vị trí lắp",
    handling: "Gợi ý phớt SKF theo cụm trục, hộp số hoặc môi trường dầu",
  },
  {
    demand: "Chọn mỡ hoặc bôi trơn",
    requiredInfo: "Nhiệt độ, tải, tốc độ, môi trường bụi/ẩm",
    handling: "Khoanh nhóm mỡ và hệ thống bôi trơn SKF/Lincoln phù hợp",
  },
  {
    demand: "Mua vật tư định kỳ",
    requiredInfo: "Danh sách mã, số lượng, chu kỳ thay, nhóm máy",
    handling: "Gom nhóm sản phẩm SKF theo kế hoạch bảo trì",
  },
] as const;

export const metadata = createPageMetadata({
  title: "Giải pháp SKF theo từng bộ phận trong nhà máy",
  description:
    "Trang B2B giúp nhà máy, bảo trì, kỹ thuật và mua hàng đối chiếu nhanh sản phẩm SKF theo mã cũ, ảnh tem, kích thước và cụm máy thực tế.",
  path: "/giai-phap-theo-khach-hang",
});

export default function SolutionsPage() {
  return (
    <div className="section-block">
      <div className="page-shell space-y-12">
        <section className="relative overflow-hidden rounded-lg border border-[#DDE7F3] bg-[#0050A4] px-6 py-8 text-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.95)] sm:px-8 lg:px-10 lg:py-10">
          <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-50">
                Giải pháp SKF theo bộ phận
              </p>
              <h1 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.15rem]">
                Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành. Phù hợp cho bảo trì, kỹ thuật, mua hàng và các đơn vị vận hành công nghiệp.
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button asChild className="h-10 bg-white px-4 text-[#0050A4] hover:bg-blue-50">
                  <Link href="/tra-ma-bao-gia">
                    <ClipboardCheck className="mr-2 size-4" />
                    Tra mã SKF
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 border-white/60 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 size-4" />
                    Gửi Zalo
                  </a>
                </Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[560px] lg:max-w-[520px]">
              <div className="overflow-hidden rounded-lg border border-white/25 bg-white/5 shadow-[0_22px_44px_-30px_rgba(15,23,42,0.9)]">
                <Image
                  src="/images/giai-phap-khach-hang-hero.png"
                  alt="SKF Công Nghiệp hỗ trợ đối chiếu sản phẩm cho nhà máy"
                  width={1200}
                  height={800}
                  className="h-auto max-h-[340px] w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section id="nhom-giai-phap" className="space-y-6">
          <SectionTitle
            eyebrow="Phân nhóm nhanh"
            title="Anh thuộc nhóm nào?"
            description="Chọn đúng nhóm để xem quy trình xử lý phù hợp với vai trò đang phụ trách trong nhà máy."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutionGroups.map((group) => (
              <article
                key={group.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.52)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-26px_rgba(30,64,175,0.4)]"
              >
                <div className="relative aspect-video overflow-hidden border-b border-slate-100 bg-slate-100">
                  <Image
                    src={group.image}
                    alt={`Giải pháp SKF cho ${group.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="font-heading text-lg font-semibold text-slate-900">{group.name}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{group.quickDescription}</p>
                  <Button asChild size="sm" variant="outline" className="border-[#0050A4]/30 text-[#0050A4] hover:bg-[#EEF4FB]">
                    <Link href={`#chi-tiet-${group.id}`}>
                      Xem giải pháp
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle
            eyebrow="Giải pháp chi tiết"
            title="Xử lý theo đúng bối cảnh từng nhóm khách"
            description="Mỗi nhóm đều có luồng rõ: xác định vấn đề, đối chiếu dữ liệu, khoanh nhóm sản phẩm và nhận yêu cầu đầu vào."
          />
          <div className="space-y-5">
            {solutionGroups.map((group, index) => {
              const reverseLayout = index % 2 === 1;

              return (
                <article
                  id={`chi-tiet-${group.id}`}
                  key={`detail-${group.id}`}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.44)]"
                >
                  <div className="grid gap-0 lg:grid-cols-2">
                    <div
                      className={`relative aspect-[4/3] border-b border-slate-100 bg-slate-100 lg:aspect-auto lg:min-h-[320px] lg:border-b-0 ${reverseLayout ? "lg:order-2 lg:border-l lg:border-slate-100" : "lg:border-r lg:border-slate-100"}`}
                    >
                      <Image
                        src={group.image}
                        alt={`Minh họa giải pháp SKF cho ${group.name}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className={`space-y-3 p-5 sm:p-6 ${reverseLayout ? "lg:order-1" : ""}`}>
                      <h3 className="font-heading text-xl font-semibold text-slate-900">{group.name}</h3>

                      <div className="space-y-2 text-sm leading-relaxed text-slate-700">
                        <div>
                          <p className="font-semibold text-slate-900">Vấn đề thường gặp</p>
                          <p>{group.problem}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">SKF Công Nghiệp hỗ trợ</p>
                          <p>{group.support}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Sản phẩm liên quan</p>
                          <p>{group.products}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Khách nên gửi thông tin gì</p>
                          <p>{group.clientNeedsToSend}</p>
                        </div>
                      </div>

                      <Button asChild size="sm" className="bg-[#0050A4] text-white hover:bg-[#003d7d]">
                        <Link href={`/tra-ma-bao-gia?nhom=${encodeURIComponent(group.name)}`}>
                          Gửi yêu cầu cho nhóm này
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-[#DDE7F3] bg-white p-6 shadow-[0_10px_34px_-26px_rgba(15,23,42,0.42)] sm:p-8">
          <SectionTitle
            eyebrow="Đối chiếu nhu cầu"
            title="Giải pháp theo nhu cầu"
            description="Bảng tóm tắt để bộ phận vận hành, kỹ thuật và mua hàng gửi đúng dữ liệu ngay từ đầu."
          />
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-[760px] w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nhu cầu của khách</th>
                  <th className="px-4 py-3 font-semibold">Cần thông tin</th>
                  <th className="px-4 py-3 font-semibold">Hướng xử lý</th>
                </tr>
              </thead>
              <tbody>
                {demandRows.map((row, index) => (
                  <tr key={row.demand} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                    <td className="border-t border-slate-200 px-4 py-3 font-medium text-slate-900">
                      {row.demand}
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3">{row.requiredInfo}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{row.handling}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-[#0050A4]/25 bg-[#EEF4FB] p-6 sm:p-8">
          <h2 className="font-heading text-2xl font-semibold text-slate-900">
            Cần đối chiếu sản phẩm SKF cho nhà máy?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Anh/chị có thể gửi mã cũ, ảnh tem, kích thước hoặc danh sách vật tư. SKF Công Nghiệp sẽ hỗ trợ khoanh đúng nhóm hàng theo nhu cầu thực tế.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Button asChild className="h-10 bg-[#0050A4] px-4 text-white hover:bg-[#003d7d]">
              <Link href="/tra-ma-bao-gia">
                Tra mã SKF
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild className="h-10 bg-[#E30613] px-4 text-white hover:bg-[#c80511]">
              <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                Gửi Zalo
              </a>
            </Button>
            <Button asChild variant="outline" className="h-10 border-[#0050A4]/30 px-4 text-[#0050A4] hover:bg-white">
              <Link href="/lien-he">Liên hệ</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
