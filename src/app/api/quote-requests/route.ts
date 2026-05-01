import { NextRequest, NextResponse } from "next/server";
import { quoteRequestSubmitSchema } from "@/lib/forms/form-schemas";
import { createRemoteQuoteRequest } from "@/lib/admin/sheet-webhook";
import { buildMailBrandHeaderHtml, sendMail } from "@/lib/forms/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORBIDDEN_PRICE_FIELDS = new Set(["priceVnd", "priceText", "sellPrice", "costPrice"]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendAutoReplyEmailIfNeeded(rfq: {
  id: string;
  channel: "zalo" | "email";
  customer: { name: string; email: string };
}) {
  if (rfq.channel !== "email") {
    return;
  }

  const customerEmail = rfq.customer.email.trim();
  if (!customerEmail) {
    return;
  }

  const customerName = rfq.customer.name.trim() || "Quy khach";
  const subject = "SKF Cong Nghiep da tiep nhan yeu cau bao gia";
  const text = [
    `Xin chao ${customerName},`,
    "",
    "SKF Cong Nghiep da tiep nhan yeu cau bao gia cua ban.",
    `Ma yeu cau: ${rfq.id}`,
    "",
    "Nhan vien kinh doanh se kiem tra va phan hoi som nhat.",
    "Tran trong cam on.",
  ].join("\n");

  const html = `${buildMailBrandHeaderHtml()}<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;"><p>Xin chao ${escapeHtml(customerName)},</p><p>SKF Cong Nghiep da tiep nhan yeu cau bao gia cua ban.</p><p><strong>Ma yeu cau:</strong> ${escapeHtml(rfq.id)}</p><p>Nhan vien kinh doanh se kiem tra va phan hoi som nhat.</p><p>Tran trong cam on.</p></div>`;

  await sendMail({
    to: customerEmail,
    subject,
    text,
    html,
    fromKind: "sales",
  });
}

function hasForbiddenPricingFields(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasForbiddenPricingFields);
  }

  return Object.entries(value).some(([key, nestedValue]) => FORBIDDEN_PRICE_FIELDS.has(key) || hasForbiddenPricingFields(nestedValue));
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu RFQ không hợp lệ." }, { status: 400 });
  }

  if (hasForbiddenPricingFields(body)) {
    return NextResponse.json({ ok: false, error: "RFQ chứa trường giá không hợp lệ." }, { status: 400 });
  }

  const parsed = quoteRequestSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "RFQ không hợp lệ." }, { status: 400 });
  }

  try {
    const rfqData = {
      ...parsed.data,
      customer: {
        ...parsed.data.customer,
        email: parsed.data.customer.email ?? "",
        phone: parsed.data.customer.phone ?? "",
      },
    };
    await createRemoteQuoteRequest(rfqData);
    try {
      await sendAutoReplyEmailIfNeeded(rfqData);
    } catch (mailError) {
      console.warn("[quote-requests] auto-reply email failed", mailError);
    }
    return NextResponse.json({ ok: true, message: "Đã tiếp nhận phiếu yêu cầu báo giá." });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Không gửi được RFQ lên hệ thống quản trị.",
      },
      { status: 502 },
    );
  }
}