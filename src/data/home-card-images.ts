/**
 * Chuẩn hóa ảnh card homepage – mỗi card có prompt ảnh riêng theo title + summary.
 *
 * Style chung toàn site:
 * - industrial, realistic or semi-realistic
 * - clean lighting, professional B2B
 * - no cartoon, no oversized logos, no poster-style collage
 */

export type CardImageMeta = {
  /** Slug khớp với card data tương ứng */
  slug: string;
  /** Prompt dùng cho AI image generation */
  imagePrompt: string;
  /** Alt text chuẩn SEO cho thẻ <img> */
  imageAlt: string;
  /** Đường dẫn ảnh trong /public – sẽ được cập nhật khi sinh ảnh mới */
  imagePath: string;
  /** Tag phân loại style ảnh */
  imageStyleTag: string;
};

// ─── Style suffix chung gắn cuối mỗi prompt ───────────────────────────────
export const GLOBAL_STYLE_SUFFIX =
  "realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CỤM 1 – Nhóm sản phẩm chính (productEntryCards)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const productCardImages: CardImageMeta[] = [
  {
    slug: "ntn",
    imagePrompt:
      "Kỹ thuật viên kiểm tra vòng bi Nhật NTN tại xưởng công nghiệp, phía sau là máy móc và kệ vật tư, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Kỹ thuật viên kiểm tra vòng bi NTN trong xưởng sản xuất",
    imagePath: "/images/cards/products/ntn.png",
    imageStyleTag: "product-hero",
  },
  {
    slug: "koyo",
    imagePrompt:
      "Cụm vòng bi và gối đỡ Koyo gắn trên trục truyền động trong nhà máy, close-up rõ sản phẩm và bối cảnh ứng dụng thực tế, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Cụm vòng bi và gối đỡ Koyo lắp trên trục truyền động trong dây chuyền nhà máy",
    imagePath: "/images/cards/products/koyo.png",
    imageStyleTag: "product-hero",
  },
  {
    slug: "tsubaki",
    imagePrompt:
      "Cụm truyền động xích Tsubaki trên dây chuyền công nghiệp, thấy rõ xích và nhông đang lắp thực tế, no oversized logo, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Cụm truyền động xích Tsubaki trên dây chuyền sản xuất",
    imagePath: "/images/cards/products/tsubaki.png",
    imageStyleTag: "product-hero",
  },
  {
    slug: "soho",
    imagePrompt:
      "Khu vực bảo trì nhà máy với dây curoa và vật tư truyền động Soho được sắp xếp gọn trên bàn kỹ thuật, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Vật tư truyền động Soho dùng cho bảo trì nhà máy",
    imagePath: "/images/cards/products/soho.png",
    imageStyleTag: "product-hero",
  },
  {
    slug: "nok",
    imagePrompt:
      "Ảnh phớt chặn dầu NOK và vị trí làm kín trên trục máy công nghiệp, technical but realistic, clean background, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Phớt chặn dầu NOK dùng cho cụm trục và hộp số công nghiệp",
    imagePath: "/images/cards/products/nok.png",
    imageStyleTag: "product-hero",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CỤM 2 – Giải pháp theo vai trò (solutionEntryCards)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const solutionCardImages: CardImageMeta[] = [
  {
    slug: "bao-tri",
    imagePrompt:
      "Nhân sự bảo trì kiểm tra cụm máy, cầm mẫu linh kiện thay thế trong xưởng công nghiệp, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Nhân viên bảo trì nhà máy kiểm tra cụm máy và linh kiện thay thế",
    imagePath: "/images/cards/solutions/bao-tri.png",
    imageStyleTag: "solution-role",
  },
  {
    slug: "ky-thuat",
    imagePrompt:
      "Kỹ thuật viên đo kích thước trục và kiểm tra cụm ổ trục bằng thước kẹp, realistic factory environment, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Kỹ thuật viên đo kích thước trục và kiểm tra cụm ổ trục trong nhà máy",
    imagePath: "/images/cards/solutions/ky-thuat.png",
    imageStyleTag: "solution-role",
  },
  {
    slug: "mua-hang",
    imagePrompt:
      "Nhân sự mua hàng kỹ thuật đối chiếu mã, catalog, tem hàng và danh sách vật tư trên bàn làm việc công nghiệp, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Nhân viên mua hàng kỹ thuật đối chiếu mã và catalog vật tư tại bàn làm việc",
    imagePath: "/images/cards/solutions/mua-hang.png",
    imageStyleTag: "solution-role",
  },
  {
    slug: "chu-xuong",
    imagePrompt:
      "Chủ xưởng và kỹ thuật trao đổi nhanh trước cụm máy sản xuất, industrial realistic, professional, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Chủ xưởng và kỹ thuật viên trao đổi trước cụm máy sản xuất",
    imagePath: "/images/cards/solutions/chu-xuong.png",
    imageStyleTag: "solution-role",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CỤM 3 – Ứng dụng / Ngành máy (industryApplications)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const industryCardImages: CardImageMeta[] = [
  {
    slug: "may-go",
    imagePrompt:
      "Máy cưa gỗ công nghiệp đang vận hành trong xưởng gỗ, thấy rõ trục quay và hệ truyền động, bụi gỗ nhẹ trong không khí, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Máy cưa gỗ công nghiệp đang vận hành với trục quay và hệ truyền động",
    imagePath: "/images/cards/industry/may-go.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "cnc",
    imagePrompt:
      "Máy phay CNC đang gia công kim loại, close-up trục chính quay tốc độ cao với phoi kim loại, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Máy phay CNC đang gia công kim loại, trục chính quay tốc độ cao",
    imagePath: "/images/cards/industry/cnc.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "ep-nhua",
    imagePrompt:
      "Máy ép nhựa công nghiệp trong nhà máy, thấy rõ cụm kẹp và hệ thống thủy lực đang vận hành, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Máy ép nhựa công nghiệp với cụm kẹp và hệ thống thủy lực",
    imagePath: "/images/cards/industry/ep-nhua.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "bom-quat-dong-co",
    imagePrompt:
      "Cụm bơm nước công nghiệp và quạt hút gió trong nhà máy, thấy rõ motor điện và cụm truyền động dây curoa, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Cụm bơm nước và quạt công nghiệp với motor và truyền động dây curoa",
    imagePath: "/images/cards/industry/bom-quat-dong-co.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "bang-tai-truyen-dong",
    imagePrompt:
      "Hệ băng tải xích và con lăn trong dây chuyền sản xuất, thấy rõ nhông xích và gối đỡ trục, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt:
      "Hệ băng tải xích và con lăn trong dây chuyền sản xuất công nghiệp",
    imagePath: "/images/cards/industry/bang-tai-truyen-dong.png",
    imageStyleTag: "industry-app",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: tra cứu nhanh theo slug
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const allCardImages = [
  ...productCardImages,
  ...solutionCardImages,
  ...industryCardImages,
];

const imageBySlug = new Map(allCardImages.map((img) => [img.slug, img]));

export function getCardImage(slug: string): CardImageMeta | undefined {
  return imageBySlug.get(slug);
}

/** Toàn bộ prompt để xuất ra dùng cho sinh ảnh thủ công / batch */
export function getAllImagePrompts(): { slug: string; prompt: string; targetPath: string }[] {
  return allCardImages.map((img) => ({
    slug: img.slug,
    prompt: img.imagePrompt,
    targetPath: img.imagePath,
  }));
}
