export type RecruitmentGroup = "Kinh doanh" | "Văn phòng" | "Vận hành";

export type RecruitmentJob = {
  id: string;
  title: string;
  category: RecruitmentGroup;
  income: string;
  locations: string;
  image: string;
  imageAlt: string;
  summary: string;
  description: string[];
  requirements: string[];
  benefits: string[];
};

export const recruitmentHero = {
  title: "Gia nhập đội ngũ THL",
  subTitle:
    "THL tuyển dụng nhân sự cho các vị trí kinh doanh, kế toán, logistics, kho và giao nhận trong lĩnh vực vật tư truyền động công nghiệp.",
  description:
    "Chúng tôi tìm kiếm những người làm việc nghiêm túc, có tinh thần trách nhiệm, chủ động học hỏi và mong muốn phát triển lâu dài trong môi trường B2B phục vụ nhà máy, xưởng cơ khí, bảo trì và mua hàng công nghiệp.",
  image: "/images/tuyen-dung/tuyen-dung-hero.png",
  imageAlt: "Đội ngũ THL tuyển dụng nhân sự cho lĩnh vực vật tư truyền động công nghiệp",
};

export const recruitmentJobs: RecruitmentJob[] = [
  {
    id: "kinh-doanh",
    title: "Đại diện Kinh doanh",
    category: "Kinh doanh",
    income: "10 - 25 triệu/tháng",
    locations: "TP.HCM, Cần Thơ, Bình Dương, Đà Nẵng, Hà Nội",
    image: "/images/tuyen-dung/tuyen-dung-kinh-doanh.png",
    imageAlt: "Vị trí Đại diện Kinh doanh B2B vật tư công nghiệp tại THL",
    summary:
      "Phát triển khách hàng B2B nhà máy, xưởng cơ khí, bảo trì, mua hàng và nhà thầu cơ điện theo khu vực phụ trách.",
    description: [
      "Phát triển khách hàng B2B trong nhóm nhà máy, xưởng cơ khí, bảo trì, mua hàng và nhà thầu cơ điện.",
      "Tư vấn các nhóm vật tư truyền động công nghiệp như vòng bi, xích công nghiệp, dây đai, phớt, gối đỡ và các sản phẩm liên quan.",
      "Tiếp nhận mã hàng, ảnh tem, yêu cầu kỹ thuật từ khách hàng và phối hợp nội bộ để báo giá.",
      "Chăm sóc khách hàng hiện có, mở rộng khách hàng mới theo khu vực phụ trách.",
      "Theo dõi nhu cầu mua hàng định kỳ, lịch bảo trì và các cơ hội cung ứng vật tư cho nhà máy.",
      "Báo cáo kết quả làm việc, thông tin khách hàng và cơ hội bán hàng theo quy trình của công ty.",
    ],
    requirements: [
      "Có tinh thần kinh doanh, giao tiếp tốt, chịu khó đi thị trường.",
      "Ưu tiên ứng viên từng làm sales B2B, vật tư công nghiệp, cơ khí, thiết bị, phụ tùng hoặc ngành liên quan.",
      "Biết sử dụng điện thoại, Zalo, email, Excel hoặc công cụ quản lý khách hàng cơ bản.",
      "Có khả năng học sản phẩm kỹ thuật và làm việc với mã hàng.",
      "Trung thực, chủ động, có trách nhiệm với khách hàng và doanh số.",
    ],
    benefits: [
      "Thu nhập từ 10 - 25 triệu/tháng tùy năng lực và kết quả kinh doanh.",
      "Có chính sách thưởng theo doanh số/kết quả.",
      "Được hỗ trợ thông tin sản phẩm, tài liệu bán hàng và định hướng khách hàng mục tiêu.",
      "Có cơ hội phát triển lâu dài trong ngành vật tư truyền động công nghiệp.",
    ],
  },
  {
    id: "ke-toan",
    title: "Kế toán Tổng hợp",
    category: "Văn phòng",
    income: "Thỏa thuận",
    locations: "TP.HCM",
    image: "/images/tuyen-dung/tuyen-dung-ke-toan.png",
    imageAlt: "Vị trí Kế toán Tổng hợp tại THL",
    summary:
      "Theo dõi chứng từ, công nợ, nhập xuất tồn và phối hợp với các bộ phận để đảm bảo số liệu chính xác.",
    description: [
      "Theo dõi chứng từ kế toán, hóa đơn, phiếu thu, phiếu chi, công nợ và các nghiệp vụ phát sinh.",
      "Quản lý công nợ khách hàng, nhà cung cấp và phối hợp với bộ phận kinh doanh khi cần đối chiếu.",
      "Theo dõi nhập xuất tồn hàng hóa, hỗ trợ kiểm tra số liệu kho khi cần.",
      "Lập báo cáo nội bộ, báo cáo doanh thu, chi phí và các báo cáo liên quan.",
      "Sắp xếp, lưu trữ chứng từ kế toán đúng quy định.",
      "Phối hợp với bộ phận bán hàng, kho và logistics để đảm bảo số liệu chính xác.",
    ],
    requirements: [
      "Có kinh nghiệm kế toán tổng hợp hoặc kế toán nội bộ.",
      "Nắm được nghiệp vụ hóa đơn, chứng từ, công nợ, kho và báo cáo cơ bản.",
      "Sử dụng tốt Excel; biết phần mềm kế toán là lợi thế.",
      "Cẩn thận, trung thực, có trách nhiệm với số liệu.",
      "Ưu tiên ứng viên từng làm trong lĩnh vực thương mại, vật tư, phụ tùng hoặc hàng công nghiệp.",
    ],
    benefits: [
      "Thu nhập thỏa thuận theo năng lực.",
      "Môi trường làm việc ổn định, rõ việc, rõ trách nhiệm.",
      "Có cơ hội làm lâu dài cùng hệ thống kinh doanh B2B công nghiệp.",
    ],
  },
  {
    id: "logistics",
    title: "Logistics",
    category: "Vận hành",
    income: "Thỏa thuận",
    locations: "TP.HCM",
    image: "/images/tuyen-dung/tuyen-dung-logistics.png",
    imageAlt: "Vị trí Logistics điều phối đơn hàng công nghiệp tại THL",
    summary:
      "Theo dõi đơn hàng, điều phối giao nhận và phối hợp kho - kinh doanh - nhà cung cấp để đảm bảo tiến độ.",
    description: [
      "Theo dõi đơn hàng, tiến độ giao nhận, vận chuyển và xử lý các vấn đề phát sinh.",
      "Phối hợp với kho, kinh doanh và nhà cung cấp để đảm bảo hàng hóa giao đúng thời gian.",
      "Quản lý chứng từ giao hàng, phiếu xuất, phiếu nhận và thông tin vận chuyển.",
      "Hỗ trợ kiểm tra tình trạng hàng hóa, đóng gói, điều phối giao nhận khi cần.",
      "Cập nhật tiến độ đơn hàng cho bộ phận liên quan.",
      "Sắp xếp phương án vận chuyển phù hợp theo từng đơn hàng và khu vực.",
    ],
    requirements: [
      "Có kinh nghiệm logistics, điều phối đơn hàng, giao nhận hoặc kho vận là lợi thế.",
      "Làm việc cẩn thận, nhanh nhẹn, có khả năng xử lý tình huống.",
      "Biết sử dụng Excel, Zalo, email và các công cụ văn phòng cơ bản.",
      "Có trách nhiệm với tiến độ đơn hàng và thông tin giao nhận.",
      "Ưu tiên ứng viên từng làm trong ngành thương mại, phụ tùng, vật tư hoặc hàng công nghiệp.",
    ],
    benefits: [
      "Thu nhập thỏa thuận theo năng lực.",
      "Công việc ổn định, gắn với hoạt động kinh doanh thực tế.",
      "Được phối hợp trực tiếp với kinh doanh, kho và khách hàng B2B.",
    ],
  },
  {
    id: "kho-giao-nhan",
    title: "Kho & Giao nhận",
    category: "Vận hành",
    income: "Thỏa thuận",
    locations: "TP.HCM",
    image: "/images/tuyen-dung/tuyen-dung-kho-giao-nhan.png",
    imageAlt: "Vị trí Kho và Giao nhận hàng hóa công nghiệp tại THL",
    summary:
      "Nhận hàng, soạn hàng, đóng gói và phối hợp giao nhận theo đúng quy trình để đảm bảo đơn hàng chính xác.",
    description: [
      "Nhận hàng, kiểm hàng, sắp xếp hàng hóa trong kho.",
      "Soạn hàng, đóng gói, dán thông tin đơn hàng và bàn giao cho bộ phận giao nhận/vận chuyển.",
      "Thực hiện giao hàng theo phân công khi cần.",
      "Kiểm tra số lượng, tình trạng hàng hóa trước khi xuất và sau khi nhập.",
      "Phối hợp với kế toán, logistics và kinh doanh để xử lý đơn hàng.",
      "Giữ kho gọn gàng, dễ tìm, dễ kiểm tra và hạn chế thất thoát.",
    ],
    requirements: [
      "Sức khỏe tốt, nhanh nhẹn, cẩn thận.",
      "Trung thực, có trách nhiệm với hàng hóa.",
      "Biết kiểm đếm, sắp xếp và ghi nhận thông tin hàng hóa cơ bản.",
      "Ưu tiên ứng viên từng làm kho, giao nhận, vật tư, phụ tùng hoặc hàng công nghiệp.",
      "Có phương tiện di chuyển là lợi thế nếu tham gia giao nhận.",
    ],
    benefits: [
      "Thu nhập thỏa thuận theo năng lực và phạm vi công việc.",
      "Công việc ổn định, rõ nhiệm vụ.",
      "Được làm trong môi trường hàng hóa công nghiệp, có quy trình kiểm tra và phối hợp nội bộ.",
    ],
  },
];

export const recruitmentEnvironment = {
  title: "Môi trường làm việc tại THL",
  content: [
    "THL hoạt động trong lĩnh vực vật tư truyền động công nghiệp, phục vụ nhóm khách hàng B2B như nhà máy sản xuất, bộ phận bảo trì, kỹ thuật, mua hàng, xưởng cơ khí và nhà thầu cơ điện.",
    "Công việc tại THL yêu cầu sự rõ ràng, chính xác và trách nhiệm. Mỗi vị trí đều gắn với quy trình thực tế: tiếp nhận yêu cầu, đối chiếu thông tin, xử lý đơn hàng, giao hàng và chăm sóc khách hàng.",
    "Chúng tôi ưu tiên những ứng viên có thái độ làm việc nghiêm túc, chịu học, biết phối hợp và mong muốn phát triển lâu dài.",
  ],
  image: "/images/tuyen-dung/tuyen-dung-moi-truong-lam-viec.png",
  imageAlt: "Môi trường làm việc chuyên nghiệp tại THL",
};

export const recruitmentApplyGuide = {
  title: "Cách ứng tuyển",
  intro:
    "Ứng viên quan tâm vui lòng gửi thông tin ứng tuyển gồm:",
  checklist: [
    "Họ và tên",
    "Số điện thoại",
    "Vị trí ứng tuyển",
    "Khu vực ứng tuyển",
    "Kinh nghiệm làm việc nếu có",
    "CV hoặc mô tả ngắn quá trình làm việc",
  ],
  outro: "THL sẽ liên hệ lại với ứng viên phù hợp để trao đổi chi tiết.",
};
