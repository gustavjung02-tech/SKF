import Image from "next/image";
import Link from "next/link";
import {
  recruitmentHero,
} from "@/data/recruitment-content";
import { createPageMetadata } from "@/lib/seo";
import { RecruitmentPageContent } from "@/components/recruitment/recruitment-page-content";
import { Button } from "@/components/ui/button";

export const metadata = createPageMetadata({
  title: "Tuyển dụng THL | Gia nhập đội ngũ B2B vật tư truyền động",
  description:
    "THL tuyển dụng các vị trí kinh doanh, kế toán, logistics, kho và giao nhận trong lĩnh vực vật tư truyền động công nghiệp. Xem vị trí đang tuyển và ứng tuyển trực tiếp.",
  path: "/tuyen-dung",
});

export default function RecruitmentPage() {
  return (
    <div className="section-block">
      <div className="page-shell space-y-10">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 px-6 py-8 text-slate-100 shadow-[0_24px_58px_-42px_rgba(15,23,42,0.95)] sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-blue-200/40 bg-blue-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100">
                Tuyển dụng THL
              </p>
              <h1 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.15rem]">
                {recruitmentHero.title}
              </h1>
              <p className="text-sm leading-7 text-slate-200 sm:text-base">{recruitmentHero.subTitle}</p>
              <p className="text-sm leading-7 text-slate-300">{recruitmentHero.description}</p>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button asChild className="h-10 bg-amber-300 px-4 text-slate-900 hover:bg-amber-200">
                  <Link href="#vi-tri-tuyen-dung">Xem vị trí đang tuyển</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 border-slate-300/70 bg-transparent px-4 text-white hover:bg-slate-50/10 hover:text-white"
                >
                  <Link href="#ung-tuyen">Ứng tuyển ngay</Link>
                </Button>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[560px]">
              <div className="overflow-hidden rounded-xl border border-slate-200/30 bg-white/5 shadow-[0_22px_44px_-30px_rgba(15,23,42,0.9)]">
                <Image
                  src={recruitmentHero.image}
                  alt={recruitmentHero.imageAlt}
                  width={1200}
                  height={800}
                  priority
                  className="h-auto max-h-[340px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <RecruitmentPageContent />
      </div>
    </div>
  );
}
