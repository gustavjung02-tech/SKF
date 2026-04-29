"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, ChevronDown, MapPin } from "lucide-react";
import { recruitmentJobs, type RecruitmentGroup } from "@/data/recruitment-content";
import { Button } from "@/components/ui/button";

const tabItems: Array<{ label: string; value: RecruitmentGroup | "Tất cả" }> = [
  { label: "Tất cả", value: "Tất cả" },
  { label: "Kinh doanh", value: "Kinh doanh" },
  { label: "Văn phòng", value: "Văn phòng" },
  { label: "Vận hành", value: "Vận hành" },
];

type RecruitmentJobsPanelProps = {
  onApply: (jobTitle: string) => void;
};

export function RecruitmentJobsPanel({ onApply }: RecruitmentJobsPanelProps) {
  const [activeTab, setActiveTab] = useState<RecruitmentGroup | "Tất cả">("Tất cả");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    if (activeTab === "Tất cả") {
      return recruitmentJobs;
    }

    return recruitmentJobs.filter((job) => job.category === activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!expandedJobId) return;

    const isExpandedJobStillVisible = filteredJobs.some((job) => job.id === expandedJobId);
    if (!isExpandedJobStillVisible) {
      setExpandedJobId(null);
    }
  }, [expandedJobId, filteredJobs]);

  function toggleJobDetail(jobId: string) {
    setExpandedJobId((current) => (current === jobId ? null : jobId));
  }

  return (
    <section id="vi-tri-tuyen-dung" className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabItems.map((tab) => {
          const isActive = tab.value === activeTab;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-blue-800 bg-blue-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredJobs.map((job) => {
          const isExpanded = expandedJobId === job.id;

          return (
            <article
              key={job.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.5)]"
            >
              <div className="relative aspect-video border-b border-slate-100 bg-slate-100">
                <Image
                  src={job.image}
                  alt={job.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-3 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-slate-500">
                  {job.category}
                </p>
                <h3 className="font-heading text-xl font-semibold text-slate-900">{job.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{job.summary}</p>

                <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <p className="inline-flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-blue-800" />
                    <span>{job.income}</span>
                  </p>
                  <p className="inline-flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-blue-800" />
                    <span>{job.locations}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => toggleJobDetail(job.id)}
                    className="border-blue-200 text-blue-800 hover:bg-blue-50"
                  >
                    {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                    <ChevronDown
                      className={`ml-1 size-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-800 text-white hover:bg-blue-900"
                    onClick={() => onApply(job.title)}
                  >
                    Ứng tuyển
                    <ArrowRight className="ml-1 size-3.5" />
                  </Button>
                </div>

                {isExpanded ? (
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">Mô tả công việc</h4>
                      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
                        {job.description.map((item) => (
                          <li key={`${job.id}-desc-${item}`}>- {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900">Yêu cầu</h4>
                      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
                        {job.requirements.map((item) => (
                          <li key={`${job.id}-req-${item}`}>- {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900">Quyền lợi</h4>
                      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
                        {job.benefits.map((item) => (
                          <li key={`${job.id}-ben-${item}`}>- {item}</li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      className="bg-blue-800 text-white hover:bg-blue-900"
                      onClick={() => onApply(job.title)}
                    >
                      Ứng tuyển vị trí này
                    </Button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
