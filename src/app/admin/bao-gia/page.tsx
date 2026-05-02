import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCookieName, getVerifiedAdminSession } from "@/lib/admin/auth";
import { ADMIN_RFQ_STATUSES, getAdminStatusLabel, type AdminRfqListItem } from "@/lib/admin/quote";
import { listAdminRfqs } from "@/lib/admin/sheet-webhook";
import { getAdminQuoteSourceLabel, getAdminQuoteStatusLabel } from "@/lib/admin/proactive-quote";
import { listProactiveQuotes } from "@/lib/admin/proactive-quote-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badgeVariantForStatus(status: string) {
  switch (status) {
    case "sent":
      return "default" as const;
    case "quoted":
      return "secondary" as const;
    case "closed":
      return "outline" as const;
    default:
      return "ghost" as const;
  }
}

function filterRfqs(items: AdminRfqListItem[], query: string, status: string) {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesStatus = !status || status === "all" ? true : item.status === status;
    const matchesQuery = !normalizedQuery || item.id.toLowerCase().includes(normalizedQuery) || item.customerName.toLowerCase().includes(normalizedQuery) || item.customerPhone.toLowerCase().includes(normalizedQuery) || item.customerZalo.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  });
}

export default async function AdminBaoGiaPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  const cookieStore = cookies();
  const session = await getVerifiedAdminSession(cookieStore.get(getAdminCookieName())?.value);
  if (!session) {
    redirect("/admin/login?next=/admin/bao-gia");
  }

  const query = searchParams?.q ?? "";
  const status = searchParams?.status ?? "all";
  let rfqs: AdminRfqListItem[] = [];
  let proactiveQuotes = await listProactiveQuotes();
  let loadError = "";

  try {
    rfqs = await listAdminRfqs();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Không đọc được danh sách RFQ từ hệ thống.";
  }

  const visibleRfqs = filterRfqs(rfqs, query, status);

  return (
    <AdminShell
      section="bao-gia"
      sessionEmail={session.email}
      title="Admin báo giá SKF"
      description="Đọc RFQ đã lưu, mở chi tiết và xử lý báo giá vận hành mà không public bảng giá cho khách."
      actions={
        <div className="flex items-center gap-2">
          <Button asChild type="button" className="bg-blue-800 text-white hover:bg-blue-900">
            <Link href="/admin/bao-gia/tao-moi">Tạo báo giá chủ động</Link>
          </Button>
          <form action="/api/admin/auth/logout" method="post">
            <Button type="submit" variant="outline">
              Đăng xuất
            </Button>
          </form>
        </div>
      }
    >
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div>
              <CardTitle>Bộ lọc RFQ</CardTitle>
              <CardDescription>Tìm nhanh theo mã RFQ, tên khách hoặc trạng thái xử lý.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]" action="/admin/bao-gia" method="get">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Tìm RFQ, tên khách, SĐT/Zalo"
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400"
              />
              <select name="status" defaultValue={status} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400">
                <option value="all">Tất cả trạng thái</option>
                {ADMIN_RFQ_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {getAdminStatusLabel(option)}
                  </option>
                ))}
              </select>
              <Button type="submit" className="bg-blue-800 text-white hover:bg-blue-900">
                Lọc danh sách
              </Button>
            </form>
          </CardContent>
        </Card>

        {loadError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Tổng RFQ</p><p className="mt-1 text-3xl font-bold text-slate-950">{rfqs.length}</p></CardContent></Card>
          <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Đang hiển thị</p><p className="mt-1 text-3xl font-bold text-slate-950">{visibleRfqs.length}</p></CardContent></Card>
          <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Cần xử lý mới</p><p className="mt-1 text-3xl font-bold text-slate-950">{rfqs.filter((item) => item.status === "new").length}</p></CardContent></Card>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mã RFQ</th>
                  <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 font-semibold">Tên khách</th>
                  <th className="px-4 py-3 font-semibold">SĐT/Zalo</th>
                  <th className="px-4 py-3 font-semibold">Số dòng mã</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {visibleRfqs.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.id}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3 text-slate-900">{item.customerName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.customerZalo || item.customerPhone || "Chưa có"}</td>
                    <td className="px-4 py-3 text-slate-600">{item.itemCount}</td>
                    <td className="px-4 py-3"><Badge variant={badgeVariantForStatus(item.status)}>{getAdminStatusLabel(item.status)}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild type="button" variant="outline">
                        <Link href={`/admin/bao-gia/${encodeURIComponent(item.id)}`}>Mở chi tiết</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleRfqs.length === 0 ? <div className="border-t border-slate-200 px-4 py-6 text-sm text-slate-600">Chưa có RFQ nào phù hợp với bộ lọc hiện tại.</div> : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-heading text-lg font-bold text-slate-950">Báo giá chủ động gần đây</h2>
            <p className="mt-1 text-sm text-slate-600">Danh sách quote do sales/admin tự tạo, không phụ thuộc RFQ.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mã quote</th>
                  <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 font-semibold">Khách</th>
                  <th className="px-4 py-3 font-semibold">Nguồn</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Tổng cộng</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {proactiveQuotes.slice(0, 20).map((quote) => (
                  <tr key={quote.quote_id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-semibold text-slate-900">{quote.quote_id}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(quote.created_at).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3 text-slate-900">{quote.customer.name || "Khách lẻ"}</td>
                    <td className="px-4 py-3 text-slate-600">{getAdminQuoteSourceLabel(quote.source_type)}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{getAdminQuoteStatusLabel(quote.status)}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(quote.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild type="button" variant="outline">
                        <Link href={`/admin/bao-gia/${encodeURIComponent(quote.quote_id)}`}>Mở chi tiết</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {proactiveQuotes.length === 0 ? <div className="border-t border-slate-200 px-4 py-6 text-sm text-slate-600">Chưa có báo giá chủ động nào.</div> : null}
        </div>
    </AdminShell>
  );
}