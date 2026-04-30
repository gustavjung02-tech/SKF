import { resolveProductCardImage } from "@/lib/image-resolver";

type ProductVisual = {
  image: string;
  imageAlt: string;
};

const productVisualMeta: Record<string, { fallback: string; imageAlt: string }> = {
  "vong-bi-skf": {
    fallback: "/images/cards/product-vong-bi.webp",
    imageAlt: "Vòng bi SKF trong khu vực bảo trì nhà máy",
  },
  "goi-do-skf": {
    fallback: "/images/cards/product-goi-do.webp",
    imageAlt: "Gối đỡ SKF trong dây chuyền công nghiệp",
  },
  "phot-skf": {
    fallback: "/images/card-kien-thuc-sai-phot-chan-dau.png",
    imageAlt: "Phớt SKF cho cụm làm kín trục và hộp số",
  },
  "boi-tron-skf-lincoln": {
    fallback: "/images/backgrounds/he-sinh-thai-home.jpeg",
    imageAlt: "Mỡ và hệ thống bôi trơn SKF Lincoln trong nhà máy",
  },
  "dung-cu-bao-tri-skf": {
    fallback: "/images/giai-phap-khach-hang-hero.png",
    imageAlt: "Dụng cụ bảo trì SKF trong môi trường nhà máy",
  },
  "truyen-dong-skf": {
    fallback: "/images/card-ung-dung-bang-tai-truyen-dong.png",
    imageAlt: "Nhóm truyền động SKF cho băng tải công nghiệp",
  },
};

export const productVisuals: Record<string, ProductVisual> = Object.fromEntries(
  Object.entries(productVisualMeta).map(([slug, meta]) => [
    slug,
    {
      image: resolveProductCardImage(slug, meta.fallback),
      imageAlt: meta.imageAlt,
    },
  ]),
);

export const defaultProductVisual: ProductVisual = {
  image: "/images/backgrounds/he-sinh-thai-home.jpeg",
  imageAlt: "Vật tư truyền động công nghiệp trong nhà máy",
};

export function getProductVisual(slug: string) {
  return productVisuals[slug] ?? defaultProductVisual;
}

export const productBenefitBullets = [
  "Đối chiếu theo mã cũ, kích thước và vị trí lắp thực tế",
  "Khoanh nhanh theo nhóm sản phẩm SKF và điều kiện vận hành",
  "Ưu tiên phương án xử lý nhanh cho nhà máy cần tiến độ",
];
