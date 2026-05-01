import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin/auth";
import { type AdminRfqListItem } from "@/lib/admin/quote";
import { listAdminRfqs } from "@/lib/admin/sheet-webhook";

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
  const isAuthenticated = await verifyAdminSessionToken(cookieStore.get(getAdminCookieName())?.value);
  if (!isAuthenticated) {
    redirect("/admin/login?next=/admin/bao-gia");
  }

  const query = searchParams?.q ?? "";
  const status = searchParams?.status ?? "all";
  let rfqs: AdminRfqListItem[] = [];
  let loadError = "";

  try {
    rfqs = await listAdminRfqs();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Không đọc được danh sách RFQ từ hệ thống.";
  }

  const visibleRfqs = filterRfqs(rfqs, query, status);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Admin báo giá SKF</CardTitle>
              <CardDescription>Đọc RFQ đã lưu, mở chi tiết và xử lý báo giá nội bộ mà không public bảng giá cho khách.</CardDescription>
            </div>
            <form action="/api/admin/auth/logout" method="post">
              <Button type="submit" variant="outline">
                Đăng xuất
              </Button>
            </form>
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
                <option value="new">new</option>
                <option value="draft">draft</option>
                <option value="quoted">quoted</option>
                <option value="sent">sent</option>
                <option value="closed">closed</option>
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
                    <td className="px-4 py-3"><Badge variant={badgeVariantForStatus(item.status)}>{item.status}</Badge></td>
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
      </div>
    </div>
  );
}