import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PERMISSION_DEFINITIONS,
  ADMIN_ROLE_DEFINITIONS,
  getAdminCookieName,
  getFixedSuperAdminEmail,
  getVerifiedAdminSession,
  type AdminAccountStatus,
  type AdminPermission,
  type AdminRole,
} from "@/lib/admin/auth";

const allowedRoles = new Set<Exclude<AdminRole, "owner">>(["manager", "admin", "staff"]);
const allowedPermissions = new Set<AdminPermission>(ADMIN_PERMISSION_DEFINITIONS.map((item) => item.value));

export type ManagedAccountFormInput = {
  displayName: string;
  email: string;
  role: Exclude<AdminRole, "owner">;
  permissions: AdminPermission[];
  status: AdminAccountStatus;
  password?: string;
};

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizeRole(value: FormDataEntryValue | null): Exclude<AdminRole, "owner"> {
  const role = String(value || "staff").trim().toLowerCase();
  return allowedRoles.has(role as Exclude<AdminRole, "owner">) ? (role as Exclude<AdminRole, "owner">) : "staff";
}

function normalizeStatus(value: FormDataEntryValue | null): AdminAccountStatus {
  return String(value || "active").trim().toLowerCase() === "disabled" ? "disabled" : "active";
}

export async function requireAdminUserCapability(request: NextRequest, capability: "create" | "manage") {
  const token = request.cookies.get(getAdminCookieName())?.value;
  const session = await getVerifiedAdminSession(token);

  if (!session) {
    return { ok: false as const, response: NextResponse.redirect(new URL("/admin/login?next=/admin/phan-quyen", request.url), { status: 303 }) };
  }

  const isOwner = session.email === getFixedSuperAdminEmail();
  const canCreate = isOwner || session.permissions.includes("users:create") || session.permissions.includes("users:manage");
  const canManage = isOwner || session.permissions.includes("users:manage");

  if ((capability === "create" && !canCreate) || (capability === "manage" && !canManage)) {
    return {
      ok: false as const,
      response: redirectWithMessage(request, "error", "Bạn không có quyền quản lý tài khoản cấp dưới."),
    };
  }

  return { ok: true as const, session };
}

export function parseManagedAccountFormData(formData: FormData, options?: { requirePassword?: boolean }): ManagedAccountFormInput {
  const displayName = normalizeText(formData.get("displayName"));
  const email = normalizeEmail(formData.get("email"));
  const role = normalizeRole(formData.get("role"));
  const permissions = Array.from(
    new Set(
      formData
        .getAll("permissions")
        .map((item) => String(item || "").trim())
        .filter((item): item is AdminPermission => allowedPermissions.has(item as AdminPermission)),
    ),
  );
  const status = normalizeStatus(formData.get("status"));
  const password = normalizeText(formData.get("password"));

  if (!displayName) {
    throw new Error("Vui lòng nhập tên hiển thị cho nhân sự.");
  }

  if (!email) {
    throw new Error("Vui lòng nhập email đăng nhập.");
  }

  if (email === getFixedSuperAdminEmail()) {
    throw new Error("Email owner cố định không nằm trong danh sách nhân sự cấp dưới.");
  }

  if (permissions.length === 0) {
    throw new Error("Hãy chọn ít nhất một quyền cho tài khoản này.");
  }

  if (options?.requirePassword && !password) {
    throw new Error("Vui lòng tạo mật khẩu ban đầu cho tài khoản mới.");
  }

  return {
    displayName,
    email,
    role,
    permissions,
    status,
    password: password || undefined,
  };
}

export function redirectWithMessage(request: NextRequest, status: "success" | "error", message: string) {
  const url = new URL("/admin/phan-quyen", request.url);
  url.searchParams.set("status", status);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url, { status: 303 });
}

export const managedAdminRoleOptions = ADMIN_ROLE_DEFINITIONS.filter((item) => item.value !== "owner");
