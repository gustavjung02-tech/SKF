import { resolveProductCardImage, resolveSolutionCardImage } from "@/lib/image-resolver";

export type HomeEntryCard = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imagePrompt: string;
  imageAlt: string;
  imageStyleTag: string;
  href: string;
  ctaLabel: string;
  tier?: "core" | "supporting";
};

export const productEntryCards: HomeEntryCard[] = [
  {
    slug: "vong-bi-skf",
    title: "Vòng bi SKF",
    tier: "core",
    description: "Đối chiếu mã vòng bi theo tải, tốc độ, kiểu che chắn và điều kiện vận hành trong nhà máy.",
    image: resolveProductCardImage("vong-bi-skf", "/images/cards/product-vong-bi.webp"),
    imagePrompt:
      "Kỹ thuật viên kiểm tra vòng bi SKF trong xưởng công nghiệp, máy móc và kệ vật tư phía sau, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Kỹ thuật viên kiểm tra vòng bi SKF trong xưởng sản xuất",
    imageStyleTag: "product-core",
    href: "/san-pham/vong-bi-skf",
    ctaLabel: "Xem vòng bi SKF",
  },
  {
    slug: "goi-do-skf",
    title: "Gối đỡ SKF",
    tier: "core",
    description: "Khoanh nhanh nhóm gối đỡ theo loại trục, kiểu thân gối và vị trí lắp trên dây chuyền.",
    image: resolveProductCardImage("goi-do-skf", "/images/cards/product-goi-do.webp"),
    imagePrompt:
      "Cụm gối đỡ SKF lắp trên trục truyền động trong nhà máy, close-up rõ sản phẩm và bối cảnh ứng dụng thực tế, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Gối đỡ SKF lắp trên trục truyền động trong dây chuyền nhà máy",
    imageStyleTag: "product-core",
    href: "/san-pham/goi-do-skf",
    ctaLabel: "Xem gối đỡ SKF",
  },
  {
    slug: "phot-skf",
    title: "Phớt SKF",
    tier: "supporting",
    description: "Tra mã phớt theo d/D/B-T, kiểu môi, môi trường dầu, bụi, nước và nhiệt.",
    image: resolveProductCardImage("phot-skf", "/images/card-kien-thuc-sai-phot-chan-dau.png"),
    imagePrompt:
      "Ảnh phớt SKF và vị trí làm kín trên trục máy công nghiệp, technical but realistic, clean background, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Phớt SKF lắp tại vị trí làm kín trên trục máy công nghiệp",
    imageStyleTag: "product-supporting",
    href: "/san-pham/phot-skf",
    ctaLabel: "Xem phớt SKF",
  },
  {
    slug: "boi-tron-skf-lincoln",
    title: "Mỡ & hệ thống bôi trơn SKF/Lincoln",
    tier: "supporting",
    description: "Tư vấn mỡ và hệ thống bôi trơn theo tải, nhiệt, môi trường và chu kỳ bảo trì.",
    image: "/images/backgrounds/he-sinh-thai-home.jpeg",
    imagePrompt:
      "Khu vực bôi trơn trong nhà máy với điểm bôi trơn trên cụm máy công nghiệp, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Mỡ và hệ thống bôi trơn SKF Lincoln trong nhà máy",
    imageStyleTag: "product-supporting",
    href: "/san-pham/boi-tron-skf-lincoln",
    ctaLabel: "Xem bôi trơn SKF",
  },
  {
    slug: "dung-cu-bao-tri-skf",
    title: "Dụng cụ bảo trì SKF",
    tier: "supporting",
    description: "Hỗ trợ tháo lắp, căn chỉnh, gia nhiệt, kiểm tra và bảo trì thiết bị quay.",
    image: "/images/giai-phap-khach-hang-hero.png",
    imagePrompt:
      "Nhân sự bảo trì kiểm tra cụm máy và dụng cụ kỹ thuật trong xưởng công nghiệp, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Dụng cụ bảo trì SKF dùng trong nhà máy",
    imageStyleTag: "product-supporting",
    href: "/san-pham/dung-cu-bao-tri-skf",
    ctaLabel: "Xem dụng cụ SKF",
  },
  {
    slug: "truyen-dong-skf",
    title: "Truyền động SKF",
    tier: "supporting",
    description: "Nhóm truyền động cho băng tải, cụm quay và dây chuyền sản xuất.",
    image: resolveProductCardImage("truyen-dong-skf", "/images/card-ung-dung-bang-tai-truyen-dong.png"),
    imagePrompt:
      "Cụm truyền động SKF trên dây chuyền công nghiệp, thấy rõ chi tiết lắp thực tế, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Cụm truyền động SKF trên dây chuyền sản xuất",
    imageStyleTag: "product-supporting",
    href: "/san-pham/truyen-dong-skf",
    ctaLabel: "Xem truyền động SKF",
  },
];

export const solutionEntryCards: HomeEntryCard[] = [
  {
    slug: "bao-tri",
    title: "Bảo trì nhà máy",
    description: "Đối chiếu vật tư SKF theo mã cũ, ảnh tem, kích thước và tình trạng máy đang vận hành.",
    image: resolveSolutionCardImage("bao-tri", "/images/cards/solutions/bao-tri.png"),
    imagePrompt:
      "Nhân sự bảo trì kiểm tra cụm máy, cầm mẫu linh kiện thay thế trong xưởng công nghiệp, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Nhân viên bảo trì nhà máy kiểm tra cụm máy và linh kiện thay thế",
    imageStyleTag: "solution-role",
    href: "/giai-phap-theo-khach-hang/bao-tri",
    ctaLabel: "Xem giải pháp bảo trì",
  },
  {
    slug: "ky-thuat",
    title: "Kỹ thuật thiết bị",
    description: "Xác nhận thông số theo tải, tốc độ, môi trường và tiêu chuẩn lắp thực tế.",
    image: resolveSolutionCardImage("ky-thuat", "/images/cards/solutions/ky-thuat.png"),
    imagePrompt:
      "Kỹ thuật viên đo kích thước trục và kiểm tra cụm ổ trục bằng thước kẹp, realistic factory environment, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Kỹ thuật viên đo kích thước trục và kiểm tra cụm ổ trục trong nhà máy",
    imageStyleTag: "solution-role",
    href: "/giai-phap-theo-khach-hang/ky-thuat",
    ctaLabel: "Xem giải pháp kỹ thuật",
  },
  {
    slug: "mua-hang",
    title: "Mua hàng kỹ thuật",
    description: "Tách rõ thông tin kỹ thuật, nhóm sản phẩm và yêu cầu đặt hàng để báo giá rành mạch.",
    image: resolveSolutionCardImage("mua-hang", "/images/cards/solutions/mua-hang.png"),
    imagePrompt:
      "Nhân sự mua hàng kỹ thuật đối chiếu mã, catalog, tem hàng và danh sách vật tư trên bàn làm việc công nghiệp, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Nhân viên mua hàng kỹ thuật đối chiếu mã và catalog vật tư tại bàn làm việc",
    imageStyleTag: "solution-role",
    href: "/giai-phap-theo-khach-hang/mua-hang",
    ctaLabel: "Xem giải pháp mua hàng",
  },
  {
    slug: "chu-xuong",
    title: "Chủ xưởng / Cơ điện",
    description: "Định hướng nhóm vật tư SKF theo vị trí máy, mức tải và kế hoạch vận hành dài hạn.",
    image: resolveSolutionCardImage("chu-xuong", "/images/cards/solutions/chu-xuong.png"),
    imagePrompt:
      "Chủ xưởng và kỹ thuật trao đổi trước cụm máy sản xuất, industrial realistic, professional, realistic industrial B2B photography, clean lighting, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Chủ xưởng và kỹ thuật viên trao đổi trước cụm máy sản xuất",
    imageStyleTag: "solution-role",
    href: "/giai-phap-theo-khach-hang/chu-xuong",
    ctaLabel: "Xem giải pháp xưởng",
  },
];
