import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { RfqQuoteEditor } from "@/components/admin/rfq-quote-editor";
import { Button } from "@/components/ui/button";
import { getAdminCookieName, getVerifiedAdminSession } from "@/lib/admin/auth";
import { getAdminRfqDetail } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBaoGiaDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const session = await getVerifiedAdminSession(cookieStore.get(getAdminCookieName())?.value);
  if (!session) {
    redirect(`/admin/login?next=/admin/bao-gia/${encodeURIComponent(params.id)}`);
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