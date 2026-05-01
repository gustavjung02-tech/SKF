import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiPermission } from "../../_auth";
import { getAdminRfqDetail } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const permission = await requireAdminApiPermission(request, "quotes:read");
  if (!permission.ok) {
    return permission.response;
  }

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