import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { contactSubmitSchema } from "@/lib/forms/form-schemas";
import { buildMailBrandHeaderHtml, getInternalRecipient, sendMail } from "@/lib/forms/mailer";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatContactHtml(payload: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const safeFullName = escapeHtml(payload.fullName);
  const safeEmail = escapeHtml(payload.email);
  const safePhone = escapeHtml(payload.phone);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br/>");

  return `
    ${buildMailBrandHeaderHtml()}
    <h2>Yêu cầu liên hệ mới từ website THL</h2>
    <p><strong>Họ tên:</strong> ${safeFullName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Số điện thoại:</strong> ${safePhone}</p>
    <p><strong>Nội dung:</strong></p>
    <p>${safeMessage}</p>
  `;
}

function formatContactText(payload: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  return [
    "Yêu cầu liên hệ mới từ website THL",
    `Họ tên: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Số điện thoại: ${payload.phone}`,
    "Nội dung:",
    payload.message,
  ].join("\n");
}

function formatContactAutoReplyHtml(payload: { fullName: string }) {
  const safeFullName = escapeHtml(payload.fullName);

  return `
    ${buildMailBrandHeaderHtml()}
    <p>Kính gửi anh/chị ${safeFullName},</p>
    <p>THL B2B đã tiếp nhận thông tin liên hệ của anh/chị.</p>
    <p>Đội THL B2B sẽ rà soát nội dung và phản hồi chi tiết thủ công qua email hoặc điện thoại trong khung giờ làm việc.</p>
    <p>Nếu cần xử lý gấp, anh/chị có thể liên hệ trực tiếp số ${siteConfig.phone}.</p>
    <p>Trân trọng,<br/>Đội THL B2B - Công Ty TNHH Tân Hòa Lợi</p>
  `;
}

function formatContactAutoReplyText(payload: { fullName: string }) {
  return [
    `Kính gửi anh/chị ${payload.fullName},`,
    "THL B2B đã tiếp nhận thông tin liên hệ của anh/chị.",
    "Đội THL B2B sẽ rà soát nội dung và phản hồi chi tiết thủ công qua email hoặc điện thoại trong khung giờ làm việc.",
    `Nếu cần xử lý gấp, anh/chị có thể liên hệ trực tiếp số ${siteConfig.phone}.`,
    "Trân trọng,",
    "Đội THL B2B - Công Ty TNHH Tân Hòa Lợi",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsed = contactSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Thông tin chưa hợp lệ.",
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  try {
    await sendMail({
      to: getInternalRecipient(),
      subject: `[THL B2B] Liên hệ mới - ${payload.fullName}`,
      html: formatContactHtml(payload),
      text: formatContactText(payload),
      replyTo: payload.email,
    });
  } catch (error) {
    console.error("[forms/contact] send internal mail error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "THL đã nhận yêu cầu nhưng chưa gửi được email nội bộ. Vui lòng liên hệ trực tiếp qua số điện thoại.",
      },
      { status: 500 },
    );
  }

  let autoReplySent = true;
  try {
    await sendMail({
      to: payload.email,
      subject: "THL B2B đã tiếp nhận thông tin liên hệ",
      html: formatContactAutoReplyHtml(payload),
      text: formatContactAutoReplyText(payload),
    });
  } catch (error) {
    autoReplySent = false;
    console.error("[forms/contact] send autoresponse error:", error);
  }

  return NextResponse.json({
    ok: true,
    message: autoReplySent
      ? "THL đã tiếp nhận thông tin. Đội THL B2B sẽ phản hồi chi tiết thủ công qua email hoặc điện thoại."
      : "THL đã tiếp nhận thông tin. Email xác nhận tự động tạm thời chưa gửi được, đội THL B2B vẫn sẽ phản hồi thủ công qua email hoặc điện thoại.",
  });
}
