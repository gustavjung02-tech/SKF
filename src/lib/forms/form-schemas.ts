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

const quoteRequestCustomerSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên").max(120, "Họ tên quá dài"),
  phone: z.string().trim().min(8, "Vui lòng nhập số điện thoại").max(40, "Số điện thoại quá dài"),
  zalo: z.string().trim().max(40, "Zalo quá dài"),
  company: z.string().trim().max(160, "Tên công ty quá dài"),
  province: z.string().trim().max(160, "Tỉnh/thành quá dài"),
  note: z.string().trim().max(2000, "Ghi chú quá dài"),
});

const quoteRequestItemSchema = z.object({
  code: z.string().trim().min(1, "Thiếu mã sản phẩm").max(120, "Mã sản phẩm quá dài"),
  normalizedCode: z.string().trim().min(1, "Thiếu mã chuẩn hóa").max(120, "Mã chuẩn hóa quá dài"),
  name: z.string().trim().min(1, "Thiếu tên sản phẩm").max(240, "Tên sản phẩm quá dài"),
  productGroup: z.string().trim().min(1, "Thiếu nhóm sản phẩm").max(240, "Nhóm sản phẩm quá dài"),
  quantity: z.number().int("Số lượng không hợp lệ").positive("Số lượng phải lớn hơn 0"),
  unit: z.string().trim().min(1, "Thiếu đơn vị tính").max(40, "Đơn vị tính quá dài"),
  customerNote: z.string().trim().max(1000, "Ghi chú riêng quá dài"),
});

export const quoteRequestSubmitSchema = z.object({
  id: z.string().trim().min(1, "Thiếu mã RFQ").max(80, "Mã RFQ quá dài"),
  createdAt: z.string().datetime("Thời gian tạo không hợp lệ"),
  source: z.literal("website-tra-ma-bao-gia"),
  status: z.literal("new"),
  customer: quoteRequestCustomerSchema,
  items: z.array(quoteRequestItemSchema).min(1, "Vui lòng chọn ít nhất 1 mã cần báo giá"),
  pricing: z.object({
    currency: z.literal("VND"),
    status: z.literal("not_priced"),
  }),
});

export type QuoteRequestSubmitValues = z.infer<typeof quoteRequestSubmitSchema>;
