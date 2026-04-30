import { ArrowRight, UserPlus } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { RecruitmentPageContent } from "@/components/recruitment/recruitment-page-content";
import { SitePageHero } from "@/components/shared/site-page-hero";

export const metadata = createPageMetadata({
  title: "Tuyển dụng SKF Công Nghiệp",
  description: "Đồng hành cùng đội ngũ kinh doanh và kỹ thuật công nghiệp trong môi trường làm việc rõ ràng, thực tế.",
  path: "/tuyen-dung",
});

export default function RecruitmentPage() {
  return (
    <div className="section-block bg-slate-50">
      <div className="page-shell space-y-10">
        <SitePageHero
          badge="TUYỂN DỤNG"
          title="Đồng hành cùng đội ngũ kinh doanh và kỹ thuật công nghiệp"
          highlightText="kinh doanh và kỹ thuật"
          description="Môi trường làm việc rõ ràng, thực tế và hướng đến phát triển lâu dài trong lĩnh vực vật tư công nghiệp."
          primaryCta={{
            label: "Xem vị trí tuyển",
            href: "#vi-tri-tuyen-dung",
            icon: <ArrowRight className="mr-2 size-4" />,
            tone: "blue",
          }}
          secondaryCta={{
            label: "Ứng tuyển nhanh",
            href: "#ung-tuyen",
            icon: <UserPlus className="mr-2 size-4" />,
            tone: "outline",
          }}
          imageSrc="/images/tuyen-dung/hero-tuyen-dung-skf.png"
          imageAlt="Đồng hành cùng đội ngũ kinh doanh và kỹ thuật công nghiệp"
          imagePriority
        />

        <div id="vi-tri-tuyen-dung">
          <RecruitmentPageContent />
        </div>
      </div>
    </div>
  );
}
