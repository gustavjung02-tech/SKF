import { NextRequest } from "next/server";
import { updateManagedAdminAccount } from "@/lib/admin/account-store";
import { parseManagedAccountFormData, redirectWithMessage, requireAdminUserCapability } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const capability = await requireAdminUserCapability(request, "manage");
  if (!capability.ok) {
    return capability.response;
  }

  try {
    const formData = await request.formData();
    const input = parseManagedAccountFormData(formData);

    await updateManagedAdminAccount({
      id: params.id,
      displayName: input.displayName,
      email: input.email,
      role: input.role,
      permissions: input.permissions,
      status: input.status,
      password: input.password,
    });

    return redirectWithMessage(request, "success", "Đã cập nhật tài khoản nhân sự.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không cập nhật được tài khoản.";
    return redirectWithMessage(request, "error", message);
  }
}
