import { NextRequest, NextResponse } from "next/server";
import { normalizeAdminStatus } from "@/lib/admin/quote";
import { saveAdminStatus } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu trạng thái không hợp lệ." }, { status: 400 });
  }

  const status = normalizeAdminStatus((body as { status?: string })?.status);

  try {
    await saveAdminStatus(params.id, status);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Không cập nhật được trạng thái RFQ." }, { status: 502 });
  }
}