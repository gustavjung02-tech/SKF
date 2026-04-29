# Truyền Động Công Nghiệp

Website tư vấn vật tư truyền động cho nhà máy và khách công nghiệp.
Tập trung vào tra mã nhanh, tiếp nhận nhu cầu và hỗ trợ chọn đúng nhóm hàng theo ứng dụng thực tế.

---

## Mục tiêu

- Tra mã vòng bi, gối đỡ, dây curoa, phớt, khớp nối qua chatbot AI
- Hướng dẫn đúng mã khi chưa biết (discovery flow — tối đa 3 bước)
- Tiếp nhận yêu cầu báo giá qua form, Zalo, gọi điện

---

## Công nghệ

| Lớp | Stack |
|---|---|
| Framework | Next.js 14 · App Router · TypeScript |
| UI | Tailwind CSS · shadcn/ui |
| Form | react-hook-form · zod |
| AI | OpenAI Responses API · Gemini API · function calling |
| Dữ liệu | JSON catalog · JSON blog |

---

## Routes

| Route | Mô tả |
|---|---|
| `/` | Trang chủ |
| `/san-pham` | Danh mục sản phẩm |
| `/san-pham/[slug]` | Chi tiết nhóm hàng |
| `/giai-phap-theo-khach-hang` | Giải pháp theo khách hàng |
| `/tra-ma-bao-gia` | Tra mã & báo giá |
| `/kien-thuc` | Bài viết kỹ thuật |
| `/gioi-thieu` | Giới thiệu |
| `/lien-he` | Liên hệ |
| `/studio` | Redirect đến Sanity Studio riêng khi cấu hình `STUDIO_EXTERNAL_URL` |

---

## Chatbot tra mã

- Bubble góc phải dưới, gọi AI qua `/api/assistant`
- Hỗ trợ cả OpenAI và Gemini (chọn qua env)
- Nhận input: mã cũ · kích thước · ứng dụng · triệu chứng
- Parse ngữ cảnh câu cụt, shorthand
- Discovery flow ngắn nếu thiếu dữ liệu
- Đối chiếu catalog nội bộ → trả structured output
- **Không** báo giá tự động · **không** tự kết luận tồn kho

---

## Cấu hình

Site config: `src/config/site.ts`

---

## Biến môi trường

```env
# Provider (mặc định: openai)
ASSISTANT_PROVIDER=openai          # hoặc gemini

# OpenAI
OPENAI_API_KEY=<your_key>
OPENAI_MODEL=gpt-4o-mini

# Gemini (chỉ cần nếu ASSISTANT_PROVIDER=gemini)
GEMINI_API_KEY=<your_key>
GEMINI_MODEL=gemini-2.5-flash

# Debug — hiện provider đang dùng trên chat UI
NEXT_PUBLIC_SHOW_ASSISTANT_PROVIDER=false

# Form email (bắt buộc cho submit form liên hệ/lead)
RESEND_API_KEY=<your_key>
FORM_MAIL_TO=khuongbinh.info@gmail.com

# Bắt buộc trên Cloudflare/production
FORM_MAIL_FROM="THL B2B <noreply@mail.your-domain.com>"

# Khuyến nghị để logo trong email dùng đúng domain live
FORM_ASSET_BASE_URL=https://luanphutung.vn

# Tuỳ chọn khi tách Studio khỏi app Cloudflare chính
STUDIO_EXTERNAL_URL=https://studio.your-domain.com
```

> **Lưu ý:**
> - `ASSISTANT_PROVIDER=gemini` → dùng Gemini, tự fallback về OpenAI nếu Gemini lỗi.
> - Thiếu API key → site vẫn chạy, chatbot trả lỗi graceful.
> - `FORM_MAIL_FROM` không nên dùng `onboarding@resend.dev` khi chạy production. Hãy verify domain gửi trong Resend trước khi deploy.
> - Khi giữ web chính trên Cloudflare, nên tách Sanity Studio sang URL riêng rồi đặt `STUDIO_EXTERNAL_URL`; không nên embed `next-sanity/studio` trực tiếp vào cùng worker.

---

## Catalog demo

| File | Vai trò |
|---|---|
| `src/data/catalog/master-catalog.json` | Catalog chính |
| `src/data/catalog/equivalent-map.json` | Bảng mã tương đương |
| `src/data/catalog/brand-whitelist.json` | Whitelist nhãn hàng |
| `src/data/catalog/technical-rules.json` | Luật kỹ thuật |

> Dữ liệu mẫu — chưa phải catalog vận hành.

---

## Phát triển local

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run build
npm run start
```

> Yêu cầu Node.js 18.17+.

---

## Deploy

```bash
vercel --prod
```

Hoặc import repo từ Vercel dashboard.

### Cloudflare Workers

Repo này đã được chuẩn bị để deploy theo adapter OpenNext của Cloudflare, không dùng `next-on-pages` cũ nữa.

Với Cloudflare, phương án ổn định để vẫn giữ Studio là:

1. Web chính chạy trên Cloudflare Workers.
2. Sanity Studio deploy riêng bằng `pnpm studio:deploy` hoặc host ở subdomain riêng.
3. Route `/studio` của web chính chỉ redirect sang `STUDIO_EXTERNAL_URL`.

1. Cài dependencies mới:

```bash
pnpm install
```

2. Tạo và verify domain gửi mail trong Resend bằng DNS trên Cloudflare.

3. Khai báo env trên Cloudflare Workers/Pages:

```env
RESEND_API_KEY=...
FORM_MAIL_TO=khuongbinh.info@gmail.com
FORM_MAIL_FROM=THL B2B <noreply@mail.your-domain.com>
FORM_ASSET_BASE_URL=https://luanphutung.vn
STUDIO_EXTERNAL_URL=https://studio.your-domain.com
OPENAI_API_KEY=... # hoặc GEMINI_API_KEY nếu dùng Gemini
```

### Sanity Studio riêng

Chạy local:

```bash
pnpm studio:dev
```

Deploy Studio riêng:

```bash
pnpm studio:deploy
```

Sau khi có URL Studio riêng, set `STUDIO_EXTERNAL_URL` trên Cloudflare để `/studio` tự chuyển hướng sang đó.

4. Preview local bằng runtime Cloudflare:

```bash
pnpm preview
```

5. Deploy:

```bash
pnpm deploy
```

Nếu đang dùng build command cũ `npx @cloudflare/next-on-pages@1`, hãy đổi sang script OpenNext hoặc pipeline `pnpm deploy`.

---

## Nâng cấp tiếp theo

- Form → CRM / Google Sheet
- Upload ảnh → S3 / Cloudinary
- Blog → Sanity hoặc MDX
- Tracking conversion (gọi / Zalo / form)
