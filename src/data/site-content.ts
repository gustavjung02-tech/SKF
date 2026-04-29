export type ProductGroup = {
  slug: string;
  name: string;
  shortDescription: string;
  detailDescription: string;
  popularApplications: string[];
  commonBuyers: string[];
};

export type SupportService = {
  title: string;
  clientSends: string;
  weSupport: string;
  clientGets: string;
};

export type CustomerSegment = {
  name: string;
  summary: string;
};

export type CustomerSolution = {
  customer: string;
  problems: string;
  support: string;
  products: string;
};

export type CustomerRole = {
  role: string;
  problems: string;
  support: string;
};

export const heroContent = {
  eyebrow: "Nhà phân phối chính thức NTN, Tsubaki, Koyo",
  heading: "Vật tư truyền động Nhật Bản chính hãng cho nhà máy",
  subheading:
    "THL là nhà phân phối chính thức của NTN, Tsubaki và Koyo. Danh mục được tổ chức rõ theo từng nhóm sản phẩm và ứng dụng để bộ phận bảo trì, kỹ thuật, mua hàng dễ tra cứu.",
};

export const trustBullets = [
  "Định vị rõ vai trò nhà phân phối chính thức cho NTN, Tsubaki và Koyo",
  "Danh mục Nhật Bản chính hãng theo từng nhóm sản phẩm và ứng dụng",
  "Đối chiếu kỹ thuật theo mã, cụm máy và điều kiện vận hành thực tế",
  "Phối hợp được giữa bảo trì, kỹ thuật và mua hàng trong cùng quy trình B2B",
];

export const heroHighlights = [
  "NTN cho vòng bi, cụm quay và các vị trí cần độ ổn định vận hành",
  "Tsubaki cho xích công nghiệp, băng tải và cơ cấu truyền động tải liên tục",
  "Koyo là thương hiệu phân phối chính thức trong nhóm vòng bi; NOK và Soho đáp ứng nhu cầu theo ứng dụng",
];

export const supportCards: SupportService[] = [
  {
    title: "Tiếp nhận nhu cầu kỹ thuật",
    clientSends: "Mã cũ, ảnh tem, ảnh cụm máy hoặc yêu cầu vận hành",
    weSupport: "Tách nhóm hàng, thương hiệu và điều kiện ứng dụng",
    clientGets: "Thông tin rõ để kỹ thuật và mua hàng cùng kiểm tra",
  },
  {
    title: "Đối chiếu theo catalog",
    clientSends: "Thông số, kích thước, tải, nhiệt hoặc môi trường làm việc",
    weSupport: "Đối chiếu NTN, Tsubaki, Koyo và nhóm phù hợp theo ứng dụng",
    clientGets: "Phương án đúng ứng dụng trước khi chuyển báo giá",
  },
  {
    title: "Hỗ trợ tiến độ nhà máy",
    clientSends: "Mức độ gấp và thời điểm cần vật tư",
    weSupport: "Ưu tiên phản hồi các nhu cầu ảnh hưởng sản xuất",
    clientGets: "Hướng xử lý rõ, hạn chế trao đổi vòng lại",
  },
];

export const productGroups: ProductGroup[] = [
  {
    slug: "ntn",
    name: "NTN",
    shortDescription:
      "NTN phù hợp cho vòng bi, cụm quay và các vị trí cần độ ổn định cao trong vận hành nhà máy.",
    detailDescription:
      "THL ưu tiên NTN cho nhu cầu vòng bi công nghiệp, motor, bơm, quạt, hộp số, con lăn và các cụm quay cần độ tin cậy. Khi xử lý yêu cầu, thông tin được đối chiếu theo mã, kích thước, vị trí lắp và điều kiện vận hành.",
    popularApplications: ["Động cơ điện", "Máy bơm", "Quạt công nghiệp", "Hộp số", "Trục quay", "Con lăn"],
    commonBuyers: ["Bảo trì nhà máy", "Kỹ thuật thiết bị", "Mua hàng kỹ thuật", "Xưởng cơ khí trong KCN"],
  },
  {
    slug: "tsubaki",
    name: "Tsubaki",
    shortDescription:
      "Tsubaki phù hợp cho xích công nghiệp, băng tải và cơ cấu truyền động tải liên tục.",
    detailDescription:
      "THL định vị Tsubaki ngang vai NTN trong danh mục Nhật Bản chính hãng, tập trung vào xích truyền động, nhông xích, băng tải xích và các cơ cấu chạy tải cần độ bền ổn định.",
    popularApplications: ["Băng tải xích", "Dây chuyền chuyển phôi", "Máy đóng gói", "Cơ cấu truyền động", "Nhông xích"],
    commonBuyers: ["Bảo trì dây chuyền", "Kỹ thuật nhà máy", "Xưởng chế tạo máy", "Nhà thầu cơ điện"],
  },
  {
    slug: "koyo",
    name: "Koyo",
    shortDescription:
      "Koyo là thương hiệu phân phối chính thức của THL cho nhóm vòng bi, gối đỡ và cụm đỡ trục trong dây chuyền công nghiệp.",
    detailDescription:
      "THL phân phối chính thức Koyo và sử dụng Koyo như phương án kỹ thuật cho nhóm vòng bi và gối đỡ trong các nhu cầu thay thế và bảo trì.",
    popularApplications: ["Băng tải", "Trục truyền động", "Cụm đỡ trong dây chuyền", "Máy đóng gói", "Motor", "Hộp số"],
    commonBuyers: ["Bảo trì nhà máy", "Kỹ thuật dây chuyền", "Xưởng cơ khí", "Nhà thầu lắp đặt"],
  },
  {
    slug: "nok",
    name: "NOK",
    shortDescription:
      "NOK nằm trong nhóm thương hiệu THL triển khai trọng tâm cho phớt chặn dầu, cụm làm kín trục và các vị trí cần kiểm soát rò rỉ.",
    detailDescription:
      "NOK phù hợp cho cụm trục, hộp số, bơm và vị trí cần làm kín ổn định. Khi tư vấn cần đối chiếu kích thước cốt, vỏ, độ dày, kiểu môi và môi trường làm việc.",
    popularApplications: ["Hộp số", "Máy bơm", "Trục quay", "Cụm thủy lực", "Động cơ", "Máy sản xuất"],
    commonBuyers: ["Bảo trì nhà máy", "Kỹ thuật thiết bị", "Mua hàng kỹ thuật", "Xưởng cơ khí"],
  },
  {
    slug: "soho",
    name: "Soho",
    shortDescription:
      "Soho nằm trong nhóm triển khai trọng tâm của THL cho các hạng mục vật tư truyền động cần phương án thay thế phù hợp tiến độ và ngân sách.",
    detailDescription:
      "Soho được tư vấn theo mã thực tế, vị trí lắp và yêu cầu vận hành, giúp mở rộng phương án thay thế phù hợp tiến độ nhà máy.",
    popularApplications: ["Vật tư truyền động", "Cụm thay thế định kỳ", "Máy sản xuất", "Dây chuyền phụ trợ"],
    commonBuyers: ["Mua hàng kỹ thuật", "Bảo trì nhà máy", "Xưởng cơ khí", "Khách thay thế định kỳ"],
  },
];

export const customerSegments: CustomerSegment[] = [
  {
    name: "Nhà máy sản xuất",
    summary: "Cần nguồn vật tư chính hãng, ổn định để duy trì tiến độ vận hành và hạn chế dừng máy.",
  },
  {
    name: "Bộ phận bảo trì",
    summary: "Cần đối chiếu nhanh mã, nhóm hàng và phương án thay thế khi vật tư hỏng đột xuất.",
  },
  {
    name: "Bộ phận kỹ thuật",
    summary: "Cần đầu mối hiểu sản phẩm để trao đổi theo cụm máy, tải và điều kiện làm việc thực tế.",
  },
  {
    name: "Bộ phận mua hàng",
    summary: "Cần thông tin rõ ràng về mã, thương hiệu, mô tả kỹ thuật và hướng báo giá để xử lý đề nghị mua.",
  },
  {
    name: "Xưởng cơ khí trong KCN",
    summary: "Cần vòng bi, xích, gối đỡ và vật tư truyền động phù hợp cho máy chạy liên tục.",
  },
  {
    name: "Xưởng chế tạo máy",
    summary: "Cần chọn đúng quy cách ngay từ đầu để giảm sửa đổi trong quá trình lắp máy.",
  },
  {
    name: "Nhà thầu cơ điện / lắp đặt công nghiệp",
    summary: "Cần đối chiếu nhanh mã hàng theo hồ sơ, hiện trường và tiến độ thi công.",
  },
  {
    name: "Khách công nghiệp cần thay thế định kỳ",
    summary: "Cần nguồn hỗ trợ ổn định cho kế hoạch bảo trì tháng, quý, năm.",
  },
];

export const whyContactBullets = [
  "Làm việc trực tiếp với đội THL B2B",
  "Đối chiếu trên danh mục phân phối chính thức NTN, Tsubaki, Koyo và nhóm triển khai trọng tâm",
  "Đối chiếu kỹ thuật trước khi chốt mã và báo giá",
  "Phối hợp được với bảo trì, kỹ thuật và mua hàng",
  "Tiếp nhận mã, ảnh tem, kích thước qua Zalo hoặc form",
];

export const whyContactDescription =
  "Mục tiêu là giúp nhà máy xác định đúng nhóm hàng, đúng thương hiệu, đúng ứng dụng trước khi đặt vật tư.";

export const supportProcess = [
  "Tiếp nhận mã cũ, ảnh tem, ảnh cụm máy hoặc kích thước đang có",
  "Đối chiếu theo catalog, ứng dụng và điều kiện vận hành",
  "Xác nhận nhóm hàng phù hợp trong NTN, Tsubaki, Koyo và nhóm triển khai trọng tâm",
  "Chuyển xử lý báo giá, xác nhận số lượng và theo dõi tiến độ",
];

export const supportProcessNote =
  "Thông tin cụm máy, mã cũ hoặc hình ảnh tem càng rõ thì quá trình đối chiếu và báo giá càng nhanh.";

export const solutionByCustomer: CustomerSolution[] = [
  {
    customer: "Nhà máy sản xuất",
    problems: "Dừng máy đột xuất ảnh hưởng trực tiếp đến kế hoạch sản xuất.",
    support: "Ưu tiên đối chiếu mã nhanh theo cụm máy và điều kiện vận hành thực tế.",
    products: "NTN, Tsubaki, Koyo, NOK",
  },
  {
    customer: "Bộ phận bảo trì",
    problems: "Cần xử lý sự cố nhanh nhưng dữ liệu mã cũ không đầy đủ.",
    support: "Đối chiếu theo ảnh tem, kích thước, hiện trạng và lịch sử thay thế gần nhất.",
    products: "NTN, Tsubaki, Koyo, NOK",
  },
  {
    customer: "Bộ phận kỹ thuật",
    problems: "Cần xác nhận đúng phương án theo tải, nhiệt, bụi và thời gian chạy máy.",
    support: "Tư vấn theo thông số vận hành để giảm rủi ro chọn sai mã.",
    products: "NTN, Tsubaki, Koyo, Soho, NOK",
  },
  {
    customer: "Bộ phận mua hàng",
    problems: "Cần thông tin rõ để xử lý đề nghị mua và so sánh phương án nhanh.",
    support: "Tách rõ thông tin kỹ thuật, thương hiệu và thông tin đặt hàng cho từng nhóm vật tư.",
    products: "NTN, Tsubaki, Koyo, Soho, NOK",
  },
  {
    customer: "Xưởng cơ khí trong KCN",
    problems: "Máy chạy theo ca, vật tư chịu tải thực tế cao và cần thay đúng chuẩn.",
    support: "Định hướng nhóm hàng theo vị trí máy, mức tải và điều kiện làm việc.",
    products: "NTN, Tsubaki, Koyo, NOK",
  },
  {
    customer: "Xưởng chế tạo máy",
    problems: "Sai quy cách từ đầu dẫn đến chỉnh sửa lắp ráp và tăng thời gian hoàn thiện máy.",
    support: "Đối chiếu sớm theo bản vẽ, cụm lắp và vật tư tương thích.",
    products: "NTN, Tsubaki, Koyo, NOK",
  },
  {
    customer: "Nhà thầu cơ điện / lắp đặt công nghiệp",
    problems: "Tiến độ hiện trường yêu cầu phản hồi nhanh và mã hàng rõ ràng theo hồ sơ.",
    support: "Hỗ trợ đối chiếu theo hiện trạng và khối lượng thi công theo giai đoạn.",
    products: "Tsubaki, NTN, Koyo, Soho",
  },
  {
    customer: "Khách công nghiệp cần thay thế định kỳ",
    problems: "Cần nguồn hỗ trợ ổn định cho kế hoạch bảo trì tháng, quý, năm.",
    support: "Theo dõi nhu cầu thay thế định kỳ và gợi ý nhóm hàng theo chu kỳ vận hành.",
    products: "NTN, Tsubaki, Koyo, NOK",
  },
];

export const leadFormIntro =
  "Anh/chị có thể gửi mã cũ, ảnh tem, ảnh vị trí lắp, kích thước hoặc mô tả thiết bị để THL đối chiếu nhanh hơn.";

export const customerRoles: CustomerRole[] = [
  {
    role: "Bảo trì nhà máy",
    problems: "Máy hỏng đột xuất, mã cũ mờ hoặc thiếu, cần xử lý nhanh để không ảnh hưởng sản xuất.",
    support: "Đối chiếu theo ảnh tem, kích thước và hiện trạng; ưu tiên NTN, Tsubaki, Koyo cùng nhóm triển khai đúng ứng dụng.",
  },
  {
    role: "Kỹ thuật thiết bị",
    problems: "Cần xác nhận đúng thông số theo tải, tốc độ, nhiệt và môi trường để tránh chọn sai mã.",
    support: "Tư vấn theo điều kiện vận hành thực tế, catalog và nhóm hàng phù hợp cụm máy.",
  },
  {
    role: "Mua hàng kỹ thuật",
    problems: "Thông tin từ bảo trì hoặc kỹ thuật chưa đủ rõ để xử lý đề nghị mua.",
    support: "Tách rõ phần kỹ thuật, thương hiệu và thông tin đặt hàng để kiểm tra dễ hơn.",
  },
  {
    role: "Chủ xưởng / Cơ điện",
    problems: "Máy chạy liên tục theo ca, vật tư chịu tải nặng và cần nguồn hỗ trợ kỹ thuật ổn định.",
    support: "Định hướng nhóm hàng theo vị trí máy, mức tải thực tế và tiến độ thay thế dài hạn.",
  },
];

export const leadFormUploadHint =
  "Có thể gửi ảnh tem, ảnh mẫu cũ hoặc ảnh vị trí lắp để hỗ trợ đối chiếu nhanh hơn.";

export const leadFormBottomNote =
  "THL ưu tiên xử lý các yêu cầu kỹ thuật rõ thông tin và các trường hợp ảnh hưởng tiến độ vận hành.";

export const quoteGuideBullets = [
  "Gửi trước mã cũ, ảnh tem, kích thước hoặc mô tả cụm máy để rút ngắn thời gian đối chiếu.",
  "Nếu cần xử lý gấp, nên ghi rõ mức độ ưu tiên và mốc thời gian cần vật tư.",
  "Thông tin kỹ thuật rõ ràng giúp bộ phận mua hàng kiểm tra và đặt hàng nhanh hơn.",
  "Có thể gửi qua Zalo trước, sau đó điền form để lưu đầy đủ dữ liệu theo từng yêu cầu.",
];
