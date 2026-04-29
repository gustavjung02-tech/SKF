import { resolveProductCardImage } from "@/lib/image-resolver";

type ProductVisual = {
  image: string;
  imageAlt: string;
};

const productVisualMeta: Record<string, { fallback: string; imageAlt: string }> = {
  ntn: {
    fallback: "/images/cards/products/ntn.png",
    imageAlt: "Vòng bi SKF trong khu vực bảo trì nhà máy",
  },
  tsubaki: {
    fallback: "/images/cards/products/tsubaki.png",
    imageAlt: "Nhóm truyền động SKF cho băng tải công nghiệp",
  },
  koyo: {
    fallback: "/images/cards/products/koyo.png",
    imageAlt: "Gối đỡ SKF trong dây chuyền công nghiệp",
  },
  nok: {
    fallback: "/images/cards/products/nok.png",
    imageAlt: "Phớt SKF cho cụm làm kín trục và hộp số",
  },
  soho: {
    fallback: "/images/cards/products/soho.png",
    imageAlt: "Vật tư bảo trì công nghiệp theo ứng dụng thực tế",
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
