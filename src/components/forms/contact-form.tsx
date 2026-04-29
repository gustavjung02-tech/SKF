"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { contactSubmitSchema, type ContactSubmitValues } from "@/lib/forms/form-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactSubmitValues>({
    resolver: zodResolver(contactSubmitSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactSubmitValues) {
    setSubmitMessage("");
    setSubmitError("");

    try {
      const response = await fetch("/api/forms/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload: { ok?: boolean; message?: string; error?: string } = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        setSubmitError(payload.error ?? "Không thể gửi yêu cầu. Vui lòng thử lại hoặc liên hệ trực tiếp đội THL B2B qua điện thoại.");
        return;
      }

      setSubmitMessage(
        payload.message ?? "THL đã tiếp nhận thông tin. Đội THL B2B sẽ phản hồi chi tiết thủ công qua email hoặc điện thoại.",
      );
      reset();
    } catch {
      setSubmitError("Không thể kết nối hệ thống gửi form. Vui lòng thử lại hoặc liên hệ trực tiếp đội THL B2B qua điện thoại.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="contactName">Họ tên</Label>
        <Input id="contactName" placeholder="Nguyễn Văn A" {...register("fullName")} />
        {errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Email công việc</Label>
        <Input id="contactEmail" type="email" placeholder="ten@congty.com" {...register("email")} />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">Số điện thoại</Label>
        <Input id="contactPhone" placeholder="09xx xxx xxx" {...register("phone")} />
        {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactMessage">Nội dung cần THL hỗ trợ</Label>
        <Textarea
          id="contactMessage"
          rows={4}
          placeholder="Mã hàng, nhóm vật tư, ứng dụng hoặc tiến độ cần xử lý"
          {...register("message")}
        />
        {errors.message ? <p className="text-xs text-red-600">{errors.message.message}</p> : null}
      </div>

      <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
      </Button>

      {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}
      {submitMessage ? <p className="text-sm text-blue-800">{submitMessage}</p> : null}
    </form>
  );
}
