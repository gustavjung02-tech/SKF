import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/posts";
import { createPageMetadata } from "@/lib/seo";
import { SectionTitle } from "@/components/shared/section-title";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createPageMetadata({
  title: "Kiến thức vật tư truyền động",
  description:
    "Bài viết kỹ thuật về vòng bi, phớt, xích, dây curoa và lưu ý chọn vật tư truyền động cho bảo trì nhà máy.",
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
    <div className="section-block">
      <div className="page-shell space-y-8">
        <SectionTitle
          eyebrow="Kiến thức"
          title="Ghi chú kỹ thuật ngắn cho bảo trì nhà máy"
          description="Các bài viết tập trung vào cách nhận diện mã, chọn nhóm vật tư và giảm rủi ro đặt sai khi thay thế vòng bi, phớt, xích hoặc dây truyền động."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </div>
    </div>
  );
}
