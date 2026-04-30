Nhiệm vụ: Tối ưu hiển thị kết quả tìm kiếm SKF và cập nhật SEO theo domain mới skf-congnghiep.info. KHÔNG chạy pnpm build. KHÔNG commit. KHÔNG push. Sau khi sửa chỉ báo file đã sửa và git diff --stat.

Mục tiêu:
1. Kết quả tra mã / tìm kiếm SKF phải hiển thị ảnh cố định theo nhóm sản phẩm.
2. Không dùng ảnh remote/crawl linh tinh theo từng mã sản phẩm.
3. Không để card kết quả bị trống ảnh hoặc ảnh không đồng bộ.
4. Cập nhật SEO tốt hơn cho domain mới:
   https://skf-congnghiep.info
5. Text SEO phải chuyên nghiệp, B2B công nghiệp, không ghi nhận sai vai trò chính thức của SKF.

PHẦN A — Cố định ảnh trong kết quả tìm kiếm

File ưu tiên:
- src/components/skf/skf-search-quote-experience.tsx
- hoặc component card kết quả tìm kiếm SKF nếu đã tách riêng.

Yêu cầu:
1. Mỗi kết quả tìm kiếm nên có thumbnail ảnh nhỏ cố định theo nhóm sản phẩm.
2. Không lấy ảnh từ sourceUrl/image từng mã nếu ảnh đó không chắc chắn hoặc làm giao diện rối.
3. Tạo mapping ảnh theo productGroup/productGroupLabel/category:

Ví dụ mapping:
- Vòng bi SKF -> hero hoặc image nhóm vòng bi
- Gối đỡ SKF -> image nhóm gối đỡ
- Phớt SKF -> image nhóm phớt
- Mỡ bôi trơn SKF -> image nhóm bôi trơn
- Hệ thống bôi trơn SKF/Lincoln -> image nhóm bôi trơn
- Dụng cụ bảo trì SKF -> image nhóm dụng cụ bảo trì
- Truyền động SKF -> image nhóm truyền động
- fallback -> ảnh hero sản phẩm SKF

Tên file ảnh gợi ý, tự tìm trong repo theo tên gần đúng nếu có:
- hero-san-pham-skf.png
- hero-tra-ma-skf.png
- hero-home-skf-main.png
- hero-ung-dung-nganh-skf.png

Nếu repo chưa có ảnh nhóm chi tiết, dùng tạm:
- Vòng bi / Gối đỡ / Phớt / Truyền động -> hero-san-pham-skf.png
- Tra mã / fallback -> hero-tra-ma-skf.png
- Ứng dụng -> hero-ung-dung-nganh-skf.png

4. UI card kết quả:
- Ảnh thumbnail nằm bên trái hoặc trên cùng tùy mobile/desktop.
- Desktop: thumbnail khoảng 72x72 hoặc 88x88.
- Mobile: thumbnail khoảng 56x56 hoặc 64x64.
- Ảnh bo góc, object-cover hoặc object-contain tùy ảnh, không méo.
- Card phải gọn, chuyên nghiệp.
- Không để mỗi card quá dài.
- Không hiển thị "Normalized" cho khách.

5. Text card kết quả nên gọn:
- Mã sản phẩm
- Nhóm / Loại sản phẩm
- Ứng dụng ngắn nếu có
- Thông số d/D/B nếu có
- Checkbox hoặc nút "Chọn báo giá"

6. Không sửa data.
7. Không import JSON trực tiếp.
8. Không tạo route chi tiết sản phẩm.
9. Không dùng ảnh cũ NTN/Koyo/Tsubaki/NOK.

PHẦN B — Cập nhật domain và SEO

Domain chính:
https://skf-congnghiep.info

Tìm và cập nhật trong các file cấu hình SEO/site nếu có:
- src/config/site.ts
- src/app/layout.tsx
- src/app/(site)/layout.tsx nếu có
- metadata trong các page
- sitemap/robots nếu có
- next-sitemap config nếu có
- env example nếu có biến site URL

Yêu cầu cập nhật:
1. siteUrl/baseUrl/canonical base:
https://skf-congnghiep.info

2. Tên site:
SKF Công Nghiệp

3. SEO title chính:
SKF Công Nghiệp - Tra mã, tư vấn và báo giá sản phẩm SKF

4. SEO description chính:
Tra mã sản phẩm SKF theo mã, nhóm sản phẩm và thông số d/D/B. Hỗ trợ tư vấn vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động cho nhà máy công nghiệp.

5. Keywords nên dùng nếu hệ thống có:
- SKF công nghiệp
- tra mã SKF
- vòng bi SKF
- gối đỡ SKF
- phớt SKF
- mỡ bôi trơn SKF
- dụng cụ bảo trì SKF
- báo giá SKF
- sản phẩm SKF cho nhà máy
- phụ tùng công nghiệp SKF

6. OpenGraph:
- siteName: SKF Công Nghiệp
- type: website
- locale: vi_VN
- url: https://skf-congnghiep.info
- title: SKF Công Nghiệp - Tra mã và báo giá sản phẩm SKF
- description: Tra mã, lọc nhóm sản phẩm và gửi yêu cầu báo giá SKF nhanh cho nhu cầu bảo trì, thay thế và vận hành nhà máy.
- image: dùng ảnh hero hoặc og image phù hợp nếu có.

7. Twitter card nếu có:
- card: summary_large_image
- title/description giống OpenGraph

8. Canonical:
- Trang chủ canonical: https://skf-congnghiep.info
- /tra-ma-bao-gia canonical: https://skf-congnghiep.info/tra-ma-bao-gia
- /san-pham canonical: https://skf-congnghiep.info/san-pham
- /ung-dung canonical: https://skf-congnghiep.info/ung-dung
- /kien-thuc canonical: https://skf-congnghiep.info/kien-thuc
- /lien-he canonical: https://skf-congnghiep.info/lien-he

9. Không ghi các câu sau nếu chưa có chứng nhận:
- Nhà phân phối chính thức SKF
- Đại lý chính thức SKF
- SKF Official
- Authorized Distributor
- SKF Việt Nam

10. Wording an toàn:
- "Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành."
- "Website tra mã và tiếp nhận yêu cầu báo giá sản phẩm SKF cho khách hàng công nghiệp."
- "Không phải website chính thức của SKF Group" nếu có phần disclaimer/footer phù hợp.

PHẦN C — Text hero / SEO visible text

Tối ưu text trang chủ và trang tra mã nếu còn dài/rối:

Trang chủ:
H1:
"SKF Công Nghiệp cho nhà máy hiện đại"

Description:
"Tra mã, chọn nhóm sản phẩm và gửi yêu cầu báo giá nhanh cho vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động."

Trang tra mã:
H1:
"Tra mã SKF nhanh và gửi yêu cầu báo giá"

Description:
"Tìm theo mã, nhóm sản phẩm hoặc thông số d / D / B-T. Chọn nhiều mã và gửi yêu cầu qua Zalo."

Sản phẩm:
H1:
"Sản phẩm SKF theo nhóm ứng dụng"

Description:
"Tổng hợp vòng bi, gối đỡ, phớt, bôi trơn, dụng cụ bảo trì và truyền động phục vụ nhà máy công nghiệp."

PHẦN D — Kết quả cuối

Sau khi sửa xong:
- Không chạy pnpm build
- Không commit
- Không push
- Chỉ báo:
  1. file đã sửa
  2. ảnh nào đang dùng cho result card
  3. domain/SEO đã cập nhật ở đâu
  4. git diff --stat