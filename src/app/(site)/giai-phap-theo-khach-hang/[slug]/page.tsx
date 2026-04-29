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
      "Máy dừng đột xuất, cần đối chiếu vật tư trong ngày",
      "Mã cũ mờ hoặc thiếu dữ liệu, chỉ có ảnh tem, mẫu cũ hoặc kích thước",
      "Cần phương án tương đương khi hàng gốc hết hoặc thời gian giao kéo dài",
      "Ưu tiên NTN cho vòng bi, Tsubaki cho truyền động; dùng Koyo, NOK theo yêu cầu ứng dụng thực tế",
    ],
    products: ["NTN", "Tsubaki", "Koyo", "NOK"],
  },
  "ky-thuat": {
    situations: [
      "Cần xác nhận mã theo tải, tốc độ, nhiệt và môi trường vận hành",
      "So sánh phương án giữa NTN, Tsubaki, Koyo, NOK, Soho theo cùng vị trí lắp",
      "Kiểm tra tương thích khi thay đổi quy cách theo bản vẽ hoặc tiêu chuẩn mới",
      "Cần dữ liệu để lập phương án bảo trì định kỳ",
    ],
    products: ["NTN", "Tsubaki", "Koyo", "NOK", "Soho"],
  },
  "mua-hang": {
    situations: [
      "Nhận đề nghị mua từ bảo trì hoặc kỹ thuật nhưng thông tin mã chưa rõ",
      "Cần tách thông tin kỹ thuật, thương hiệu, số lượng và tiến độ đặt hàng",
      "Cần xác nhận nhóm hàng trước khi xử lý báo giá",
      "Cần phản hồi rành mạch để hoàn tất đề nghị mua đúng hạn",
    ],
    products: ["NTN", "Tsubaki", "Koyo", "NOK", "Soho"],
  },
  "chu-xuong": {
    situations: [
      "Máy chạy liên tục theo ca, vật tư chịu tải nặng và mòn nhanh",
      "Hàng cũ hết hoặc đổi quy cách, cần tìm phương án thay thế tương đương",
      "Cần nguồn vật tư ổn định cho vòng bi, gối đỡ, xích, phớt và dây truyền động",
      "Muốn duy trì một đầu mối B2B rõ ràng cho bảo trì định kỳ",
    ],
    products: ["NTN", "Tsubaki", "Koyo", "NOK", "Soho"],
  },
};

export function generateStaticParams() {
  return Object.keys(roleSlugMap).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const roleName = roleSlugMap[params.slug];
  if (!roleName) return {};

  return createPageMetadata({
    title: `Giải pháp cho ${roleName}`,
    description: `Giải pháp vật tư truyền động dành cho ${roleName}, theo danh mục NTN, Tsubaki, Koyo và các nhóm triển khai theo ứng dụng của THL.`,
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
        <Link href="/giai-phap-theo-khach-hang" className="inline-flex items-center text-sm text-blue-800 hover:text-blue-900">
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
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-800" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-6">
            <h3 className="text-sm font-semibold text-blue-900">THL hỗ trợ</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{role.support}</p>
          </div>

          {details ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900">Nhóm vật tư thường dùng</h3>
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

        <PrimaryCtaGroup />
      </div>
    </div>
  );
}
