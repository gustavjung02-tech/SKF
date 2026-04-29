import { resolveBrandLogo } from "@/lib/image-resolver";

export type BrandLogo = {
  id: string;
  name: string;
  src: string;
  alt: string;
  role: "core" | "supporting";
};

export const brandLogos: BrandLogo[] = [
  {
    id: "ntn",
    name: "NTN",
    src: resolveBrandLogo("ntn", "/images/brands/ntn-logo.png"),
    alt: "Logo NTN",
    role: "core",
  },
  {
    id: "tsubaki",
    name: "Tsubaki",
    src: resolveBrandLogo("tsubaki", "/images/brands/tsubaki-logo.png"),
    alt: "Logo Tsubaki",
    role: "core",
  },
  {
    id: "koyo",
    name: "Koyo",
    src: resolveBrandLogo("koyo", "/images/brands/koyo-logo.png"),
    alt: "Logo Koyo",
    role: "supporting",
  },
  {
    id: "nok",
    name: "NOK",
    src: resolveBrandLogo("nok", "/images/brands/nok-corporation.png"),
    alt: "Logo NOK",
    role: "supporting",
  },
  {
    id: "soho",
    name: "Soho",
    src: resolveBrandLogo("soho", "/images/brands/soho-logo-transparent.png"),
    alt: "Logo Soho V-Belt",
    role: "supporting",
  },
];

export function getBrandLogoById(id: string) {
  return brandLogos.find((brand) => brand.id === id);
}

export function getCoreBrandLogos() {
  return ["ntn", "tsubaki"].map((id) => getBrandLogoById(id)).filter((brand): brand is BrandLogo => Boolean(brand));
}

export const brandDescriptions: Record<string, string> = {
  ntn: "Nhật Bản chính hãng · Vòng bi",
  tsubaki: "Nhật Bản chính hãng · Xích truyền động",
  koyo: "Phân phối chính thức · Vòng bi, gối đỡ",
  nok: "Ứng dụng công nghiệp · Phớt làm kín",
  soho: "Ứng dụng công nghiệp · Vật tư truyền động",
};

export const productGroupBrandMap: Record<string, string[]> = {
  ntn: ["ntn"],
  tsubaki: ["tsubaki"],
  koyo: ["koyo"],
  nok: ["nok"],
  soho: ["soho"],
};

export const customerSolutionBrandMap: Record<string, string[]> = {
  "Nhà máy sản xuất": ["ntn", "tsubaki", "koyo", "nok"],
  "Bộ phận bảo trì": ["ntn", "tsubaki", "koyo", "nok"],
  "Bộ phận kỹ thuật": ["ntn", "tsubaki", "koyo", "nok"],
  "Bộ phận mua hàng": ["ntn", "tsubaki", "soho", "nok"],
  "Xưởng cơ khí trong KCN": ["ntn", "tsubaki", "koyo"],
  "Xưởng chế tạo máy": ["ntn", "tsubaki", "koyo"],
  "Nhà thầu cơ điện / lắp đặt công nghiệp": ["tsubaki", "ntn", "soho"],
  "Khách công nghiệp cần thay thế định kỳ": ["ntn", "tsubaki", "koyo", "nok"],
};
