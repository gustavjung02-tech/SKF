import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";
import { industryApplications } from "@/data/industry-applications";
import { createPageMetadata } from "@/lib/seo";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Ứng dụng theo ngành máy",
  description:
    "Khoanh vùng vật tư truyền động theo loại máy và điều kiện vận hành, ưu tiên NTN, Tsubaki cùng các nhóm triển khai phù hợp của THL.",
  path: "/ung-dung",
});

export default function IndustryApplicationsPage() {
  return (
    <div className="bg-white">
      <section className="section-block border-b border-slate-100">
        <div className="page-shell grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionTitle
            eyebrow="Ứng dụng theo ngành"
            title="Khoanh vùng vật tư theo loại máy và điều kiện vận hành"
            description="Mỗi cụm máy có tải, tốc độ, môi trường và tiêu chuẩn lắp khác nhau. THL dùng bối cảnh ứng dụng để chọn đúng NTN, Tsubaki, Koyo hoặc nhóm triển khai liên quan."
          />
          <Button asChild className="w-fit bg-blue-800 hover:bg-blue-900">
            <Link href="/tra-ma-bao-gia">
              <ClipboardCheck className="mr-2 size-4" />
              Gửi yêu cầu kỹ thuật
            </Link>
          </Button>
        </div>
      </section>

      <section className="section-block bg-slate-50">
        <div className="page-shell grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industryApplications.map((app) => (
            <Link key={app.slug} href={`/ung-dung/${app.slug}`} className="group">
              <Card className="h-full rounded-lg border-slate-200 bg-white py-0 transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.55)]">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={app.image}
                    alt={app.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/24 to-transparent" />
                  <h2 className="absolute bottom-4 left-4 right-4 font-heading text-lg font-bold text-white">{app.name}</h2>
                </div>
                <CardContent className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-slate-600">{app.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm vật tư thường dùng</p>
                    <div className="flex flex-wrap gap-2">
                      {app.commonParts.map((part) => (
                        <span key={part} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs text-blue-800">
                          <CheckCircle2 className="size-3" />
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="inline-flex items-center text-sm font-semibold text-blue-800 group-hover:text-blue-900">
                    Xem chi tiết ứng dụng
                    <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
