import { NextRequest, NextResponse } from "next/server";
import {
  createAdminOtpStateToken,
  createAdminSessionToken,
  getAdminCookieName,
  getAdminCookieOptions,
  getAdminLoginRedirect,
  getAdminOtpCookieName,
  getAdminOtpCookieOptions,
  verifyAdminOtpStateToken,
} from "@/lib/admin/auth";
import { getAdminAccountByCredentialsFromStore } from "@/lib/admin/account-store";
import { buildMailBrandHeaderHtml, sendMail } from "@/lib/forms/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginAction = "request_otp" | "verify_otp";

type ParsedLoginInput = {
  action: LoginAction;
  email: string;
  password: string;
  code: string;
  nextPath: string;
  isJson: boolean;
};

function buildLoginRedirect(
  request: NextRequest,
  nextPath: string | null | undefined,
  options?: { error?: string; message?: string; step?: "password" | "otp"; email?: string },
) {
  const redirectUrl = new URL("/admin/login", request.url);
  if (nextPath) {
    redirectUrl.searchParams.set("next", nextPath);
  }
  if (options?.error) {
    redirectUrl.searchParams.set("error", options.error);
  }
  if (options?.message) {
    redirectUrl.searchParams.set("message", options.message);
  }
  if (options?.step) {
    redirectUrl.searchParams.set("step", options.step);
  }
  if (options?.email) {
    redirectUrl.searchParams.set("email", options.email);
  }
  return redirectUrl;
}

function createOtpCode() {
  const value = Math.floor(100000 + Math.random() * 900000);
  return String(value);
}

function parseAction(value: string | null | undefined): LoginAction {
  return value === "verify_otp" ? "verify_otp" : "request_otp";
}

async function parseInput(request: NextRequest): Promise<ParsedLoginInput> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      action?: string;
      email?: string;
      password?: string;
      code?: string;
      next?: string;
    };

    return {
      action: parseAction(body.action),
      email: String(body.email || "").trim().toLowerCase(),
      password: String(body.password || ""),
      code: String(body.code || "").trim(),
      nextPath: getAdminLoginRedirect(body.next),
      isJson: true,
    };
  }

  const formData = await request.formData();
  return {
    action: parseAction(String(formData.get("action") || "request_otp")),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
    code: String(formData.get("code") || "").trim(),
    nextPath: getAdminLoginRedirect(String(formData.get("next") || "")),
    isJson: false,
  };
}

function formatOtpHtml(payload: { email: string; code: string }) {
  return `
    ${buildMailBrandHeaderHtml()}
    <h2>Mã xác thực đăng nhập Admin SKF</h2>
    <p>Tài khoản: <strong>${payload.email}</strong></p>
    <p>Mã OTP của bạn (hiệu lực 5 phút):</p>
    <p style="font-size:28px;letter-spacing:4px;font-weight:700;margin:10px 0;">${payload.code}</p>
    <p>Nếu bạn không thực hiện thao tác này, vui lòng bỏ qua email.</p>
  `;
}

function formatOtpText(payload: { email: string; code: string }) {
  return [
    "Ma xac thuc dang nhap Admin SKF",
    `Tai khoan: ${payload.email}`,
    `Ma OTP (hieu luc 5 phut): ${payload.code}`,
    "Neu ban khong thuc hien thao tac nay, vui long bo qua email.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const input = await parseInput(request);

  if (input.action === "verify_otp") {
    const stateToken = request.cookies.get(getAdminOtpCookieName())?.value;
    const state = await verifyAdminOtpStateToken(stateToken);

    if (!state) {
      if (input.isJson) {
        return NextResponse.json({ ok: false, error: "Phiên xác thực đã hết hạn, vui lòng đăng nhập lại." }, { status: 401 });
      }
      return NextResponse.redirect(
        buildLoginRedirect(request, input.nextPath, {
          error: "Phiên xác thực đã hết hạn, vui lòng đăng nhập lại.",
          step: "password",
          email: input.email,
        }),
        { status: 303 },
      );
    }

    if (!input.code || input.code !== state.code) {
      if (input.isJson) {
        return NextResponse.json({ ok: false, error: "Mã OTP không đúng." }, { status: 401 });
      }
      return NextResponse.redirect(
        buildLoginRedirect(request, input.nextPath, {
          error: "Mã OTP không đúng.",
          step: "otp",
          email: state.email,
        }),
        { status: 303 },
      );
    }

    const response = input.isJson
      ? NextResponse.json({ ok: true, next: input.nextPath })
      : NextResponse.redirect(new URL(input.nextPath, request.url), { status: 303 });

    response.cookies.set(
      getAdminCookieName(),
      await createAdminSessionToken({
        email: state.email,
        role: state.role,
        permissions: state.permissions,
      }),
      getAdminCookieOptions(),
    );
    response.cookies.delete(getAdminOtpCookieName());
    return response;
  }

  if (!input.email || !input.password) {
    if (input.isJson) {
      return NextResponse.json({ ok: false, error: "Vui lòng nhập email và mật khẩu admin." }, { status: 400 });
    }
    return NextResponse.redirect(
      buildLoginRedirect(request, input.nextPath, {
        error: "Vui lòng nhập email và mật khẩu admin.",
        step: "password",
        email: input.email,
      }),
      { status: 303 },
    );
  }

  const account = await getAdminAccountByCredentialsFromStore(input.email, input.password);
  if (!account) {
    if (input.isJson) {
      return NextResponse.json({ ok: false, error: "Email hoặc mật khẩu admin không đúng." }, { status: 401 });
    }
    return NextResponse.redirect(
      buildLoginRedirect(request, input.nextPath, {
        error: "Email hoặc mật khẩu admin không đúng.",
        step: "password",
        email: input.email,
      }),
      { status: 303 },
    );
  }

  const otpCode = createOtpCode();

  try {
    await sendMail({
      to: account.email,
      subject: "[SKF Công Nghiệp Admin] Mã OTP đăng nhập",
      html: formatOtpHtml({ email: account.email, code: otpCode }),
      text: formatOtpText({ email: account.email, code: otpCode }),
      fromKind: "security",
    });
  } catch (error) {
    console.error("[admin/auth/login] send OTP failed:", error);
    if (input.isJson) {
      return NextResponse.json({ ok: false, error: "Không gửi được OTP qua email. Vui lòng thử lại." }, { status: 500 });
    }

    return NextResponse.redirect(
      buildLoginRedirect(request, input.nextPath, {
        error: "Không gửi được OTP qua email. Vui lòng thử lại.",
        step: "password",
        email: input.email,
      }),
      { status: 303 },
    );
  }

  const response = input.isJson
    ? NextResponse.json({ ok: true, step: "otp", email: account.email })
    : NextResponse.redirect(
        buildLoginRedirect(request, input.nextPath, {
          message: "Mã OTP đã gửi về email admin.",
          step: "otp",
          email: account.email,
        }),
        { status: 303 },
      );

  response.cookies.set(
    getAdminOtpCookieName(),
    await createAdminOtpStateToken({
      email: account.email,
      role: account.role,
      permissions: account.permissions,
      code: otpCode,
    }),
    getAdminOtpCookieOptions(),
  );

  return response;
}
