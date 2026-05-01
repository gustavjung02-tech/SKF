import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminCookieName, getAdminLoginRedirect, verifyAdminSessionToken } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  const cookieStore = cookies();
  const nextPath = getAdminLoginRedirect(searchParams?.next);
  const isAuthenticated = await verifyAdminSessionToken(cookieStore.get(getAdminCookieName())?.value);

  if (isAuthenticated) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <Card className="w-full border-slate-200 bg-white/95 shadow-[0_28px_70px_-38px_rgba(15,23,42,0.4)]">
          <CardHeader className="space-y-3">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-800 text-white">
              <LockKeyhole className="size-5" />
            </div>
            <div>
              <CardTitle>Đăng nhập admin báo giá SKF</CardTitle>
              <CardDescription>Chỉ dùng cho đội xử lý báo giá nội bộ. Phiên đăng nhập lưu bằng cookie httpOnly.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form action="/api/admin/auth/login" method="post" className="space-y-4">
              <input type="hidden" name="next" value={nextPath} />
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">Mật khẩu admin</Label>
                <Input id="admin-password" name="password" type="password" autoComplete="current-password" placeholder="Nhập ADMIN_SECRET" required />
              </div>

              {searchParams?.error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p> : null}

              <Button type="submit" className="h-10 w-full bg-blue-800 text-white hover:bg-blue-900">
                Đăng nhập admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}