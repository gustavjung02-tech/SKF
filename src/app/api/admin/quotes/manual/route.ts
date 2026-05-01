import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiPermission } from "../../_auth";
import { getProactiveQuoteById, listProactiveQuotes, upsertProactiveQuote } from "@/lib/admin/proactive-quote-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const permission = await requireAdminApiPermission(request, "quotes:read");
  if (!permission.ok) {
    return permission.response;
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (id.trim()) {
    const quote = await getProactiveQuoteById(id);
    if (!quote) {
      return NextResponse.json({ ok: false, error: "Không tìm thấy báo giá." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, quote });
  }

  const quotes = await listProactiveQuotes();
  return NextResponse.json({ ok: true, quotes });
}

export async function POST(request: NextRequest) {
  const permission = await requireAdminApiPermission(request, "quotes:write");
  if (!permission.ok) {
    return permission.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload báo giá không hợp lệ." }, { status: 400 });
  }

  try {
    const quote = await upsertProactiveQuote((body as { quote?: unknown })?.quote);
    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Không lưu được báo giá chủ động." },
      { status: 500 },
    );
  }
}
