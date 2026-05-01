import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken, getAdminCookieName, getAdminCookieOptions, getAdminLoginRedirect, isConfiguredAdminSecret } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

function buildLoginRedirect(request: NextRequest, nextPath: string | null | undefined, error?: string) {
  const redirectUrl = new URL("/admin/login", request.url);
  if (nextPath) {
    redirectUrl.searchParams.set("next", nextPath);
  }
  if (error) {
    redirectUrl.searchParams.set("error", error);
  }
  return redirectUrl;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let password = "";
  let nextPath = "/admin/bao-gia";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { password?: string; next?: string };
    password = `${body.password ?? ""}`;
    nextPath = getAdminLoginRedirect(body.next);
  } else {
    const formData = await request.formData();
    password = `${formData.get("password") ?? ""}`;
    nextPath = getAdminLoginRedirect(`${formData.get("next") ?? ""}`);
  }

  if (!isConfiguredAdminSecret(password.trim())) {
    return NextResponse.redirect(buildLoginRedirect(request, nextPath, "Mật khẩu admin không đúng."), { status: 303 });
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  response.cookies.set(getAdminCookieName(), await createAdminSessionToken(), getAdminCookieOptions());
  return response;
}