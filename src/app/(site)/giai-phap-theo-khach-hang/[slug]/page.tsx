import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { customerRoles } from "@/data/site-content";
import { createPageMetadata } from "@/lib/seo";
import { PrimaryCtaGroup } from "@/components/shared/primary-cta-group";
import { SectionTitle } from "@/components/shared/section-title";

const roleSlugMap: Record<string, string> = {
  "bao-tri": "Bảo trì nhà máy",
  "ky-thuat": "Kỹ thuật thiết bị",
  "mua-hang": "Mua hàng kỹ thuật",
  "chu-xuong": "Chủ xưởng / Cơ điện",
};

const roleDetails: Record<string, { situations: string[]; products: string[] }> = {
  "bao-tri": {
    situations: [
      "Máy dừng đột xuất, cần đối chiếu sản phẩm trong ngày",
      "Mã cũ mờ hoặc thiếu dữ liệu, chỉ có ảnh tem, mẫu cũ hoặc kích thước",
      "Cần phương án phù hợp khi mã cũ khó tìm hoặc thời gian giao kéo dài",
      "Ưu tiên khoanh đúng nhóm SKF theo vị trí lắp và điều kiện vận hành",
    ],
    products: ["Vòng bi SKF", "Gối đỡ SKF", "Phớt SKF", "Dụng cụ bảo trì SKF"],
  },
  "ky-thuat": {
    situations: [
      "Cần xác nhận mã theo tải, tốc độ, nhiệt và môi trường vận hành",
      "So sánh phương án theo cùng vị trí lắp và cùng điều kiện làm việc",
      "Kiểm tra tương thích khi thay đổi quy cách theo bản vẽ hoặc tiêu chuẩn mới",
      "Cần dữ liệu để lập phương án bảo trì định kỳ",
    ],
    products: ["Vòng bi SKF", "Gối đỡ SKF", "Bôi trơn SKF/Lincoln", "Truyền động SKF"],
  },
  "mua-hang": {
    situations: [
      "Nhận đề nghị mua từ bảo trì hoặc kỹ thuật nhưng thông tin mã chưa rõ",
      "Cần tách thông tin kỹ thuật, số lượng và tiến độ đặt hàng",
      "Cần xác nhận nhóm hàng trước khi xử lý báo giá",
      "Cần phản hồi rành mạch để hoàn tất đề nghị mua đúng hạn",
    ],
    products: ["Danh mục SKF theo mã", "Vòng bi SKF", "Phớt SKF", "Truyền động SKF"],
  },
  "chu-xuong": {
    situations: [
      "Máy chạy liên tục theo ca, vật tư chịu tải nặng và mòn nhanh",
      "Hàng cũ hết hoặc đổi quy cách, cần tìm phương án thay thế tương đương",
      "Cần nguồn hỗ trợ cho vòng bi, gối đỡ, phớt, bôi trơn và truyền động",
      "Muốn duy trì một đầu mối B2B rõ ràng cho bảo trì định kỳ",
    ],
    products: ["Vòng bi SKF", "Gối đỡ SKF", "Phớt SKF", "Bôi trơn SKF/Lincoln", "Truyền động SKF"],
  },
};

export function generateStaticParams() {
  return Object.keys(roleSlugMap).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const roleName = roleSlugMap[params.slug];
  if (!roleName) return {};

  return createPageMetadata({
    title: `Giải pháp SKF cho ${roleName}`,
    description: `Giải pháp sản phẩm SKF dành cho ${roleName}, theo mã, ứng dụng và điều kiện vận hành thực tế.`,
    path: `/giai-phap-theo-khach-hang/${params.slug}`,
  });
}

export default function CustomerSolutionDetail({ params }: { params: { slug: string } }) {
  const roleName = roleSlugMap[params.slug];
  if (!roleName) notFound();

  const role = customerRoles.find((r) => r.role === roleName);
  if (!role) notFound();

  const details = roleDetails[params.slug];

  return (
    <div className="section-block">
      <div className="page-shell max-w-3xl space-y-8">
        <Link href="/giai-phap-theo-khach-hang" className="inline-flex items-center text-sm text-[#0050A4] hover:text-[#003d7d]">
          <ArrowLeft className="mr-1 size-4" />
          Tất cả giải pháp
        </Link>

        <SectionTitle eyebrow="Giải pháp theo vai trò" title={role.role} description={role.problems} />

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">Tình huống thường gặp</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{role.problems}</p>
          </div>

          {details ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-sm font-semibold text-slate-900">Thông tin cần làm rõ</h3>
              <ul className="mt-3 space-y-2">
                {details.situations.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0050A4]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-lg border border-[#0050A4]/25 bg-[#EEF4FB] p-6">
            <h3 className="text-sm font-semibold text-[#0050A4]">SKF Công Nghiệp hỗ trợ</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{role.support}</p>
          </div>

          {details ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900">Nhóm sản phẩm thường dùng</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {details.products.map((p) => (
                  <span key={p} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <PrimaryCtaGroup submitLabel="Tra mã SKF" callLabel="Liên hệ" zaloLabel="Gửi Zalo" />
      </div>
    </div>
  );
}
