export type CardImageMeta = {
  slug: string;
  imagePrompt: string;
  imageAlt: string;
  imagePath: string;
  imageStyleTag: string;
};

export const GLOBAL_STYLE_SUFFIX =
  "realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio";

export const productCardImages: CardImageMeta[] = [
  {
    slug: "vong-bi-skf",
    imagePrompt:
      "Kỹ thuật viên kiểm tra vòng bi công nghiệp SKF tại xưởng sản xuất, phía sau là máy móc và kệ vật tư, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Kỹ thuật viên kiểm tra vòng bi SKF trong xưởng sản xuất",
    imagePath: "/images/cards/product-vong-bi.webp",
    imageStyleTag: "product-hero",
  },
  {
    slug: "goi-do-skf",
    imagePrompt:
      "Cụm gối đỡ SKF gắn trên trục truyền động trong nhà máy, close-up rõ sản phẩm và bối cảnh ứng dụng thực tế, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Cụm gối đỡ SKF lắp trên trục truyền động trong dây chuyền nhà máy",
    imagePath: "/images/cards/product-goi-do.webp",
    imageStyleTag: "product-hero",
  },
  {
    slug: "phot-skf",
    imagePrompt:
      "Phớt SKF và vị trí làm kín trên trục máy công nghiệp, technical but realistic, clean background, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Phớt SKF dùng cho cụm trục và hộp số công nghiệp",
    imagePath: "/images/card-kien-thuc-sai-phot-chan-dau.png",
    imageStyleTag: "product-hero",
  },
  {
    slug: "boi-tron-skf-lincoln",
    imagePrompt:
      "Khu vực bảo trì nhà máy với mỡ công nghiệp SKF/Lincoln và điểm bôi trơn trên cụm máy, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Mỡ và hệ thống bôi trơn SKF/Lincoln dùng cho bảo trì nhà máy",
    imagePath: "/images/backgrounds/he-sinh-thai-home.jpeg",
    imageStyleTag: "product-hero",
  },
  {
    slug: "dung-cu-bao-tri-skf",
    imagePrompt:
      "Dụng cụ bảo trì SKF dùng để tháo lắp, căn chỉnh và kiểm tra thiết bị quay trong xưởng công nghiệp, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Dụng cụ bảo trì SKF trong khu vực bảo trì nhà máy",
    imagePath: "/images/giai-phap-khach-hang-hero.png",
    imageStyleTag: "product-hero",
  },
  {
    slug: "truyen-dong-skf",
    imagePrompt:
      "Cụm truyền động SKF trên dây chuyền công nghiệp, thấy rõ bánh đai, trục và bộ phận truyền lực đang lắp thực tế, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Cụm truyền động SKF trên dây chuyền sản xuất",
    imagePath: "/images/card-ung-dung-bang-tai-truyen-dong.png",
    imageStyleTag: "product-hero",
  },
];

export const solutionCardImages: CardImageMeta[] = [
  {
    slug: "bao-tri",
    imagePrompt:
      "Nhân sự bảo trì kiểm tra cụm máy, cầm mẫu linh kiện thay thế trong xưởng công nghiệp, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Nhân viên bảo trì nhà máy kiểm tra cụm máy và linh kiện thay thế",
    imagePath: "/images/cards/solutions/bao-tri.png",
    imageStyleTag: "solution-role",
  },
  {
    slug: "ky-thuat",
    imagePrompt:
      "Kỹ thuật viên đo kích thước trục và kiểm tra cụm ổ trục bằng thước kẹp, realistic factory environment, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Kỹ thuật viên đo kích thước trục và kiểm tra cụm ổ trục trong nhà máy",
    imagePath: "/images/cards/solutions/ky-thuat.png",
    imageStyleTag: "solution-role",
  },
  {
    slug: "mua-hang",
    imagePrompt:
      "Nhân sự mua hàng kỹ thuật đối chiếu mã, catalog, tem hàng và danh sách vật tư trên bàn làm việc công nghiệp, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Nhân viên mua hàng kỹ thuật đối chiếu mã và catalog vật tư tại bàn làm việc",
    imagePath: "/images/cards/solutions/mua-hang.png",
    imageStyleTag: "solution-role",
  },
  {
    slug: "chu-xuong",
    imagePrompt:
      "Chủ xưởng và kỹ thuật trao đổi nhanh trước cụm máy sản xuất, industrial realistic, professional, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Chủ xưởng và kỹ thuật viên trao đổi trước cụm máy sản xuất",
    imagePath: "/images/cards/solutions/chu-xuong.png",
    imageStyleTag: "solution-role",
  },
];

export const industryCardImages: CardImageMeta[] = [
  {
    slug: "may-go",
    imagePrompt:
      "Máy cưa gỗ công nghiệp đang vận hành trong xưởng gỗ, thấy rõ trục quay và hệ truyền động, bụi gỗ nhẹ trong không khí, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Máy cưa gỗ công nghiệp đang vận hành với trục quay và hệ truyền động",
    imagePath: "/images/cards/industry/may-go.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "cnc",
    imagePrompt:
      "Máy phay CNC đang gia công kim loại, close-up trục chính quay tốc độ cao với phoi kim loại, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Máy phay CNC đang gia công kim loại, trục chính quay tốc độ cao",
    imagePath: "/images/cards/industry/cnc.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "ep-nhua",
    imagePrompt:
      "Máy ép nhựa công nghiệp trong nhà máy, thấy rõ cụm kẹp và hệ thống thủy lực đang vận hành, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Máy ép nhựa công nghiệp với cụm kẹp và hệ thống thủy lực",
    imagePath: "/images/cards/industry/ep-nhua.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "bom-quat-dong-co",
    imagePrompt:
      "Cụm bơm nước công nghiệp và quạt hút gió trong nhà máy, thấy rõ motor điện và cụm truyền động dây curoa, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Cụm bơm nước và quạt công nghiệp với motor và truyền động dây curoa",
    imagePath: "/images/cards/industry/bom-quat-dong-co.png",
    imageStyleTag: "industry-app",
  },
  {
    slug: "bang-tai-truyen-dong",
    imagePrompt:
      "Hệ băng tải và con lăn trong dây chuyền sản xuất, thấy rõ cụm truyền động và gối đỡ trục, " +
      GLOBAL_STYLE_SUFFIX,
    imageAlt: "Hệ băng tải và con lăn trong dây chuyền sản xuất công nghiệp",
    imagePath: "/images/cards/industry/bang-tai-truyen-dong.png",
    imageStyleTag: "industry-app",
  },
];

const allCardImages = [
  ...productCardImages,
  ...solutionCardImages,
  ...industryCardImages,
];

const imageBySlug = new Map(allCardImages.map((img) => [img.slug, img]));

export function getCardImage(slug: string): CardImageMeta | undefined {
  return imageBySlug.get(slug);
}

export function getAllImagePrompts(): { slug: string; prompt: string; targetPath: string }[] {
  return allCardImages.map((img) => ({
    slug: img.slug,
    prompt: img.imagePrompt,
    targetPath: img.imagePath,
  }));
}
