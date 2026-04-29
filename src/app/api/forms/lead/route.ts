import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { leadSubmitSchema } from "@/lib/forms/form-schemas";
import { buildMailBrandHeaderHtml, getInternalRecipient, sendMail } from "@/lib/forms/mailer";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeOptional(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "Không cung cấp";
}

function toSafeHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

function buildLeadLines(payload: {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  area: string;
  productGroup: string;
  requestedCode: string;
  application?: string;
  quantity?: string;
  priority: string;
  notes?: string;
  uploadedFiles?: string[];
}) {
  return [
    `Họ tên: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Số điện thoại: ${payload.phone}`,
    `Nhà máy / Công ty: ${payload.company}`,
    `Khu vực / KCN: ${payload.area}`,
    `Nhóm vật tư: ${payload.productGroup}`,
    `Mã đang dùng / Mô tả: ${payload.requestedCode}`,
    `Thiết bị / Cụm máy: ${normalizeOptional(payload.application)}`,
    `Số lượng dự kiến: ${normalizeOptional(payload.quantity)}`,
    `Mức độ ưu tiên: ${payload.priority}`,
    `Ghi chú: ${normalizeOptional(payload.notes)}`,
    `File kèm theo: ${(payload.uploadedFiles ?? []).length > 0 ? payload.uploadedFiles?.join(", ") : "Không có"}`,
  ];
}

function formatLeadInternalHtml(payload: {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  area: string;
  productGroup: string;
  requestedCode: string;
  application?: string;
  quantity?: string;
  priority: string;
  notes?: string;
  uploadedFiles?: string[];
}) {
  const lines = buildLeadLines(payload);
  return `
    ${buildMailBrandHeaderHtml()}
    <h2>Yêu cầu kỹ thuật mới từ website THL</h2>
    <ul>
      ${lines.map((line) => `<li>${toSafeHtml(line)}</li>`).join("")}
    </ul>
  `;
}

function formatLeadInternalText(payload: {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  area: string;
  productGroup: string;
  requestedCode: string;
  application?: string;
  quantity?: string;
  priority: string;
  notes?: string;
  uploadedFiles?: string[];
}) {
  return ["Yêu cầu kỹ thuật mới từ website THL", ...buildLeadLines(payload)].join("\n");
}

function formatLeadAutoReplyHtml(payload: { fullName: string }) {
  const safeFullName = escapeHtml(payload.fullName);

  return `
    ${buildMailBrandHeaderHtml()}
    <p>Kính gửi anh/chị ${safeFullName},</p>
    <p>THL B2B đã tiếp nhận yêu cầu kỹ thuật / báo giá của anh/chị.</p>
    <p>Đội THL B2B sẽ đối chiếu dữ liệu và phản hồi chi tiết thủ công qua email hoặc điện thoại, bao gồm hướng xử lý kỹ thuật tiếp theo.</p>
    <p>Trường hợp cần gấp, anh/chị vui lòng liên hệ trực tiếp số ${siteConfig.phone}.</p>
    <p>Trân trọng,<br/>Đội THL B2B - Công Ty TNHH Tân Hòa Lợi</p>
  `;
}

function formatLeadAutoReplyText(payload: { fullName: string }) {
  return [
    `Kính gửi anh/chị ${payload.fullName},`,
    "THL B2B đã tiếp nhận yêu cầu kỹ thuật / báo giá của anh/chị.",
    "Đội THL B2B sẽ đối chiếu dữ liệu và phản hồi chi tiết thủ công qua email hoặc điện thoại, bao gồm hướng xử lý kỹ thuật tiếp theo.",
    `Trường hợp cần gấp, anh/chị vui lòng liên hệ trực tiếp số ${siteConfig.phone}.`,
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

  const parsed = leadSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Thông tin yêu cầu chưa hợp lệ.",
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  try {
    await sendMail({
      to: getInternalRecipient(),
      subject: `[THL B2B] Yêu cầu kỹ thuật - ${payload.fullName} - ${payload.productGroup}`,
      html: formatLeadInternalHtml(payload),
      text: formatLeadInternalText(payload),
      replyTo: payload.email,
    });
  } catch (error) {
    console.error("[forms/lead] send internal mail error:", error);
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
      subject: "THL B2B đã tiếp nhận yêu cầu kỹ thuật",
      html: formatLeadAutoReplyHtml(payload),
      text: formatLeadAutoReplyText(payload),
    });
  } catch (error) {
    autoReplySent = false;
    console.error("[forms/lead] send autoresponse error:", error);
  }

  return NextResponse.json({
    ok: true,
    message: autoReplySent
      ? "THL đã tiếp nhận yêu cầu kỹ thuật. Đội THL B2B sẽ phản hồi chi tiết thủ công qua email hoặc điện thoại."
      : "THL đã tiếp nhận yêu cầu kỹ thuật. Email xác nhận tự động tạm thời chưa gửi được, đội THL B2B vẫn sẽ phản hồi thủ công qua email hoặc điện thoại.",
  });
}
