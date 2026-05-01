import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { recruitmentSubmitSchema } from "@/lib/forms/form-schemas";
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

function buildRecruitmentLines(payload: {
  fullName: string;
  phone: string;
  email?: string;
  position: string;
  area: string;
  experience?: string;
  notes?: string;
  uploadedFiles?: string[];
}) {
  return [
    `Họ và tên: ${payload.fullName}`,
    `Số điện thoại: ${payload.phone}`,
    `Email: ${normalizeOptional(payload.email)}`,
    `Vị trí ứng tuyển: ${payload.position}`,
    `Khu vực ứng tuyển: ${payload.area}`,
    `Kinh nghiệm: ${normalizeOptional(payload.experience)}`,
    `Ghi chú: ${normalizeOptional(payload.notes)}`,
    `File CV đính kèm: ${(payload.uploadedFiles ?? []).length > 0 ? payload.uploadedFiles?.join(", ") : "Không có"}`,
  ];
}

function formatRecruitmentInternalHtml(payload: {
  fullName: string;
  phone: string;
  email?: string;
  position: string;
  area: string;
  experience?: string;
  notes?: string;
  uploadedFiles?: string[];
}) {
  const lines = buildRecruitmentLines(payload);

  return `
    ${buildMailBrandHeaderHtml()}
    <h2>Hồ sơ ứng tuyển mới từ website SKF Công Nghiệp</h2>
    <ul>
      ${lines.map((line) => `<li>${toSafeHtml(line)}</li>`).join("")}
    </ul>
  `;
}

function formatRecruitmentInternalText(payload: {
  fullName: string;
  phone: string;
  email?: string;
  position: string;
  area: string;
  experience?: string;
  notes?: string;
  uploadedFiles?: string[];
}) {
  return ["Hồ sơ ứng tuyển mới từ website SKF Công Nghiệp", ...buildRecruitmentLines(payload)].join("\n");
}

function formatRecruitmentAutoReplyHtml(payload: { fullName: string; position: string }) {
  const safeName = escapeHtml(payload.fullName);
  const safePosition = escapeHtml(payload.position);

  return `
    ${buildMailBrandHeaderHtml()}
    <p>Kính gửi anh/chị ${safeName},</p>
    <p>SKF Công Nghiệp đã tiếp nhận hồ sơ ứng tuyển vị trí <strong>${safePosition}</strong>.</p>
    <p>Bộ phận tuyển dụng sẽ rà soát hồ sơ và liên hệ lại với ứng viên phù hợp để trao đổi chi tiết.</p>
    <p>Nếu cần hỗ trợ thêm, anh/chị có thể liên hệ số ${siteConfig.phone} hoặc ${siteConfig.zaloLabel} của SKF Công Nghiệp.</p>
    <p>Trân trọng,<br/>Bộ phận tuyển dụng SKF Công Nghiệp</p>
  `;
}

function formatRecruitmentAutoReplyText(payload: { fullName: string; position: string }) {
  return [
    `Kính gửi anh/chị ${payload.fullName},`,
    `SKF Công Nghiệp đã tiếp nhận hồ sơ ứng tuyển vị trí ${payload.position}.`,
    "Bộ phận tuyển dụng sẽ rà soát hồ sơ và liên hệ lại với ứng viên phù hợp để trao đổi chi tiết.",
    `Nếu cần hỗ trợ thêm, anh/chị có thể liên hệ số ${siteConfig.phone} hoặc ${siteConfig.zaloLabel} của SKF Công Nghiệp.`,
    "Trân trọng,",
    "Bộ phận tuyển dụng SKF Công Nghiệp",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsed = recruitmentSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Thông tin ứng tuyển chưa hợp lệ.",
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const normalizedEmail = payload.email?.trim();

  try {
    await sendMail({
      to: getInternalRecipient(),
      subject: `[SKF Công Nghiệp Tuyển dụng] Ứng tuyển - ${payload.position} - ${payload.fullName}`,
      html: formatRecruitmentInternalHtml(payload),
      text: formatRecruitmentInternalText(payload),
      replyTo: normalizedEmail && normalizedEmail.length > 0 ? normalizedEmail : undefined,
      fromKind: "recruitment",
    });
  } catch (error) {
    console.error("[forms/recruitment] send internal mail error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "SKF Công Nghiệp đã nhận hồ sơ nhưng chưa gửi được email nội bộ. Vui lòng liên hệ trực tiếp bộ phận tuyển dụng.",
      },
      { status: 500 },
    );
  }

  let autoReplySent = false;
  if (normalizedEmail && normalizedEmail.length > 0) {
    try {
      await sendMail({
        to: normalizedEmail,
        subject: "SKF Công Nghiệp đã tiếp nhận hồ sơ ứng tuyển",
        html: formatRecruitmentAutoReplyHtml(payload),
        text: formatRecruitmentAutoReplyText(payload),
        fromKind: "recruitment",
      });
      autoReplySent = true;
    } catch (error) {
      console.error("[forms/recruitment] send autoresponse error:", error);
    }
  }

  return NextResponse.json({
    ok: true,
    message: autoReplySent
      ? "SKF Công Nghiệp đã tiếp nhận hồ sơ ứng tuyển. Bộ phận tuyển dụng sẽ liên hệ lại với ứng viên phù hợp."
      : "SKF Công Nghiệp đã tiếp nhận hồ sơ ứng tuyển. Bộ phận tuyển dụng sẽ liên hệ lại với ứng viên phù hợp.",
  });
}
