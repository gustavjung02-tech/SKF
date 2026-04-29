# Content Architecture Plan – THL-web

## Trạng thái hiện tại (Phase 1 – Static)

Toàn bộ nội dung web đang nằm ở static files, chưa có CMS.

### Data sources

| File | Nội dung | Dùng ở đâu |
|---|---|---|
| `src/data/site-content.ts` | Hero text, product groups, customer segments, quote guide, testimonials, solutions | Homepage, Giới thiệu, Sản phẩm, Tra mã, Giải pháp |
| `src/data/brand-logos.ts` | Brand logo list, product group → brand mapping | Homepage, Giải pháp |
| `src/data/posts.ts` + `posts.json` | Blog posts (hardcoded) | Homepage (latest posts), Kiến thức |
| `src/config/site.ts` | Site metadata, nav links, contact info | Layout, SEO |

### Asset structure

```
public/images/
├── backgrounds/     ← hero bg, CTA bg
├── branding/        ← logo, OG image, hero illustration
├── brands/          ← partner brand logos
└── industry/        ← industry illustration
```

### Catalog / Assistant data

| Folder | Nội dung |
|---|---|
| `src/data/catalog/` | master-catalog, fitment, technical rules, symptom rules, prompt examples |
| `src/lib/assistant/` | System prompt, policies, reply templates, intent parser, discovery flow |

## Phần nào nên đưa lên CMS (tương lai)

| Nội dung | Lý do |
|---|---|
| Blog / Kiến thức | Bài viết nhiều, cần editor không biết code |
| FAQ | Thay đổi thường xuyên |
| Brand pages | Thông tin brand có thể update bởi marketing |
| Product group descriptions | Nội dung dài, cần chỉnh sửa linh hoạt |
| Landing sections / Hero banners | A/B test, campaign-specific |
| Case study | Content marketing |
| Testimonials | Thu thập từ khách hàng |

## Phần KHÔNG nên đưa lên CMS

| Nội dung | Lý do |
|---|---|
| Chatbot logic (system prompt, policies, reply templates) | Cần version control chặt, review code |
| Catalog data (master-catalog, fitment, technical rules) | Structured data cần validate schema |
| Intent parser / discovery flow | Business logic, không phải content |
| API routes | Infrastructure code |
| SEO config | Cần developer kiểm soát |

## Kết luận

Phase 1 giữ static data. Khi blog/kiến thức cần scale (>20 bài), đó là thời điểm hợp lý để bắt đầu Sanity integration (xem `sanity-phase-2-plan.md`).
