export type BrandLogo = {
  id: string;
  name: string;
  src: string;
  alt: string;
  role: "core" | "supporting";
};

const skfLogo = "/images/logo-skf-cong-nghiep-header.png";

export const brandLogos: BrandLogo[] = [
  {
    id: "vong-bi-skf",
    name: "Vòng bi SKF",
    src: skfLogo,
    alt: "SKF Công Nghiệp",
    role: "core",
  },
  {
    id: "goi-do-skf",
    name: "Gối đỡ SKF",
    src: skfLogo,
    alt: "SKF Công Nghiệp",
    role: "core",
  },
  {
    id: "phot-skf",
    name: "Phớt SKF",
    src: skfLogo,
    alt: "SKF Công Nghiệp",
    role: "supporting",
  },
  {
    id: "boi-tron-skf-lincoln",
    name: "Mỡ & hệ thống bôi trơn SKF/Lincoln",
    src: skfLogo,
    alt: "SKF Công Nghiệp",
    role: "supporting",
  },
  {
    id: "dung-cu-bao-tri-skf",
    name: "Dụng cụ bảo trì SKF",
    src: skfLogo,
    alt: "SKF Công Nghiệp",
    role: "supporting",
  },
  {
    id: "truyen-dong-skf",
    name: "Truyền động SKF",
    src: skfLogo,
    alt: "SKF Công Nghiệp",
    role: "supporting",
  },
];

export function getBrandLogoById(id: string) {
  return brandLogos.find((brand) => brand.id === id);
}

export function getCoreBrandLogos() {
  return ["vong-bi-skf", "goi-do-skf"].map((id) => getBrandLogoById(id)).filter((brand): brand is BrandLogo => Boolean(brand));
}

export const brandDescriptions: Record<string, string> = {
  "vong-bi-skf": "Tra mã theo tải, tốc độ và điều kiện vận hành",
  "goi-do-skf": "Khoanh theo loại trục, thân gối và vị trí lắp",
  "phot-skf": "Đối chiếu theo d/D/B-T, kiểu môi và môi trường làm kín",
  "boi-tron-skf-lincoln": "Mỡ và hệ thống bôi trơn cho thiết bị quay",
  "dung-cu-bao-tri-skf": "Dụng cụ hỗ trợ tháo lắp, căn chỉnh và kiểm tra",
  "truyen-dong-skf": "Nhóm truyền động cho băng tải và dây chuyền",
};

export const productGroupBrandMap: Record<string, string[]> = {
  "vong-bi-skf": ["vong-bi-skf"],
  "goi-do-skf": ["goi-do-skf"],
  "phot-skf": ["phot-skf"],
  "boi-tron-skf-lincoln": ["boi-tron-skf-lincoln"],
  "dung-cu-bao-tri-skf": ["dung-cu-bao-tri-skf"],
  "truyen-dong-skf": ["truyen-dong-skf"],
};

export const customerSolutionBrandMap: Record<string, string[]> = {
  "Nhà máy sản xuất": ["vong-bi-skf", "goi-do-skf", "phot-skf", "boi-tron-skf-lincoln"],
  "Bộ phận bảo trì": ["vong-bi-skf", "goi-do-skf", "phot-skf", "dung-cu-bao-tri-skf"],
  "Bộ phận kỹ thuật": ["vong-bi-skf", "goi-do-skf", "boi-tron-skf-lincoln", "truyen-dong-skf"],
  "Bộ phận mua hàng": ["vong-bi-skf", "goi-do-skf", "phot-skf", "truyen-dong-skf"],
  "Xưởng cơ khí trong KCN": ["vong-bi-skf", "goi-do-skf", "phot-skf"],
  "Xưởng chế tạo máy": ["vong-bi-skf", "goi-do-skf", "truyen-dong-skf"],
  "Nhà thầu cơ điện / lắp đặt công nghiệp": ["goi-do-skf", "truyen-dong-skf", "dung-cu-bao-tri-skf"],
  "Khách công nghiệp cần thay thế định kỳ": ["vong-bi-skf", "phot-skf", "boi-tron-skf-lincoln"],
};
