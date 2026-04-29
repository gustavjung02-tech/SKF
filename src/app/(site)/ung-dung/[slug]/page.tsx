import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle, ClipboardCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { industryApplications } from "@/data/industry-applications";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/schema";
import { StructuredData } from "@/components/shared/structured-data";
import { Button } from "@/components/ui/button";

const applicationBenefits = [
  "Khoanh nhóm vật tư theo cụm máy, tải, tốc độ và môi trường vận hành",
  "Đối chiếu mã theo ảnh tem, kích thước hoặc mẫu cũ đang lắp",
  "Ưu tiên NTN, Tsubaki và bổ sung Koyo/NOK/Soho theo đúng điều kiện ứng dụng",
];

export const dynamicParams = false;

export function generateStaticParams() {
  return industryApplications.map((app) => ({ slug: app.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const app = industryApplications.find((item) => item.slug === params.slug);
  if (!app) return {};

  return createPageMetadata({
    title: `Vật tư truyền động cho ${app.name}`,
    description: app.description,
    path: `/ung-dung/${params.slug}`,
  });
}

export default function IndustryApplicationDetail({ params }: { params: { slug: string } }) {
  const app = industryApplications.find((item) => item.slug === params.slug);
  if (!app) notFound();
  const path = `/ung-dung/${app.slug}`;
  const pageSchema = createWebPageSchema({
    title: `Vật tư truyền động cho ${app.name}`,
    description: app.description,
    path,
  });
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Ứng dụng", path: "/ung-dung" },
    { name: app.name, path },
  ]);

  return (
    <>
      <StructuredData data={[pageSchema, breadcrumbSchema]} />
      <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <Image
          src={app.image}
          alt=""
          fill
          priority
          aria-hidden
          sizes="100vw"
          className="object-cover opacity-42"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/45" />
        <div className="page-shell relative py-12 sm:py-16">
          <Link href="/ung-dung" className="inline-flex items-center text-sm font-semibold text-blue-100 hover:text-white">
            <ArrowLeft className="mr-1 size-4" />
            Tất cả ứng dụng
          </Link>

          <div className="mt-8 max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Ứng dụng theo ngành máy</p>
            <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">Vật tư truyền động cho {app.name}</h1>
            <p className="text-base leading-relaxed text-slate-100">{app.description}</p>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button asChild className="bg-blue-600 text-white hover:bg-blue-500">
                <Link href="/tra-ma-bao-gia">
                  <ClipboardCheck className="mr-2 size-4" />
                  Gửi yêu cầu kỹ thuật
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 size-4" />
                  Zalo kinh doanh
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="page-shell grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-heading text-xl font-bold text-slate-950">Nhóm vật tư thường dùng</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {app.commonParts.map((part) => (
                <span key={part} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                  {part}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h2 className="font-heading text-xl font-bold text-slate-950">Khi gửi đúng bối cảnh máy</h2>
            <ul className="mt-4 space-y-3">
              {applicationBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-700" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
