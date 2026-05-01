import { NextRequest } from "next/server";
import { deleteManagedAdminAccount } from "@/lib/admin/account-store";
import { redirectWithMessage, requireAdminUserCapability } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const capability = await requireAdminUserCapability(request, "manage");
  if (!capability.ok) {
    return capability.response;
  }

  try {
    await deleteManagedAdminAccount(params.id);
    return redirectWithMessage(request, "success", "Đã xóa tài khoản nhân sự.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không xóa được tài khoản.";
    return redirectWithMessage(request, "error", message);
  }
}
