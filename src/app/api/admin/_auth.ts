import { NextRequest, NextResponse } from "next/server";
import {
  getAdminCookieName,
  getFixedSuperAdminEmail,
  getVerifiedAdminSession,
  type AdminPermission,
} from "@/lib/admin/auth";

export type AdminApiSession = {
  email: string;
  role: "owner" | "manager" | "staff" | "admin";
  permissions: AdminPermission[];
};

function isOwnerSession(session: AdminApiSession) {
  return session.email === getFixedSuperAdminEmail() || session.role === "owner";
}

export async function requireAdminApiPermission(request: NextRequest, permission: AdminPermission) {
  const token = request.cookies.get(getAdminCookieName())?.value;
  const session = await getVerifiedAdminSession(token);

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  const typedSession: AdminApiSession = {
    email: session.email,
    role: session.role,
    permissions: session.permissions,
  };

  if (!isOwnerSession(typedSession) && !typedSession.permissions.includes(permission)) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    session: typedSession,
  };
}
