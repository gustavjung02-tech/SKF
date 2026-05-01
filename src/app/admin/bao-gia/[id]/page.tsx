import Link from "next/link";
import { notFound } from "next/navigation";
import { RfqQuoteEditor } from "@/components/admin/rfq-quote-editor";
import { Button } from "@/components/ui/button";
import { getAdminRfqDetail } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBaoGiaDetailPage({ params }: { params: { id: string } }) {
  const detail = await getAdminRfqDetail(params.id);
  if (!detail) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button asChild type="button" variant="outline">
            <Link href="/admin/bao-gia">Quay lại danh sách</Link>
          </Button>
        </div>
        <RfqQuoteEditor detail={detail} />
      </div>
    </div>
  );
}