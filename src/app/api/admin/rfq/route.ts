import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiPermission } from "../_auth";
import { listAdminRfqs } from "@/lib/admin/sheet-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const permission = await requireAdminApiPermission(request, "quotes:read");
  if (!permission.ok) {
    return permission.response;
  }

  try {
    const items = await listAdminRfqs();
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Không đọc được danh sách RFQ." }, { status: 502 });
  }
}