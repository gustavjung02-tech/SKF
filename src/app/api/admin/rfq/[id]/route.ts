import { NextResponse } from "next/server";
import { getAdminRfqDetail } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const item = await getAdminRfqDetail(params.id);
    if (!item) {
      return NextResponse.json({ ok: false, error: "Không tìm thấy RFQ." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Không đọc được chi tiết RFQ." }, { status: 502 });
  }
}