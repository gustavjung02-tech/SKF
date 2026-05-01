import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProactiveQuoteEditor } from "@/components/admin/proactive-quote-editor";
import { RfqQuoteEditor } from "@/components/admin/rfq-quote-editor";
import { Button } from "@/components/ui/button";
import { getAdminCookieName, getVerifiedAdminSession } from "@/lib/admin/auth";
import { getAdminRfqDetail } from "@/lib/admin/sheet-webhook";
import { getProactiveQuoteById } from "@/lib/admin/proactive-quote-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBaoGiaDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const session = await getVerifiedAdminSession(cookieStore.get(getAdminCookieName())?.value);
  if (!session) {
    redirect(`/admin/login?next=/admin/bao-gia/${encodeURIComponent(params.id)}`);
  }

  const proactiveQuote = await getProactiveQuoteById(params.id);
  if (proactiveQuote) {
    return (
      <AdminShell
        section="bao-gia"
        sessionEmail={session.email}
        title={`Chi tiết báo giá ${proactiveQuote.quote_id}`}
        description="Chỉnh sửa báo giá chủ động, copy nội dung gửi khách và mở bản in HTML."
      >
        <div className="flex items-center justify-between gap-3">
          <Button asChild type="button" variant="outline">
            <Link href="/admin/bao-gia">Quay lại danh sách</Link>
          </Button>
        </div>
        <ProactiveQuoteEditor initialQuote={proactiveQuote} />
      </AdminShell>
    );
  }

  const detail = await getAdminRfqDetail(params.id);
  if (!detail) {
    notFound();
  }

  return (
    <AdminShell
      section="bao-gia"
      sessionEmail={session.email}
      title={`Chi tiết RFQ ${detail.id}`}
      description="Soạn báo giá, lưu nháp và đồng bộ lại dữ liệu với Google Sheet webhook."
    >
      <div className="flex items-center justify-between gap-3">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/bao-gia">Quay lại danh sách</Link>
        </Button>
      </div>
      <RfqQuoteEditor detail={detail} />
    </AdminShell>
  );
}