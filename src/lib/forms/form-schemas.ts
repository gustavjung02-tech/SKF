import { z } from "zod";

export const contactSubmitSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(120, "Họ tên quá dài"),
  email: z.string().trim().email("Vui lòng nhập email hợp lệ"),
  phone: z.string().trim().min(8, "Vui lòng nhập số điện thoại").max(40, "Số điện thoại quá dài"),
  message: z.string().trim().min(5, "Vui lòng nhập nội dung").max(2000, "Nội dung quá dài"),
});

export type ContactSubmitValues = z.infer<typeof contactSubmitSchema>;

export const leadSubmitSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên người liên hệ").max(120, "Họ tên quá dài"),
  email: z.string().trim().email("Vui lòng nhập email hợp lệ"),
  phone: z.string().trim().min(8, "Vui lòng nhập số điện thoại").max(40, "Số điện thoại quá dài"),
  company: z.string().trim().min(2, "Vui lòng nhập nhà máy / công ty").max(160, "Tên công ty quá dài"),
  area: z.string().trim().min(2, "Vui lòng nhập khu vực / KCN").max(160, "Khu vực quá dài"),
  productGroup: z.string().trim().min(1, "Vui lòng chọn nhóm vật tư cần đối chiếu").max(160, "Nhóm vật tư quá dài"),
  requestedCode: z.string().trim().min(2, "Vui lòng nhập mã đang dùng hoặc mô tả vật tư").max(200, "Mã hoặc mô tả quá dài"),
  application: z.string().trim().max(240, "Thông tin thiết bị quá dài").optional(),
  quantity: z.string().trim().max(80, "Số lượng quá dài").optional(),
  priority: z.string().trim().min(1, "Vui lòng chọn mức độ ưu tiên").max(120, "Mức độ ưu tiên không hợp lệ"),
  notes: z.string().trim().max(2000, "Ghi chú quá dài").optional(),
  uploadedFiles: z.array(z.string().trim().min(1).max(200)).max(20, "Quá nhiều file").optional(),
});

export type LeadSubmitValues = z.infer<typeof leadSubmitSchema>;

export const recruitmentSubmitSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên").max(120, "Họ tên quá dài"),
  phone: z.string().trim().min(8, "Vui lòng nhập số điện thoại").max(40, "Số điện thoại quá dài"),
  email: z
    .string()
    .trim()
    .max(200, "Email quá dài")
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, "Vui lòng nhập email hợp lệ"),
  position: z.string().trim().min(2, "Vui lòng chọn vị trí ứng tuyển").max(160, "Vị trí ứng tuyển quá dài"),
  area: z.string().trim().min(2, "Vui lòng nhập khu vực ứng tuyển").max(160, "Khu vực ứng tuyển quá dài"),
  experience: z.string().trim().max(2000, "Nội dung kinh nghiệm quá dài").optional(),
  notes: z.string().trim().max(2000, "Ghi chú quá dài").optional(),
  uploadedFiles: z.array(z.string().trim().min(1).max(200)).max(20, "Quá nhiều file").optional(),
});

export type RecruitmentSubmitValues = z.infer<typeof recruitmentSubmitSchema>;
