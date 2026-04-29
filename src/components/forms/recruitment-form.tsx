"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { recruitmentJobs } from "@/data/recruitment-content";
import { recruitmentSubmitSchema, type RecruitmentSubmitValues } from "@/lib/forms/form-schemas";
import { uploadProvider, type UploadedImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const defaultValues: RecruitmentSubmitValues = {
  fullName: "",
  phone: "",
  email: "",
  position: "",
  area: "",
  experience: "",
  notes: "",
  uploadedFiles: [],
};

type RecruitmentFormProps = {
  selectedJob?: string;
};

export function RecruitmentForm({ selectedJob }: RecruitmentFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedImage[]>([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecruitmentSubmitValues>({
    resolver: zodResolver(recruitmentSubmitSchema),
    defaultValues,
  });

  const selectedPosition = watch("position");

  useEffect(() => {
    if (!selectedJob) {
      return;
    }

    const matchedPosition = recruitmentJobs.find((job) => job.title === selectedJob);
    if (!matchedPosition) {
      return;
    }

    setValue("position", matchedPosition.title, { shouldDirty: true, shouldValidate: true });
  }, [selectedJob, setValue]);

  async function onUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    const uploaded = await uploadProvider.upload(files);
    setUploadedFiles((prev) => {
      const nextFiles = [...prev, ...uploaded];
      setValue(
        "uploadedFiles",
        nextFiles.map((file) => file.name),
        { shouldValidate: true, shouldDirty: true },
      );
      return nextFiles;
    });
  }

  async function onSubmit(values: RecruitmentSubmitValues) {
    setSubmitMessage("");
    setSubmitError("");

    const payload: RecruitmentSubmitValues = {
      ...values,
      uploadedFiles: uploadedFiles.map((file) => file.name),
    };

    try {
      const response = await fetch("/api/forms/recruitment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: { ok?: boolean; message?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        setSubmitError(data.error ?? "Không thể gửi hồ sơ ứng tuyển. Vui lòng thử lại hoặc liên hệ trực tiếp THL.");
        return;
      }

      setSubmitMessage(
        data.message ?? "THL đã tiếp nhận thông tin ứng tuyển và sẽ liên hệ lại với ứng viên phù hợp.",
      );
      reset(defaultValues);
      setUploadedFiles([]);
    } catch {
      setSubmitError("Không thể kết nối hệ thống tuyển dụng. Vui lòng thử lại hoặc liên hệ trực tiếp THL.");
    }
  }

  return (
    <form
      id="ung-tuyen"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)] sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="candidateName">Họ và tên</Label>
          <Input id="candidateName" placeholder="Nguyễn Văn A" {...register("fullName")} />
          {errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="candidatePhone">Số điện thoại</Label>
          <Input id="candidatePhone" placeholder="09xx xxx xxx" {...register("phone")} />
          {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="candidateEmail">Email (nếu có)</Label>
          <Input
            id="candidateEmail"
            type="email"
            placeholder="ten@email.com"
            {...register("email")}
          />
          {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Vị trí ứng tuyển</Label>
          <Select
            value={selectedPosition}
            onValueChange={(value) => setValue("position", value ?? "", { shouldDirty: true, shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn vị trí ứng tuyển" />
            </SelectTrigger>
            <SelectContent>
              {recruitmentJobs.map((job) => (
                <SelectItem key={job.id} value={job.title}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.position ? <p className="text-xs text-red-600">{errors.position.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidateArea">Khu vực ứng tuyển</Label>
        <Input id="candidateArea" placeholder="TP.HCM / Bình Dương / Cần Thơ..." {...register("area")} />
        {errors.area ? <p className="text-xs text-red-600">{errors.area.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidateExperience">Kinh nghiệm làm việc</Label>
        <Textarea
          id="candidateExperience"
          rows={3}
          placeholder="Mô tả ngắn kinh nghiệm làm việc liên quan"
          {...register("experience")}
        />
        {errors.experience ? <p className="text-xs text-red-600">{errors.experience.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidateCv">File CV (nếu có)</Label>
        <Input id="candidateCv" type="file" multiple accept=".pdf,.doc,.docx,image/*" onChange={onUploadChange} />
        {uploadedFiles.length > 0 ? (
          <ul className="space-y-1 text-xs text-slate-600">
            {uploadedFiles.map((file) => (
              <li key={file.id}>- {file.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">Bạn có thể đính kèm CV hoặc gửi mô tả kinh nghiệm ở ô ghi chú.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidateNotes">Ghi chú thêm</Label>
        <Textarea
          id="candidateNotes"
          rows={3}
          placeholder="Thông tin bổ sung về thời gian có thể nhận việc, mong muốn công việc..."
          {...register("notes")}
        />
        {errors.notes ? <p className="text-xs text-red-600">{errors.notes.message}</p> : null}
      </div>

      <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Ứng tuyển ngay"}
      </Button>

      {submitError ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{submitError}</p> : null}
      {submitMessage ? <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">{submitMessage}</p> : null}
    </form>
  );
}
