import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { blogPosts } from "@/data/posts";
import { createPageMetadata } from "@/lib/seo";
import { SitePageHero } from "@/components/shared/site-page-hero";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Kiến thức SKF cho nhà máy công nghiệp",
  description: "Nội dung thực tế giúp tra cứu và chọn sản phẩm SKF cho nhu cầu bảo trì, thay thế thiết bị.",
  path: "/kien-thuc",
});

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function KnowledgePage() {
  return (
    <div className="section-block bg-slate-50">
      <div className="page-shell space-y-8">
        <SitePageHero
          badge="KIẾN THỨC SKF"
          title="Kiến thức thực tế cho bảo trì và thay thế thiết bị"
          highlightText="bảo trì và thay thế thiết bị"
          description="Nội dung chuyên đề giúp người dùng tra cứu, chọn mã và hiểu rõ hơn về ứng dụng sản phẩm SKF trong nhà máy."
          primaryCta={{
            label: "Xem bài viết",
            href: "#danh-sach-bai-viet",
            icon: <ArrowRight className="mr-2 size-4" />,
            tone: "blue",
          }}
          secondaryCta={{
            label: "Liên hệ kỹ thuật",
            href: "/lien-he",
            icon: <MessageCircle className="mr-2 size-4" />,
            tone: "outline",
          }}
          imageSrc="/images/kien-thuc/hero-kien-thuc-skf.png"
          imageAlt="Kiến thức thực tế cho bảo trì và thay thế thiết bị"
          imagePriority
        />

        <section id="danh-sach-bai-viet" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="rounded-lg border-slate-200 bg-white">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">{post.category}</p>
                  <p className="text-xs text-slate-500">{post.readTime}</p>
                </div>
                <h2 className="text-base font-semibold leading-snug text-slate-900">{post.title}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <p className="text-xs text-slate-500">{formatDate(post.publishedAt)}</p>
                  <Link href="/tra-ma-bao-gia" className="inline-flex items-center text-sm font-semibold text-blue-800 hover:text-blue-900">
                    Gửi yêu cầu
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
