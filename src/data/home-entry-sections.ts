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
    slug: "ntn",
    title: "NTN",
    tier: "core",
    description: "Thương hiệu chủ lực cho vòng bi, cụm quay, motor, bơm, quạt và hộp số trong nhà máy.",
    image: resolveProductCardImage("ntn", "/images/cards/products/ntn.png"),
    imagePrompt:
      "Kỹ thuật viên kiểm tra vòng bi NTN trong xưởng công nghiệp, máy móc và kệ vật tư phía sau, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Kỹ thuật viên kiểm tra vòng bi NTN trong xưởng sản xuất",
    imageStyleTag: "product-core",
    href: "/san-pham/ntn",
    ctaLabel: "Xem NTN",
  },
  {
    slug: "tsubaki",
    title: "Tsubaki",
    tier: "core",
    description: "Thương hiệu chủ lực cho xích công nghiệp, nhông xích, băng tải xích và cơ cấu truyền động.",
    image: resolveProductCardImage("tsubaki", "/images/cards/products/tsubaki.png"),
    imagePrompt:
      "Cụm truyền động xích Tsubaki trên dây chuyền công nghiệp, thấy rõ xích và nhông đang lắp thực tế, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Cụm truyền động xích Tsubaki trên dây chuyền sản xuất",
    imageStyleTag: "product-core",
    href: "/san-pham/tsubaki",
    ctaLabel: "Xem Tsubaki",
  },
  {
    slug: "koyo",
    title: "Koyo",
    tier: "supporting",
    description: "Thương hiệu phân phối chính thức cho vòng bi, gối đỡ và cụm đỡ trục trong các phương án kỹ thuật theo ứng dụng.",
    image: resolveProductCardImage("koyo", "/images/cards/products/koyo.png"),
    imagePrompt:
      "Cụm vòng bi và gối đỡ Koyo gắn trên trục truyền động trong nhà máy, close-up rõ sản phẩm và bối cảnh ứng dụng thực tế, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Cụm vòng bi và gối đỡ Koyo lắp trên trục truyền động trong dây chuyền nhà máy",
    imageStyleTag: "product-supporting",
    href: "/san-pham/koyo",
    ctaLabel: "Xem Koyo",
  },
  {
    slug: "nok",
    title: "NOK",
    tier: "supporting",
    description: "Nhóm triển khai trọng tâm cho phớt chặn dầu, cụm làm kín trục, hộp số và bơm công nghiệp.",
    image: resolveProductCardImage("nok", "/images/cards/products/nok.png"),
    imagePrompt:
      "Ảnh phớt chặn dầu NOK và vị trí làm kín trên trục máy công nghiệp, technical but realistic, clean background, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Phớt chặn dầu NOK lắp tại vị trí làm kín trên trục máy công nghiệp",
    imageStyleTag: "product-supporting",
    href: "/san-pham/nok",
    ctaLabel: "Xem NOK",
  },
  {
    slug: "soho",
    title: "Soho",
    tier: "supporting",
    description: "Nhóm vật tư truyền động triển khai theo nhu cầu thay thế, phù hợp tiến độ và ngân sách vận hành.",
    image: resolveProductCardImage("soho", "/images/cards/products/soho.png"),
    imagePrompt:
      "Khu vực bảo trì nhà máy với dây curoa và vật tư truyền động Soho được sắp xếp gọn trên bàn kỹ thuật, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Vật tư truyền động Soho dùng trong khu vực bảo trì nhà máy",
    imageStyleTag: "product-supporting",
    href: "/san-pham/soho",
    ctaLabel: "Xem Soho",
  },
];

export const solutionEntryCards: HomeEntryCard[] = [
  {
    slug: "bao-tri",
    title: "Bảo trì nhà máy",
    description: "Đối chiếu vật tư theo mã cũ, ảnh tem, kích thước và tình trạng máy đang vận hành.",
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
    description: "Tách rõ thông tin kỹ thuật, nhóm thương hiệu và yêu cầu đặt hàng để báo giá rành mạch.",
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
    description: "Định hướng nhóm vật tư theo vị trí máy, mức tải và kế hoạch vận hành dài hạn.",
    image: resolveSolutionCardImage("chu-xuong", "/images/cards/solutions/chu-xuong.png"),
    imagePrompt:
      "Chủ xưởng và kỹ thuật trao đổi trước cụm máy sản xuất, industrial realistic, professional, realistic industrial B2B photography, clean lighting, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Chủ xưởng và kỹ thuật viên trao đổi trước cụm máy sản xuất",
    imageStyleTag: "solution-role",
    href: "/giai-phap-theo-khach-hang/chu-xuong",
    ctaLabel: "Xem giải pháp xưởng",
  },
];
