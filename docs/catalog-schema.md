# Catalog Schema — Mô tả cấu trúc dữ liệu chatbot

## Tổng quan

Thư mục `src/data/catalog/` chứa toàn bộ dữ liệu tĩnh phục vụ chatbot tra mã vật tư.
Mỗi file JSON đảm trách một lớp nghiệp vụ riêng biệt.

---

## File có sẵn (không đổi cấu trúc)

| File | Vai trò |
|---|---|
| `master-catalog.json` | Catalog chính — từng mã vật tư kèm kích thước, brand, ứng dụng, ghi chú nhầm lẫn |
| `brand-whitelist.json` | Whitelist thương hiệu được phép bán + nhóm hàng đang hỗ trợ |
| `equivalent-map.json` | Bảng mã tương đương — đối chiếu mã khách gửi sang mã trong catalog |
| `technical-rules.json` | Luật kỹ thuật — field bắt buộc theo nhóm hàng, trigger nhầm lẫn cao |
| `application-rules.json` | Luật ứng dụng — liên kết cụm máy với nhóm hàng, field cần hỏi, ghi chú |
| `conversation-prompts.json` | Prompt discovery flow — lời chào, options từng bước |

---

## File mới

### `brand_policy.json`

Chính sách thương hiệu chi tiết hơn whitelist: trạng thái (active / reference_only), mức ưu tiên đề xuất, nhóm hàng áp dụng, luật khi khách hỏi brand ngoài danh mục.

**Dùng khi:** Bot cần quyết định đề xuất brand nào trước, hoặc xử lý khi khách hỏi SKF/FAG/NSK.

### `product_groups.json`

Danh sách nhóm hàng kèm: label tiếng Việt/Anh, field bắt buộc/tuỳ chọn, từ khoá nhận diện, brand ưu tiên.

**Dùng khi:** Bot cần infer nhóm hàng từ input, hoặc validate field thiếu.

### `application_fitment.json`

Bảng fitment — liên kết hệ máy + cụm máy cụ thể đến mã vật tư phù hợp.

**Dùng khi:** Khách hỏi theo ứng dụng ("Hino 4HK1 bơm nước dùng bi gì", "spindle CNC").

| Field | Mô tả |
|---|---|
| `machine_type` | Loại máy (xe_tai_hino, cnc, may_bom, ...) |
| `machine_model` | Tên model / đời máy |
| `subsystem` | Cụm con (bơm nước, spindle, trục ra, ...) |
| `recommended_codes` | Mã vật tư đề xuất (rỗng = ngoài catalog phổ thông) |
| `caution` | Lưu ý khi đề xuất |

### `slang_map.json`

Bảng chuyển đổi tiếng lóng / viết tắt / cách gọi thường gặp sang thuật ngữ chuẩn.

**Dùng khi:** Bot cần hiểu "bạc đạn" = vòng bi, "sên" = xích, "củ đục" = spindle, "hú" = tiếng ồn bất thường.

### `symptom_rules.json`

Luật suy đoán nhóm hàng và mức khẩn từ triệu chứng.

**Dùng khi:** Khách mô tả hiện tượng ("máy hú", "rò dầu", "rung lắc") thay vì gửi mã.

| Field | Mô tả |
|---|---|
| `signals` | Từ khoá trigger |
| `likely_groups` | Nhóm hàng có khả năng liên quan |
| `urgency_hint` | Mức khẩn gợi ý (low / medium / high) |
| `follow_up` | Câu hỏi tiếp theo nên hỏi |

### `question_tree.json`

Cây câu hỏi — quy trình hỏi từng bước khi thiếu thông tin. Mỗi tree có entry_condition, tối đa 3 bước, mỗi bước có question + options + field_to_fill.

**Dùng khi:** Discovery flow cần hỏi tuần tự để thu thập đủ dữ liệu chốt mã.

### `response_templates.json`

Mẫu câu trả lời cho các tình huống phổ biến: tìm được mã, tìm tương đương, thiếu thông tin, ngoài catalog, brand không hỗ trợ, nhầm lẫn cao, cần gấp...

**Dùng khi:** Bot cần format câu trả lời nhất quán theo từng scenario.

### `confusion_rules.json`

Luật phát hiện nhầm lẫn phổ biến giữa các mã / nhóm hàng. Mỗi rule có trigger_codes, loại nhầm, cảnh báo, và action tiếp theo.

**Dùng khi:** Bot detect risk trước khi chốt mã (VD: 2RS vs ZZ, UCP vs UCF, 08B vs RS40, xích 420/428 vs xích công nghiệp).

### `conversation_examples.json`

Tập hội thoại mẫu — dùng để test và tham khảo. Mỗi conversation có id, title, tags, và mảng turns (user/assistant).

**Dùng khi:** Test chatbot, đào tạo few-shot, hoặc QA kiểm tra phản hồi.

---

## Quy ước

- Field name: `snake_case`
- Mỗi file có `version` để theo dõi thay đổi
- Dữ liệu hiện tại là seed demo, cần bổ sung thêm cho vận hành thật
- File cũ dùng kebab-case (`brand-whitelist.json`), file mới dùng snake_case (`brand_policy.json`)
