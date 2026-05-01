import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProactiveQuoteEditor } from "@/components/admin/proactive-quote-editor";
import { Button } from "@/components/ui/button";
import { getAdminCookieName, getVerifiedAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBaoGiaTaoMoiPage() {
  const cookieStore = cookies();
  const session = await getVerifiedAdminSession(cookieStore.get(getAdminCookieName())?.value);
  if (!session) {
    redirect("/admin/login?next=/admin/bao-gia/tao-moi");
  }

  return (
    <AdminShell
      section="bao-gia"
      sessionEmail={session.email}
      title="Tạo báo giá chủ động"
      description="Tạo quote mới cho khách gọi điện, Zalo ngoài web, khách cũ hoặc nhu cầu sales chủ động."
    >
      <div className="flex items-center justify-between gap-3">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/bao-gia">Quay lại danh sách</Link>
        </Button>
      </div>
      <ProactiveQuoteEditor />
    </AdminShell>
  );
}
