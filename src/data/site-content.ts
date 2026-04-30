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
  eyebrow: "SKF Công Nghiệp",
  heading: "Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF",
  subheading:
    "Website tra mã và tiếp nhận yêu cầu báo giá sản phẩm SKF cho khách hàng công nghiệp. Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành.",
};

export const trustBullets = [
  "Tập trung vào nhu cầu SKF cho nhà máy công nghiệp",
  "Danh mục rõ theo vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động",
  "Đối chiếu theo mã, kích thước, vị trí lắp và điều kiện vận hành",
  "Phù hợp quy trình làm việc của bảo trì, kỹ thuật và mua hàng công nghiệp",
];

export const heroHighlights = [
  "Vòng bi và gối đỡ SKF cho cụm quay, motor, bơm, quạt và băng tải",
  "Phớt, mỡ và hệ thống bôi trơn SKF/Lincoln cho vận hành ổn định",
  "Dụng cụ bảo trì và nhóm truyền động SKF cho xử lý tại hiện trường",
];

export const supportCards: SupportService[] = [
  {
    title: "Tiếp nhận yêu cầu theo mã",
    clientSends: "Mã cũ, ảnh tem, ảnh cụm máy hoặc mô tả vị trí lắp",
    weSupport: "Khoanh nhóm sản phẩm SKF và thông số cần kiểm tra",
    clientGets: "Thông tin rõ để kỹ thuật và mua hàng cùng đối chiếu",
  },
  {
    title: "Đối chiếu theo ứng dụng",
    clientSends: "Kích thước, tải, tốc độ, nhiệt độ hoặc môi trường làm việc",
    weSupport: "Tư vấn theo nhóm SKF phù hợp với điều kiện vận hành",
    clientGets: "Hướng chọn mã hoặc nhóm hàng trước khi chuyển báo giá",
  },
  {
    title: "Hỗ trợ tiến độ nhà máy",
    clientSends: "Mức độ gấp và thời điểm cần vật tư",
    weSupport: "Ưu tiên phản hồi các nhu cầu ảnh hưởng sản xuất",
    clientGets: "Hướng xử lý gọn, giảm trao đổi vòng lại",
  },
];

export const productGroups: ProductGroup[] = [
  {
    slug: "vong-bi-skf",
    name: "Vòng bi SKF",
    shortDescription: "Đối chiếu mã vòng bi theo tải, tốc độ, độ rơ, kiểu che chắn và môi trường vận hành.",
    detailDescription:
      "Nhóm vòng bi SKF phù hợp cho motor, bơm, quạt, hộp số, con lăn và các cụm quay cần vận hành ổn định. Khi xử lý yêu cầu, thông tin được đối chiếu theo mã, kích thước, vị trí lắp và điều kiện làm việc.",
    popularApplications: ["Motor", "Bơm", "Quạt công nghiệp", "Hộp số", "Trục quay", "Con lăn"],
    commonBuyers: ["Bảo trì nhà máy", "Kỹ thuật thiết bị", "Mua hàng kỹ thuật", "Xưởng cơ khí trong KCN"],
  },
  {
    slug: "goi-do-skf",
    name: "Gối đỡ SKF",
    shortDescription: "Khoanh nhanh nhóm gối đỡ theo loại trục, kiểu lắp và không gian máy.",
    detailDescription:
      "Nhóm gối đỡ SKF dùng cho băng tải, trục truyền động, quạt, máy đóng gói và các cụm máy chạy liên tục. Khi tư vấn cần kiểm tra đường kính trục, kiểu thân gối, vị trí bắt bulong và điều kiện bụi, ẩm, tải.",
    popularApplications: ["Băng tải", "Trục truyền động", "Quạt", "Máy đóng gói", "Con lăn"],
    commonBuyers: ["Bảo trì dây chuyền", "Kỹ thuật nhà máy", "Xưởng chế tạo máy", "Nhà thầu cơ điện"],
  },
  {
    slug: "phot-skf",
    name: "Phớt SKF",
    shortDescription: "Tra mã phớt theo kích thước cốt, vỏ, độ dày, kiểu môi và điều kiện làm kín.",
    detailDescription:
      "Nhóm phớt SKF phù hợp cho cụm trục, hộp số, bơm, motor và vị trí cần kiểm soát dầu, bụi, nước hoặc độ ẩm. Dữ liệu đầu vào càng rõ về d/D/B-T và môi trường làm việc thì quá trình đối chiếu càng nhanh.",
    popularApplications: ["Hộp số", "Máy bơm", "Trục quay", "Cụm thủy lực", "Motor", "Máy sản xuất"],
    commonBuyers: ["Bảo trì nhà máy", "Kỹ thuật thiết bị", "Mua hàng kỹ thuật", "Xưởng cơ khí"],
  },
  {
    slug: "boi-tron-skf-lincoln",
    name: "Mỡ & hệ thống bôi trơn SKF/Lincoln",
    shortDescription: "Mỡ công nghiệp và hệ thống bôi trơn cho thiết bị quay, tải nặng và điểm bôi trơn khó tiếp cận.",
    detailDescription:
      "Nhóm bôi trơn SKF/Lincoln hỗ trợ bảo vệ vòng bi, gối đỡ, băng tải và cụm máy vận hành liên tục. Tư vấn dựa trên nhiệt độ, tải, tốc độ, môi trường bụi ẩm và chu kỳ bảo trì.",
    popularApplications: ["Băng tải", "Trục quay", "Cụm chịu tải", "Điểm bôi trơn xa", "Bảo trì định kỳ"],
    commonBuyers: ["Bảo trì nhà máy", "Kỹ thuật dây chuyền", "Mua hàng MRO", "Quản lý bảo trì"],
  },
  {
    slug: "dung-cu-bao-tri-skf",
    name: "Dụng cụ bảo trì SKF",
    shortDescription: "Dụng cụ hỗ trợ tháo lắp, căn chỉnh, kiểm tra và bảo trì thiết bị quay.",
    detailDescription:
      "Nhóm dụng cụ bảo trì SKF giúp đội kỹ thuật chuẩn hóa thao tác tại hiện trường, giảm rủi ro hư hỏng khi tháo lắp và rút ngắn thời gian dừng máy.",
    popularApplications: ["Căn chỉnh trục", "Tháo lắp vòng bi", "Gia nhiệt", "Kiểm tra rung", "Bảo trì nhanh"],
    commonBuyers: ["Bảo trì cơ khí", "Kỹ thuật thiết bị", "Xưởng sửa chữa", "Đội dự án nhà máy"],
  },
  {
    slug: "truyen-dong-skf",
    name: "Truyền động SKF",
    shortDescription: "Nhóm truyền động cho băng tải, cụm quay và dây chuyền sản xuất.",
    detailDescription:
      "Nhóm truyền động SKF hỗ trợ khoanh theo vị trí máy, tải chạy, tốc độ và điều kiện vận hành thực tế. Phù hợp cho nhu cầu thay thế theo mã, theo kích thước hoặc theo mô tả cụm máy.",
    popularApplications: ["Băng tải", "Dây chuyền", "Cụm truyền", "Máy sản xuất", "Cơ cấu quay"],
    commonBuyers: ["Mua hàng kỹ thuật", "Bảo trì nhà máy", "Xưởng cơ khí", "Khách thay thế định kỳ"],
  },
];

export const customerSegments: CustomerSegment[] = [
  {
    name: "Nhà máy sản xuất",
    summary: "Cần nguồn tư vấn mã SKF rõ ràng để duy trì tiến độ vận hành và hạn chế dừng máy.",
  },
  {
    name: "Bộ phận bảo trì",
    summary: "Cần đối chiếu nhanh mã, nhóm hàng và phương án thay thế khi vật tư hỏng đột xuất.",
  },
  {
    name: "Bộ phận kỹ thuật",
    summary: "Cần đầu mối hiểu ứng dụng để trao đổi theo cụm máy, tải và điều kiện làm việc thực tế.",
  },
  {
    name: "Bộ phận mua hàng",
    summary: "Cần thông tin rõ về mã, nhóm sản phẩm, mô tả kỹ thuật và hướng báo giá để xử lý đề nghị mua.",
  },
  {
    name: "Xưởng cơ khí trong KCN",
    summary: "Cần vòng bi, gối đỡ, phớt, bôi trơn và truyền động phù hợp cho máy chạy liên tục.",
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
  "Làm việc trực tiếp với đội SKF Công Nghiệp",
  "Đối chiếu theo danh mục sản phẩm SKF và điều kiện vận hành",
  "Tách rõ phần kỹ thuật trước khi chốt mã và báo giá",
  "Phối hợp được với bảo trì, kỹ thuật và mua hàng",
  "Tiếp nhận mã, ảnh tem, kích thước qua Zalo hoặc form",
];

export const whyContactDescription =
  "Mục tiêu là giúp nhà máy xác định đúng nhóm hàng, đúng mã, đúng ứng dụng trước khi đặt vật tư.";

export const supportProcess = [
  "Tiếp nhận mã cũ, ảnh tem, ảnh cụm máy hoặc kích thước đang có",
  "Đối chiếu theo nhóm sản phẩm SKF, ứng dụng và điều kiện vận hành",
  "Xác nhận nhóm hàng phù hợp trong vòng bi, gối đỡ, phớt, bôi trơn, bảo trì hoặc truyền động",
  "Chuyển xử lý báo giá, xác nhận số lượng và theo dõi tiến độ",
];

export const supportProcessNote =
  "Thông tin cụm máy, mã cũ hoặc hình ảnh tem càng rõ thì quá trình đối chiếu và báo giá càng nhanh.";

export const solutionByCustomer: CustomerSolution[] = [
  {
    customer: "Nhà máy sản xuất",
    problems: "Dừng máy đột xuất ảnh hưởng trực tiếp đến kế hoạch sản xuất.",
    support: "Ưu tiên đối chiếu mã nhanh theo cụm máy và điều kiện vận hành thực tế.",
    products: "Vòng bi SKF, gối đỡ SKF, phớt SKF, bôi trơn SKF/Lincoln",
  },
  {
    customer: "Bộ phận bảo trì",
    problems: "Cần xử lý sự cố nhanh nhưng dữ liệu mã cũ không đầy đủ.",
    support: "Đối chiếu theo ảnh tem, kích thước, hiện trạng và lịch sử thay thế gần nhất.",
    products: "Vòng bi SKF, gối đỡ SKF, phớt SKF, dụng cụ bảo trì SKF",
  },
  {
    customer: "Bộ phận kỹ thuật",
    problems: "Cần xác nhận phương án theo tải, nhiệt, bụi và thời gian chạy máy.",
    support: "Tư vấn theo thông số vận hành để giảm rủi ro chọn sai mã.",
    products: "Vòng bi SKF, bôi trơn SKF/Lincoln, truyền động SKF",
  },
  {
    customer: "Bộ phận mua hàng",
    problems: "Cần thông tin rõ để xử lý đề nghị mua và so sánh phương án nhanh.",
    support: "Tách rõ thông tin kỹ thuật, nhóm sản phẩm và thông tin đặt hàng.",
    products: "Danh mục SKF theo mã, ứng dụng và điều kiện vận hành",
  },
  {
    customer: "Xưởng cơ khí trong KCN",
    problems: "Máy chạy theo ca, vật tư chịu tải thực tế cao và cần thay đúng quy cách.",
    support: "Định hướng nhóm hàng theo vị trí máy, mức tải và điều kiện làm việc.",
    products: "Vòng bi SKF, gối đỡ SKF, phớt SKF",
  },
  {
    customer: "Xưởng chế tạo máy",
    problems: "Sai quy cách từ đầu dẫn đến chỉnh sửa lắp ráp và tăng thời gian hoàn thiện máy.",
    support: "Đối chiếu sớm theo bản vẽ, cụm lắp và vật tư tương thích.",
    products: "Vòng bi SKF, gối đỡ SKF, truyền động SKF",
  },
  {
    customer: "Nhà thầu cơ điện / lắp đặt công nghiệp",
    problems: "Tiến độ hiện trường yêu cầu phản hồi nhanh và mã hàng rõ theo hồ sơ.",
    support: "Hỗ trợ đối chiếu theo hiện trạng và khối lượng thi công theo giai đoạn.",
    products: "Gối đỡ SKF, truyền động SKF, dụng cụ bảo trì SKF",
  },
  {
    customer: "Khách công nghiệp cần thay thế định kỳ",
    problems: "Cần nguồn hỗ trợ ổn định cho kế hoạch bảo trì tháng, quý, năm.",
    support: "Theo dõi nhu cầu thay thế định kỳ và gợi ý nhóm hàng theo chu kỳ vận hành.",
    products: "Vòng bi SKF, phớt SKF, bôi trơn SKF/Lincoln",
  },
];

export const leadFormIntro =
  "Anh/chị có thể gửi mã cũ, ảnh tem, ảnh vị trí lắp, kích thước hoặc mô tả thiết bị để đội SKF Công Nghiệp đối chiếu nhanh hơn.";

export const customerRoles: CustomerRole[] = [
  {
    role: "Bảo trì nhà máy",
    problems: "Máy hỏng đột xuất, mã cũ mờ hoặc thiếu, cần xử lý nhanh để không ảnh hưởng sản xuất.",
    support: "Đối chiếu theo ảnh tem, kích thước và hiện trạng; ưu tiên khoanh đúng nhóm SKF theo ứng dụng.",
  },
  {
    role: "Kỹ thuật thiết bị",
    problems: "Cần xác nhận đúng thông số theo tải, tốc độ, nhiệt và môi trường để tránh chọn sai mã.",
    support: "Tư vấn theo điều kiện vận hành thực tế, catalog và nhóm hàng phù hợp cụm máy.",
  },
  {
    role: "Mua hàng kỹ thuật",
    problems: "Thông tin từ bảo trì hoặc kỹ thuật chưa đủ rõ để xử lý đề nghị mua.",
    support: "Tách rõ phần kỹ thuật, nhóm sản phẩm và thông tin đặt hàng để kiểm tra dễ hơn.",
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
  "Đội SKF Công Nghiệp ưu tiên xử lý các yêu cầu kỹ thuật rõ thông tin và các trường hợp ảnh hưởng tiến độ vận hành.";

export const quoteGuideBullets = [
  "Gửi trước mã cũ, ảnh tem, kích thước hoặc mô tả cụm máy để rút ngắn thời gian đối chiếu.",
  "Nếu cần xử lý gấp, nên ghi rõ mức độ ưu tiên và mốc thời gian cần vật tư.",
  "Thông tin kỹ thuật rõ ràng giúp bộ phận mua hàng kiểm tra và đặt hàng nhanh hơn.",
  "Có thể gửi qua Zalo trước, sau đó điền form để lưu đầy đủ dữ liệu theo từng yêu cầu.",
];
