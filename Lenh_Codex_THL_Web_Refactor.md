# Lệnh cho Codex — Refactor THL-web theo hướng catalog công nghiệp có hero video

**Repo review target:** https://github.com/gustavjung24-ops/THL-web.git

## Mục tiêu
Refactor repo hiện tại theo hướng website catalog công nghiệp giống tinh thần VOBICO, nhưng gọn hơn, sạch hơn, hiện đại hơn, và tiết kiệm khối lượng sửa để đỡ tốn quota. Không rebuild từ đầu. Không thay stack. Giữ Next.js/Tailwind hiện tại, tận dụng tối đa asset và component sẵn có.

## Yêu cầu tổng
1. Giữ nguyên repo và kiến trúc hiện có, chỉ refactor các phần giao diện chính.
2. Trang chủ bắt buộc có hero video.
3. Không làm e-commerce đầy đủ ở phase này.
4. Ưu tiên hiệu suất, giao diện sạch, CTA rõ, dễ mở rộng về sau.

## Việc cần làm

### A. Homepage
Thiết kế lại homepage theo cấu trúc:
1. Hero video
2. Nhóm sản phẩm chính
3. Ứng dụng theo ngành
4. Vì sao chọn chúng tôi
5. Thương hiệu / cam kết / năng lực
6. CTA cuối trang

#### Yêu cầu hero section
- dùng video local trong `public/videos`
- `autoplay`, `muted`, `loop`, `playsInline`
- có poster image fallback
- overlay tối nhẹ để chữ dễ đọc
- headline ngắn, chuyên nghiệp
- 2 CTA: **Tra mã nhanh** và **Liên hệ tư vấn**
- không dùng slider nặng
- không thêm animation rườm rà

### B. Product / Industry Structure
Tạo hoặc refactor template cho:
- trang danh mục sản phẩm
- trang ứng dụng theo ngành
- trang chi tiết sản phẩm mẫu

Mỗi trang chi tiết cần có:
- tiêu đề rõ
- mô tả ngắn
- khối ứng dụng
- khối lợi ích / điểm mạnh
- CTA báo giá / tư vấn kỹ thuật

### C. Reuse Assets
- Ưu tiên dùng ảnh/logo/asset sẵn có trong repo
- Chỉ thêm asset mới khi thật cần
- Không sinh thêm quá nhiều ảnh AI

### D. Performance
- Nén video hero hợp lý
- Dùng `next/image` cho ảnh
- Không để homepage quá nặng
- Tránh thư viện mới nếu không thật cần

### E. Content Style
- Ngôn ngữ ngắn, chắc, công nghiệp, chuyên nghiệp
- Không dùng câu quá dài
- Tiêu đề gọn, nhìn sạch
- CTA rõ, không lặp quá nhiều

### F. Output
Tạo commit theo từng cụm:
1. homepage hero video
2. homepage sections
3. product/industry templates
4. cleanup spacing, wording, CTA

Khi xong:
- ghi rõ file nào đã sửa
- không đụng các phần không liên quan

## Yêu cầu thêm
- Nếu repo hiện có component cũ dùng được, hãy tái sử dụng thay vì viết lại
- Nếu có section rối hoặc lặp, dọn lại cho sạch
- Ưu tiên desktop đẹp và mobile ổn định
- Sau khi xong, liệt kê:
  - phần nào đã hoàn thành
  - phần nào cần asset/video bổ sung
  - phần nào có thể làm ở phase 2

## Checklist triển khai
- [ ] giữ nguyên repo cũ
- [ ] làm hero video trước
- [ ] dọn homepage
- [ ] tạo 3 template chính
- [ ] gắn CTA rõ
- [ ] tối ưu tải trang
- [ ] chưa làm e-shop full

---

By Khương Bình
