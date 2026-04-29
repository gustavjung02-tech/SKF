import type { AssistantIntentRoute } from "@/lib/assistant/intent-parser";

export type AssistantPolicyReviewMock = {
  id: string;
  input: string;
  expectedRoute: AssistantIntentRoute;
  shouldUseGrounding: boolean;
  shouldTriggerCommercialGuard: boolean;
  reviewerChecks: string[];
  expectedPreview: string;
};

export const assistantPolicyReviewMocks: AssistantPolicyReviewMock[] = [
  {
    id: "case_1",
    input: "6202 cốt 10 k anh",
    expectedRoute: "code_lookup",
    shouldUseGrounding: true,
    shouldTriggerCommercialGuard: false,
    reviewerChecks: [
      "Tra theo hướng code lookup, không nhảy sang báo giá.",
      "Câu trả lời ngắn, theo bullet.",
      "Nếu chưa đủ dữ liệu thì chỉ hỏi 1-2 ý quan trọng.",
    ],
    expectedPreview:
      "- Em đang hiểu anh/chị cần tra mã 6202 theo cốt 10.\n- Nếu có ảnh tem hoặc kiểu che chắn 2RS/ZZ, em đối chiếu nhanh hơn.",
  },
  {
    id: "case_2",
    input: "máy bơm kêu hú nóng",
    expectedRoute: "symptom_diagnosis",
    shouldUseGrounding: true,
    shouldTriggerCommercialGuard: false,
    reviewerChecks: [
      "Đi theo hướng chẩn đoán triệu chứng.",
      "Nêu 2-3 khả năng kỹ thuật ngắn gọn, không viết đoạn dài.",
      "Hỏi lại đúng cụm bị nóng hoặc kêu.",
    ],
    expectedPreview:
      "- Triệu chứng này thường liên quan ổ trục, lệch tâm hoặc thiếu bôi trơn.\n- Anh/chị giúp em chốt nóng ở ổ trục, puly hay cụm phớt để em khoanh đúng mã.",
  },
  {
    id: "case_3",
    input: "bi spindle cnc có không",
    expectedRoute: "stock_request",
    shouldUseGrounding: false,
    shouldTriggerCommercialGuard: true,
    reviewerChecks: [
      "Không được trả lời có hàng hoặc sẵn hàng.",
      "Phải chuyển sang xin mã hoặc ảnh tem, số lượng, khu vực giao, liên hệ.",
      "Giữ giọng chuyên nghiệp, gọn bullet.",
    ],
    expectedPreview:
      "- Em đã ghi nhận nhu cầu kiểm tra khả năng cung ứng cho nhu cầu này.\n- Em chưa xác nhận tồn kho hoặc thời gian giao tự động.\n- Anh/chị gửi giúp mã hoặc ảnh tem, số lượng, khu vực giao và tên công ty hoặc số điện thoại.",
  },
  {
    id: "case_4",
    input: "tôi dùng máy 4hk1 xe hino,cần tư vấn vòng bi koyo",
    expectedRoute: "code_lookup",
    shouldUseGrounding: true,
    shouldTriggerCommercialGuard: false,
    reviewerChecks: [
      "Hiểu được ngữ cảnh xe Hino 4HK1 và brand Koyo.",
      "Không hỏi theo field nội bộ.",
      "Chỉ hỏi lại cụm cần kiểm tra nếu chưa rõ.",
    ],
    expectedPreview:
      "- Em đang hiểu anh/chị cần tư vấn vòng bi Koyo cho hệ 4HK1 Hino.\n- Anh/chị cho em biết đang kiểm tra cụm nào: bánh xe, máy phát, puly tăng, lốc lạnh hay hộp số?",
  },
  {
    id: "case_5",
    input: "báo giá giúp 6305 koyo",
    expectedRoute: "pricing_request",
    shouldUseGrounding: false,
    shouldTriggerCommercialGuard: true,
    reviewerChecks: [
      "Không được báo giá tự động.",
      "Phải ghi nhận nhu cầu và xin thông tin chuyển kinh doanh.",
      "Không kết luận tồn kho.",
    ],
    expectedPreview:
      "- Em đã ghi nhận nhu cầu báo giá cho mã 6305.\n- Giá được kinh doanh xác nhận riêng sau khi đối chiếu đúng mã và ứng dụng.\n- Anh/chị gửi giúp mã hoặc ảnh tem, số lượng, khu vực giao và tên công ty hoặc số điện thoại.",
  },
];
