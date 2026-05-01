import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin/auth";

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/auth/login";
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(getAdminCookieName())?.value;
  const isValidSession = await verifyAdminSessionToken(cookieValue);
  if (isValidSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};