"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const senderOptions = [
  { value: "default", label: "Mặc định" },
  { value: "support", label: "Hỗ trợ" },
  { value: "sales", label: "Báo giá / kinh doanh" },
  { value: "recruitment", label: "Tuyển dụng" },
  { value: "security", label: "Admin / bảo mật" },
] as const;

type SenderKind = (typeof senderOptions)[number]["value"];

export function AdminMailComposer() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [fromKind, setFromKind] = useState<SenderKind>("default");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; text: string }>({ type: "idle", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", text: "" });

    try {
      const response = await fetch("/api/admin/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message, replyTo, fromKind }),
      });
      const payload: { ok?: boolean; message?: string; error?: string } = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        setStatus({ type: "error", text: payload.error ?? "Không gửi được mail thủ công." });
        return;
      }

      setStatus({ type: "success", text: payload.message ?? "Đã gửi mail thủ công." });
      setSubject("");
      setMessage("");
      setReplyTo("");
    } catch {
      setStatus({ type: "error", text: "Không kết nối được API gửi mail admin." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-mail-to">Người nhận</Label>
          <Input id="admin-mail-to" type="email" value={to} onChange={(event) => setTo(event.target.value)} placeholder="nguoinhan@congty.com" required />
        </div>
        <div className="space-y-2">
          <Label>Sender</Label>
          <Select value={fromKind} onValueChange={(value) => setFromKind(value as SenderKind)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn sender" />
            </SelectTrigger>
            <SelectContent>
              {senderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-mail-replyto">Reply-to</Label>
        <Input id="admin-mail-replyto" type="email" value={replyTo} onChange={(event) => setReplyTo(event.target.value)} placeholder="tuongtac@skf-congnghiep.info" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-mail-subject">Tiêu đề</Label>
        <Input id="admin-mail-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Tiêu đề mail" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-mail-message">Nội dung</Label>
        <Textarea
          id="admin-mail-message"
          rows={10}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Nhập nội dung mail cần gửi..."
          required
        />
      </div>

      <Button type="submit" className="bg-blue-800 text-white hover:bg-blue-900" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Gửi mail thủ công"}
      </Button>

      {status.type === "success" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{status.text}</p> : null}
      {status.type === "error" ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{status.text}</p> : null}
    </form>
  );
}