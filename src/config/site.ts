export const siteConfig = {
  brandName: "Công Ty TNHH Tân Hòa Lợi",
  domain: "luanphutung.vn",
  slogan: "Nhà phân phối chính thức NTN, Tsubaki, Koyo cho vật tư truyền động công nghiệp",
  personalName: "Đội THL B2B",
  phone: "0902 964 685",
  phoneHref: "tel:0902964685",
  zaloLabel: "Zalo kinh doanh",
  zaloLink: "https://zalo.me/0902964685",
  supportArea: "Phục vụ: Nhà máy toàn quốc",
  responseTime: "Phản hồi trong giờ hành chính hoặc theo mức độ ưu tiên của yêu cầu B2B",
  address: "Dĩ An, Bình Dương / Phú Thạnh, Tân Phú, TP.HCM",
  defaultOgImage: "/images/branding/og-industrial.svg",
  footerCredit: "Công Ty TNHH Tân Hòa Lợi",
};

export const mainMenu = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Giải pháp theo khách hàng", href: "/giai-phap-theo-khach-hang" },
  { label: "Tuyển dụng", href: "/tuyen-dung" },
  { label: "Yêu cầu kỹ thuật", href: "/tra-ma-bao-gia" },
  { label: "Kiến thức", href: "/kien-thuc" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;

export const footerMenu = [
  { label: "Yêu cầu kỹ thuật", href: "/tra-ma-bao-gia" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Giải pháp theo khách hàng", href: "/giai-phap-theo-khach-hang" },
  { label: "Kiến thức", href: "/kien-thuc" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;

export const quickActions = [
  { label: "Gửi yêu cầu kỹ thuật", href: "/tra-ma-bao-gia" },
  { label: "Tuyển dụng", href: "/tuyen-dung" },
  { label: "Liên hệ B2B", href: siteConfig.phoneHref },
] as const;
