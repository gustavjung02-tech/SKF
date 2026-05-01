import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminCookieName,
  getAdminLoginRedirect,
  getAdminOtpCookieName,
  getDefaultAdminLoginEmail,
  verifyAdminOtpStateToken,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; message?: string; next?: string; step?: string; email?: string };
}) {
  const cookieStore = cookies();
  const nextPath = getAdminLoginRedirect(searchParams?.next);
  const otpState = await verifyAdminOtpStateToken(cookieStore.get(getAdminOtpCookieName())?.value);
  const step = otpState ? "otp" : searchParams?.step === "otp" ? "otp" : "password";
  const initialEmail = `${searchParams?.email ?? getDefaultAdminLoginEmail()}`.trim().toLowerCase();
  const isAuthenticated = await verifyAdminSessionToken(cookieStore.get(getAdminCookieName())?.value);

  if (isAuthenticated) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <Card className="w-full border-slate-200 bg-white/95 shadow-[0_28px_70px_-38px_rgba(15,23,42,0.4)]">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-800 text-white">
                <LockKeyhole className="size-5" />
              </div>
              <Image
                src="/images/logo-skf-cong-nghiep-header.png"
                alt="SKF Công Nghiệp"
                width={156}
                height={28}
                className="h-auto w-[156px]"
                priority
              />
            </div>
            <div>
              <CardTitle>Đăng nhập admin báo giá SKF</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {step === "otp" ? (
              <form action="/api/admin/auth/login" method="post" className="space-y-4">
                <input type="hidden" name="action" value="verify_otp" />
                <input type="hidden" name="next" value={nextPath} />
                <input type="hidden" name="email" value={initialEmail} />

                <div className="space-y-1.5">
                  <Label htmlFor="admin-email">Email admin</Label>
                  <Input id="admin-email" name="email_display" type="email" value={initialEmail} readOnly disabled />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-otp">Mã OTP (gửi qua email)</Label>
                  <Input id="admin-otp" name="code" type="text" inputMode="numeric" pattern="[0-9]{6}" placeholder="Nhập 6 số OTP" required />
                </div>

                {searchParams?.error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p> : null}
                {searchParams?.message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{searchParams.message}</p> : null}

                <Button type="submit" className="h-10 w-full bg-blue-800 text-white hover:bg-blue-900">
                  Xác thực OTP và đăng nhập
                </Button>
              </form>
            ) : (
              <form action="/api/admin/auth/login" method="post" className="space-y-4">
                <input type="hidden" name="action" value="request_otp" />
                <input type="hidden" name="next" value={nextPath} />

                <div className="space-y-1.5">
                  <Label htmlFor="admin-email">Email admin</Label>
                  <Input id="admin-email" name="email" type="email" autoComplete="username" placeholder="you@company.com" defaultValue={initialEmail} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-password">Mật khẩu admin</Label>
                  <Input id="admin-password" name="password" type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" required />
                </div>

                {searchParams?.error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p> : null}
                {searchParams?.message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{searchParams.message}</p> : null}

                <Button type="submit" className="h-10 w-full bg-blue-800 text-white hover:bg-blue-900">
                  Gửi mã OTP qua email
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}