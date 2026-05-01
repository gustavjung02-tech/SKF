import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiPermission } from "../../_auth";
import { searchAdminCatalog } from "@/lib/admin/catalog-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const permission = await requireAdminApiPermission(request, "quotes:write");
  if (!permission.ok) {
    return permission.response;
  }

  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ ok: true, items: [] });
  }

  try {
    const items = await searchAdminCatalog(query, 20);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Không tra được mã sản phẩm." },
      { status: 500 },
    );
  }
}
