import { NextRequest } from "next/server";
import { createManagedAdminAccount } from "@/lib/admin/account-store";
import { parseManagedAccountFormData, redirectWithMessage, requireAdminUserCapability } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const capability = await requireAdminUserCapability(request, "create");
  if (!capability.ok) {
    return capability.response;
  }

  try {
    const formData = await request.formData();
    const input = parseManagedAccountFormData(formData, { requirePassword: true });

    await createManagedAdminAccount({
      displayName: input.displayName,
      email: input.email,
      role: input.role,
      permissions: input.permissions,
      password: input.password || "",
    });

    return redirectWithMessage(request, "success", "Đã tạo tài khoản nhân sự mới.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không tạo được tài khoản mới.";
    return redirectWithMessage(request, "error", message);
  }
}
