import { NextRequest, NextResponse } from "next/server";
import { buildDefaultQuoteDraft, calculateQuoteDraft, hydrateQuoteDraft } from "@/lib/admin/quote";
import { getAdminRfqDetail, saveAdminQuote } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload báo giá không hợp lệ." }, { status: 400 });
  }

  const rfqId = `${(body as { rfqId?: string })?.rfqId ?? ""}`.trim();
  if (!rfqId) {
    return NextResponse.json({ ok: false, error: "Thiếu mã RFQ." }, { status: 400 });
  }

  const detail = await getAdminRfqDetail(rfqId);
  if (!detail) {
    return NextResponse.json({ ok: false, error: "Không tìm thấy RFQ." }, { status: 404 });
  }

  const nextQuote = hydrateQuoteDraft((body as { quote?: unknown })?.quote ?? buildDefaultQuoteDraft(detail.items), detail.items);
  const calculated = calculateQuoteDraft(nextQuote);

  try {
    const saveResult = await saveAdminQuote(rfqId, nextQuote);
    const warning =
      saveResult &&
      typeof saveResult === "object" &&
      "warning" in (saveResult as Record<string, unknown>) &&
      `${(saveResult as Record<string, unknown>).warning ?? ""}`;

    return NextResponse.json({
      ok: true,
      quote: nextQuote,
      calculated,
      warning: warning || undefined,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Không lưu được bản nháp báo giá." }, { status: 502 });
  }
}