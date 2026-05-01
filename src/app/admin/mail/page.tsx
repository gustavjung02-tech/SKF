import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminMailComposer } from "@/components/admin/admin-mail-composer";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCookieName, getVerifiedAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const senderProfiles = [
  { title: "Mặc định", description: "Dùng cho các liên hệ chung từ website." },
  { title: "Hỗ trợ", description: "Dùng khi phản hồi vấn đề kỹ thuật hoặc chăm sóc khách hàng." },
  { title: "Báo giá", description: "Dùng cho trao đổi kinh doanh, RFQ và báo giá." },
  { title: "Tuyển dụng", description: "Dùng cho liên hệ ứng viên và quy trình tuyển dụng." },
  { title: "Admin", description: "Dùng cho đăng nhập, OTP và các thông báo bảo mật." },
] as const;

export default async function AdminMailPage() {
  const cookieStore = cookies();
  const session = await getVerifiedAdminSession(cookieStore.get(getAdminCookieName())?.value);
  if (!session) {
    redirect("/admin/login?next=/admin/mail");
  }

  return (
    <AdminShell
      section="mail"
      sessionEmail={session.email}
      title="Mail admin"
      description="Gửi mail thủ công từ các hộp gửi đang vận hành và chuẩn bị sẵn nền cho màn hình đọc mail sau này."
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <AdminMailComposer />

        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Trạng thái inbox</CardTitle>
              <CardDescription>Trang đọc mail chưa bật vì hệ thống hiện mới xử lý luồng gửi mail đi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Để đọc mail ngay trong admin, cần thêm một trong các hướng sau:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Kết nối Gmail API cho mailbox đang nhận mail.</li>
                <li>Kết nối IMAP với mailbox doanh nghiệp riêng.</li>
                <li>Nhận mail inbound qua webhook rồi lưu lại để hiển thị trong admin.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Nhóm hộp gửi đang hỗ trợ</CardTitle>
              <CardDescription>Mail thủ công dùng lại đúng các nhóm sender đang hoạt động trên website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {senderProfiles.map((sender) => (
                <div key={sender.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="font-medium text-slate-900">{sender.title}</p>
                  <p className="mt-1">{sender.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}