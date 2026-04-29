# Sanity Phase 2 Plan – THL-web

> Blueprint only. Không cài packages hay tạo config ở phase này.

## 1. Khi nào nên bắt đầu dùng Sanity

| Trigger | Giải thích |
|---|---|
| Blog/kiến thức > 20 bài | Hardcoded posts.json không scale, editor cần giao diện soạn |
| Cần case study / landing page campaign | Marketing tự tạo page mà không cần deploy |
| FAQ thay đổi thường xuyên | Tránh mỗi lần sửa FAQ phải commit code |
| Brand pages cần rich content | Logo + mô tả + chính sách brand cần người marketing cập nhật |
| Product group pages cần editor | Các mô tả nhóm hàng dài, cần format linh hoạt |

## 2. Những phần KHÔNG nên đưa lên Sanity

| Phần | Lý do giữ trong code |
|---|---|
| Chatbot core logic | System prompt, policies, reply templates – cần code review, version control |
| Assistant prompt engineering | Prompt thay đổi ảnh hưởng trực tiếp đến chất lượng output |
| Route API (`src/app/api/`) | Infrastructure, không phải content |
| Technical rules / fitment logic | `src/data/catalog/` – structured data cần schema validation |
| Intent parser / discovery flow | Business logic phức tạp, không thể edit qua CMS |
| SEO metadata base | `src/config/site.ts` – cần developer control |

## 3. Schema dự kiến cho Phase 2

### post
```
{
  title: string
  slug: slug
  excerpt: string
  body: blockContent (portable text)
  coverImage: image
  category: reference → category
  publishedAt: datetime
  author: string
  seo: { metaTitle, metaDescription, ogImage }
}
```

### category
```
{
  title: string
  slug: slug
  description: string
}
```

### faq
```
{
  question: string
  answer: blockContent
  category: string
  order: number
}
```

### brand
```
{
  name: string
  slug: slug
  logo: image
  description: blockContent
  productGroups: array of reference → productGroup
  priority: number
  status: "active" | "reference_only"
}
```

### productGroup
```
{
  title: string
  slug: slug
  description: blockContent
  icon: image
  brands: array of reference → brand
  features: array of string
}
```

### landingSection
```
{
  key: string (unique identifier)
  title: string
  subtitle: string
  body: blockContent
  cta: { label, href }
  backgroundImage: image
  order: number
}
```

### heroBanner
```
{
  title: string
  subtitle: string
  backgroundImage: image
  cta: { label, href }
  isActive: boolean
}
```

### contactBlock
```
{
  companyName: string
  phone: string
  email: string
  address: string
  mapEmbed: text
  workingHours: string
}
```

## 4. Packages cần cài khi bắt đầu Phase 2

```bash
npm i sanity next-sanity @sanity/client @sanity/image-url
npm i -D @sanity/vision
```

## 5. Files cần tạo khi bắt đầu Phase 2

```
sanity.config.ts           ← studio config
sanity.cli.ts              ← CLI config
src/sanity/
├── schemas/               ← schema definitions cho 8 types trên
├── lib/
│   ├── client.ts          ← sanity client (projectId, dataset, apiVersion)
│   └── queries.ts         ← GROQ queries
└── env.ts                 ← env validation
src/app/studio/
└── [[...tool]]/
    └── page.tsx           ← embedded Sanity Studio
.env.local                 ← NEXT_PUBLIC_SANITY_PROJECT_ID, DATASET, API_VERSION, TOKEN
```

## 6. Migration plan

1. Tạo Sanity project trên sanity.io
2. Cài packages + tạo config/schema files
3. Import content từ `posts.json` → Sanity documents
4. Tạo GROQ queries thay static imports
5. Thay `blogPosts` import trong `page.tsx` và `kien-thuc/page.tsx` bằng fetch
6. Test preview mode
7. Dần chuyển thêm: FAQ, brand pages, product groups
