import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listManagedAdminAccounts } from "@/lib/admin/account-store";
import {
  ADMIN_PERMISSION_DEFINITIONS,
  ADMIN_ROLE_DEFINITIONS,
  getAdminCookieName,
  getAdminPermissionLabel,
  getFixedSuperAdminEmail,
  getSuperAdminPermissions,
  getVerifiedAdminSession,
  type AdminPermission,
  type AdminRole,
} from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

type AdminPermissionsPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

const roleGuides: Record<Exclude<AdminRole, "owner">, { title: string; description: string; defaults: AdminPermission[] }> = {
  manager: {
    title: "Quản lý",
    description: "Phù hợp cho người điều phối RFQ, kiểm soát tiến độ và hỗ trợ nội bộ.",
    defaults: ["quotes:read", "quotes:write", "quotes:status", "quotes:send", "rfq:assign", "mail:send"],
  },
  admin: {
    title: "Admin vận hành",
    description: "Phù hợp cho người phụ trách xử lý báo giá, gửi mail và phối hợp tác vụ hằng ngày.",
    defaults: ["quotes:read", "quotes:write", "quotes:status", "quotes:send", "mail:send"],
  },
  staff: {
    title: "Nhân viên",
    description: "Phù hợp cho người xử lý RFQ cơ bản, không nên có quyền quản lý tài khoản.",
    defaults: ["quotes:read", "quotes:write", "quotes:status"],
  },
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chưa có dữ liệu";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function hasPermission(permissions: AdminPermission[], permission: AdminPermission) {
  return permissions.includes(permission);
}

export default async function AdminPermissionsPage({ searchParams }: AdminPermissionsPageProps) {
  const cookieStore = cookies();
  const session = await getVerifiedAdminSession(cookieStore.get(getAdminCookieName())?.value);
  if (!session) {
    redirect("/admin/login?next=/admin/phan-quyen");
  }
  if (session.email !== getFixedSuperAdminEmail()) {
    redirect("/admin");
  }

  const superAdminEmail = getFixedSuperAdminEmail();
  const superAdminPermissions = getSuperAdminPermissions();
  const managedAccounts = await listManagedAdminAccounts();
  const status = searchParams?.status === "success" || searchParams?.status === "error" ? searchParams.status : undefined;
  const message = typeof searchParams?.message === "string" ? searchParams.message : "";

  return (
    <AdminShell
      section="phan-quyen"
      sessionEmail={session.email}
      title="Phân quyền admin"
      description="Tài khoản owner cố định ở cấp cao nhất. Phần bên dưới dùng để tạo và quản lý nhân sự vận hành phía dưới."
    >
      {status && message ? (
        <div
          className={
            status === "success"
              ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {message}
        </div>
      ) : null}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Danh sách tài khoản cấp dưới hiện đang lưu bằng file local trong server Node. Khi chạy production serverless, cần chuyển sang DB/KV trước khi mở rộng vận hành nhiều tài khoản.
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Owner cố định</CardTitle>
            <CardDescription>Tài khoản này luôn đứng trên cùng và không nằm trong danh sách nhân sự cấp dưới.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-950">Gustav Jung</p>
                  <p className="text-sm text-slate-600">{superAdminEmail}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Owner</Badge>
                  <Badge className="bg-emerald-600 text-white">Đang hoạt động</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quyền hệ thống</p>
                <div className="flex flex-wrap gap-2">
                  {superAdminPermissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="rounded-full border-slate-300 bg-white px-2.5 py-1 text-slate-700">
                      {getAdminPermissionLabel(permission)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-medium">Nguyên tắc vận hành</p>
              <p className="mt-2">Mọi tài khoản bên dưới chỉ là nhân sự cấp dưới. Khi cần trao thêm quyền, chỉnh trực tiếp tại danh sách nhân sự bên dưới.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Thêm nhân sự mới</CardTitle>
            <CardDescription>Tạo tài khoản đăng nhập cho quản lý, admin vận hành hoặc nhân viên xử lý RFQ.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/admin/users/create" method="post" className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-displayName">Tên hiển thị</Label>
                  <Input id="create-displayName" name="displayName" placeholder="Ví dụ: Nguyễn Minh Anh" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email đăng nhập</Label>
                  <Input id="create-email" name="email" type="email" placeholder="nhanvien@skf-congnghiep.info" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-password">Mật khẩu ban đầu</Label>
                  <Input id="create-password" name="password" type="text" placeholder="Nhập mật khẩu khởi tạo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">Vai trò</Label>
                  <select
                    id="create-role"
                    name="role"
                    defaultValue="staff"
                    className="h-8 w-full rounded-lg border border-input bg-slate-50/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {ADMIN_ROLE_DEFINITIONS.filter((item) => item.value !== "owner").map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Quyền được cấp</p>
                  <p className="text-sm text-slate-600">Chọn đúng theo phạm vi công việc. Có thể cấp thêm hoặc bớt bất kỳ lúc nào.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {ADMIN_PERMISSION_DEFINITIONS.map((permission) => (
                    <label key={permission.value} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="permissions"
                        value={permission.value}
                        defaultChecked={roleGuides.staff.defaults.includes(permission.value)}
                        className="mt-0.5 size-4 rounded border-slate-300 text-blue-700"
                      />
                      <span>
                        <span className="block font-medium text-slate-900">{permission.label}</span>
                        <span className="block text-xs leading-5 text-slate-500">{permission.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Khuyến nghị: bắt đầu với quyền tối thiểu cần thiết, sau đó mở rộng dần theo công việc thực tế.</p>
                <Button type="submit" className="bg-blue-800 text-white hover:bg-blue-900">
                  Tạo tài khoản
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Nhân sự cấp dưới</CardTitle>
          <CardDescription>Cập nhật vai trò, quyền truy cập, trạng thái hoạt động hoặc đổi mật khẩu ngay tại đây.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {managedAccounts.length > 0 ? (
            managedAccounts.map((account) => (
              <div key={account.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-950">{account.displayName || account.email}</p>
                    <p className="text-sm text-slate-600">{account.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{ADMIN_ROLE_DEFINITIONS.find((item) => item.value === account.role)?.label ?? account.role}</Badge>
                    <Badge className={account.status === "active" ? "bg-emerald-600 text-white" : "bg-slate-500 text-white"}>
                      {account.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                  <div>Tạo lúc: {formatDateTime(account.createdAt)}</div>
                  <div>Cập nhật: {formatDateTime(account.updatedAt)}</div>
                  <div>Vai trò hiện tại: {ADMIN_ROLE_DEFINITIONS.find((item) => item.value === account.role)?.label ?? account.role}</div>
                  <div>{account.permissions.length} quyền đang bật</div>
                </div>

                <form action={`/api/admin/users/${account.id}/update`} method="post" className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2 xl:col-span-1">
                      <Label htmlFor={`displayName-${account.id}`}>Tên hiển thị</Label>
                      <Input id={`displayName-${account.id}`} name="displayName" defaultValue={account.displayName} required />
                    </div>
                    <div className="space-y-2 xl:col-span-1">
                      <Label htmlFor={`email-${account.id}`}>Email đăng nhập</Label>
                      <Input id={`email-${account.id}`} name="email" type="email" defaultValue={account.email} required />
                    </div>
                    <div className="space-y-2 xl:col-span-1">
                      <Label htmlFor={`role-${account.id}`}>Vai trò</Label>
                      <select
                        id={`role-${account.id}`}
                        name="role"
                        defaultValue={account.role}
                        className="h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {ADMIN_ROLE_DEFINITIONS.filter((item) => item.value !== "owner").map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 xl:col-span-1">
                      <Label htmlFor={`status-${account.id}`}>Trạng thái</Label>
                      <select
                        id={`status-${account.id}`}
                        name="status"
                        defaultValue={account.status}
                        className="h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="disabled">Tạm khóa</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`password-${account.id}`}>Đổi mật khẩu</Label>
                    <Input id={`password-${account.id}`} name="password" type="text" placeholder="Để trống nếu không đổi mật khẩu" />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-900">Danh sách quyền</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {ADMIN_PERMISSION_DEFINITIONS.map((permission) => (
                        <label key={`${account.id}-${permission.value}`} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            name="permissions"
                            value={permission.value}
                            defaultChecked={hasPermission(account.permissions, permission.value)}
                            className="mt-0.5 size-4 rounded border-slate-300 text-blue-700"
                          />
                          <span>
                            <span className="block font-medium text-slate-900">{permission.label}</span>
                            <span className="block text-xs leading-5 text-slate-500">{permission.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {account.permissions.map((permission) => (
                        <Badge key={`${account.id}-badge-${permission}`} variant="outline" className="rounded-full border-slate-300 bg-white text-slate-700">
                          {getAdminPermissionLabel(permission)}
                        </Badge>
                      ))}
                    </div>
                    <Button type="submit" className="bg-blue-800 text-white hover:bg-blue-900">
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>

                <form action={`/api/admin/users/${account.id}/delete`} method="post" className="mt-3 flex justify-end">
                  <Button type="submit" variant="destructive">
                    Xóa tài khoản
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              Chưa có nhân sự cấp dưới nào. Hãy tạo tài khoản đầu tiên ở khối bên trên.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {Object.entries(roleGuides).map(([role, guide]) => (
          <Card key={role} className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>{guide.title}</CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {guide.defaults.map((permission) => (
                <div key={`${role}-${permission}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {getAdminPermissionLabel(permission)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}