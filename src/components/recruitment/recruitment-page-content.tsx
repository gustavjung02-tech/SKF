"use client";

import Image from "next/image";
import { useState } from "react";
import { MessageCircle, PhoneCall } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  recruitmentApplyGuide,
  recruitmentEnvironment,
  recruitmentJobs,
} from "@/data/recruitment-content";
import { RecruitmentForm } from "@/components/forms/recruitment-form";
import { RecruitmentJobsPanel } from "@/components/recruitment/recruitment-jobs-panel";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";

export function RecruitmentPageContent() {
  const [selectedJob, setSelectedJob] = useState("");

  function handleApply(jobTitle: string) {
    setSelectedJob(jobTitle);

    window.setTimeout(() => {
      const formElement = document.getElementById("ung-tuyen");
      formElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <>
      <section className="space-y-6">
        <SectionTitle
          eyebrow="Vị trí tuyển dụng"
          title="Các vị trí đang tuyển tại THL"
          description={`Chọn theo nhóm để xem nhanh công việc phù hợp. Hiện có ${recruitmentJobs.length} vị trí đang tuyển.`}
        />
        <RecruitmentJobsPanel onApply={handleApply} />
      </section>

      <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.5)] sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-4">
          <SectionTitle
            eyebrow="Môi trường làm việc"
            title={recruitmentEnvironment.title}
            description={recruitmentEnvironment.content[0]}
          />
          <p className="text-sm leading-relaxed text-slate-700">{recruitmentEnvironment.content[1]}</p>
          <p className="text-sm leading-relaxed text-slate-700">{recruitmentEnvironment.content[2]}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
          <Image
            src={recruitmentEnvironment.image}
            alt={recruitmentEnvironment.imageAlt}
            width={1200}
            height={900}
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <SectionTitle
            eyebrow="Thông tin ứng tuyển"
            title={recruitmentApplyGuide.title}
            description={recruitmentApplyGuide.intro}
          />
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
            {recruitmentApplyGuide.checklist.map((item) => (
              <li key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-700">{recruitmentApplyGuide.outro}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-50">
              <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 size-4" />
                Liên hệ bộ phận tuyển dụng
              </a>
            </Button>
            <Button asChild variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-100">
              <a href={siteConfig.phoneHref}>
                <PhoneCall className="mr-2 size-4" />
                Gọi tuyển dụng
              </a>
            </Button>
          </div>
        </div>

        <RecruitmentForm selectedJob={selectedJob} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.5)] sm:p-6">
        <h2 className="font-heading text-2xl font-semibold text-slate-900">
          Cùng THL phát triển sự nghiệp trong ngành vật tư công nghiệp
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Gia nhập đội ngũ làm việc với khách hàng nhà máy, bảo trì, kỹ thuật và mua hàng B2B.
          THL tìm kiếm những người nghiêm túc, chịu học, có trách nhiệm và muốn gắn bó lâu dài.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Button asChild variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-50">
            <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
              Trao đổi với bộ phận tuyển dụng
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
