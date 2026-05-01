import { NextRequest, NextResponse } from "next/server";
import { buildMailBrandHeaderHtml, sendMail, type MailFromKind } from "@/lib/forms/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedFromKinds: MailFromKind[] = ["default", "support", "sales", "recruitment", "security"];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: NextRequest) {
  let body: {
    to?: string;
    subject?: string;
    message?: string;
    replyTo?: string;
    fromKind?: MailFromKind;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Payload mail không hợp lệ." }, { status: 400 });
  }

  const to = String(body.to || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const replyTo = String(body.replyTo || "").trim();
  const fromKind = allowedFromKinds.includes(body.fromKind || "default") ? (body.fromKind || "default") : "default";

  if (!to || !subject || !message) {
    return NextResponse.json({ ok: false, error: "Thiếu người nhận, tiêu đề hoặc nội dung mail." }, { status: 400 });
  }

  try {
    await sendMail({
      to,
      subject,
      text: message,
      html: `${buildMailBrandHeaderHtml()}<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;white-space:pre-wrap;">${escapeHtml(message)}</div>`,
      replyTo: replyTo || undefined,
      fromKind,
    });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Không gửi được mail thủ công.";
    return NextResponse.json({ ok: false, error: messageText }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Đã gửi mail thủ công thành công." });
}