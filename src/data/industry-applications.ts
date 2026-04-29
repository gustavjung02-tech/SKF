import { resolveIndustryCardImage } from "@/lib/image-resolver";

export type IndustryApplication = {
  slug: string;
  name: string;
  description: string;
  commonParts: string[];
  image: string;
  imagePrompt: string;
  imageAlt: string;
  imageStyleTag: string;
};

export const industryApplications: IndustryApplication[] = [
  {
    slug: "may-go",
    name: "Máy gỗ",
    description:
      "Máy cưa, máy bào, máy chà nhám và máy phay gỗ cần vòng bi, gối đỡ, dây curoa và phớt chặn dầu ổn định trong môi trường bụi gỗ, tải liên tục.",
    commonParts: ["Vòng bi NTN/Koyo", "Gối đỡ", "Dây curoa", "Phớt chặn dầu NOK"],
    image: resolveIndustryCardImage("may-go", "/images/cards/industry-may-go.webp"),
    imagePrompt:
      "Máy cưa gỗ công nghiệp đang vận hành trong xưởng gỗ, thấy rõ trục quay và hệ truyền động, bụi gỗ nhẹ trong không khí, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Máy cưa gỗ công nghiệp đang vận hành với trục quay và hệ truyền động",
    imageStyleTag: "industry-app",
  },
  {
    slug: "cnc",
    name: "CNC",
    description:
      "Máy phay CNC, tiện CNC và trung tâm gia công cần vòng bi chính xác, cụm trục ổn định, phớt làm kín và mỡ bôi trơn phù hợp tốc độ cao.",
    commonParts: ["Vòng bi chính xác NTN", "Phớt chặn dầu NOK", "Mỡ bôi trơn"],
    image: resolveIndustryCardImage("cnc", "/images/cards/industry-cnc.webp"),
    imagePrompt:
      "Máy phay CNC đang gia công kim loại, close-up trục chính quay tốc độ cao với phoi kim loại, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Máy phay CNC đang gia công kim loại, trục chính quay tốc độ cao",
    imageStyleTag: "industry-app",
  },
  {
    slug: "ep-nhua",
    name: "Ép nhựa",
    description:
      "Máy ép nhựa, máy thổi và hệ thủy lực thường cần vòng bi chịu tải, phớt giữ kín và vật tư bôi trơn để giảm rủi ro rò rỉ, lệch tải.",
    commonParts: ["Vòng bi NTN/Koyo", "Phớt chặn dầu NOK", "Mỡ bôi trơn"],
    image: resolveIndustryCardImage("ep-nhua", "/images/cards/industry-ep-nhua.webp"),
    imagePrompt:
      "Máy ép nhựa công nghiệp trong nhà máy, thấy rõ cụm kẹp và hệ thống thủy lực đang vận hành, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Máy ép nhựa công nghiệp với cụm kẹp và hệ thống thủy lực",
    imageStyleTag: "industry-app",
  },
  {
    slug: "bom-quat-dong-co",
    name: "Bơm / Quạt / Động cơ",
    description:
      "Bơm nước, bơm hóa chất, quạt công nghiệp và motor cần vòng bi, phớt chặn dầu, dây curoa và mỡ bôi trơn đúng điều kiện vận hành.",
    commonParts: ["Vòng bi NTN", "Phớt chặn dầu NOK", "Mỡ bôi trơn", "Dây curoa"],
    image: resolveIndustryCardImage("bom-quat-dong-co", "/images/cards/industry-bom-quat.webp"),
    imagePrompt:
      "Cụm bơm nước công nghiệp và quạt hút gió trong nhà máy, thấy rõ motor điện và cụm truyền động dây curoa, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Cụm bơm nước và quạt công nghiệp với motor và truyền động dây curoa",
    imageStyleTag: "industry-app",
  },
  {
    slug: "bang-tai-truyen-dong",
    name: "Băng tải / Truyền động",
    description:
      "Hệ băng tải xích, con lăn và cơ cấu truyền động cần Tsubaki cho xích, NTN/Koyo cho cụm quay, Soho cho nhóm dây truyền động theo tiến độ vận hành.",
    commonParts: ["Xích Tsubaki", "Vòng bi NTN/Koyo", "Gối đỡ", "Dây curoa Soho"],
    image: resolveIndustryCardImage("bang-tai-truyen-dong", "/images/cards/industry-bang-tai.webp"),
    imagePrompt:
      "Hệ băng tải xích và con lăn trong dây chuyền sản xuất, thấy rõ nhông xích và gối đỡ trục, realistic industrial B2B photography, clean lighting, professional, no cartoon, no oversized logos, no poster-style collage, 16:9 aspect ratio",
    imageAlt: "Hệ băng tải xích và con lăn trong dây chuyền sản xuất công nghiệp",
    imageStyleTag: "industry-app",
  },
];
