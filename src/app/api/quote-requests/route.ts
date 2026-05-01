import { NextRequest, NextResponse } from "next/server";
import { quoteRequestSubmitSchema } from "@/lib/forms/form-schemas";
import { createRemoteQuoteRequest } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORBIDDEN_PRICE_FIELDS = new Set(["priceVnd", "priceText", "sellPrice", "costPrice"]);

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
    await createRemoteQuoteRequest(parsed.data);
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