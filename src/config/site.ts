export const siteConfig = {
  brandName: "SKF Công Nghiệp",
  domain: "skf-congnghiep.info",
  slogan: "Tra mã, tư vấn và báo giá sản phẩm SKF",
  personalName: "Đội ngũ SKF Công Nghiệp",
  email: "khuongbinh.info@gmail.com",
  emailHref: "mailto:khuongbinh.info@gmail.com",
  phone: "0969 155 751",
  phoneHref: "tel:0969155751",
  zaloLabel: "Zalo kinh doanh",
  zaloLink: "https://zalo.me/0969155751",
  supportArea: "Phục vụ: Nhà máy toàn quốc",
  responseTime: "Phản hồi trong giờ hành chính hoặc theo mức độ ưu tiên của yêu cầu B2B",
  address: "Dĩ An, Bình Dương / Phú Thạnh, Tân Phú, TP.HCM",
  defaultOgImage: "/images/heroes/home/hero-home-skf-main.png",
  footerCredit: "SKF Công Nghiệp",
};

export const mainMenu = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm SKF", href: "/san-pham" },
  { label: "Tra mã SKF", href: "/tra-ma-bao-gia" },
  { label: "Ứng dụng ngành", href: "/ung-dung" },
  { label: "Kiến thức", href: "/kien-thuc" },
  { label: "Tuyển dụng", href: "/tuyen-dung" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;

export const footerMenu = [
  { label: "Tra mã SKF", href: "/tra-ma-bao-gia" },
  { label: "Sản phẩm SKF", href: "/san-pham" },
  { label: "Ứng dụng ngành", href: "/ung-dung" },
  { label: "Kiến thức", href: "/kien-thuc" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;

export const quickActions = [
  { label: "Tra mã", href: "/tra-ma-bao-gia" },
  { label: "Tuyển dụng", href: "/tuyen-dung" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;
