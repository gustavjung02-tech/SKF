import type { Metadata } from "next";
import { Be_Vietnam_Pro, Exo_2 } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const headingFont = Exo_2({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: "SKF Công Nghiệp - Tra mã, tư vấn và báo giá sản phẩm SKF",
    template: `%s | ${siteConfig.brandName}`,
  },
  description:
    "Tra mã sản phẩm SKF theo mã, nhóm sản phẩm và thông số d/D/B. Hỗ trợ tư vấn vòng bi, gối đỡ, phớt, bôi trơn, bảo trì và truyền động cho nhà máy công nghiệp.",
  keywords: [
    "SKF công nghiệp",
    "tra mã SKF",
    "vòng bi SKF",
    "gối đỡ SKF",
    "phớt SKF",
    "mỡ bôi trơn SKF",
    "dụng cụ bảo trì SKF",
    "báo giá SKF",
    "sản phẩm SKF cho nhà máy",
    "phụ tùng công nghiệp SKF",
  ],
  alternates: {
    canonical: `https://${siteConfig.domain}`,
  },
  openGraph: {
    url: `https://${siteConfig.domain}`,
    title: "SKF Công Nghiệp - Tra mã và báo giá sản phẩm SKF",
    description:
      "Tra mã, lọc nhóm sản phẩm và gửi yêu cầu báo giá SKF nhanh cho nhu cầu bảo trì, thay thế và vận hành nhà máy.",
    type: "website",
    locale: "vi_VN",
    siteName: siteConfig.brandName,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brandName} - ${siteConfig.slogan}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKF Công Nghiệp - Tra mã và báo giá sản phẩm SKF",
    description:
      "Tra mã, lọc nhóm sản phẩm và gửi yêu cầu báo giá SKF nhanh cho nhu cầu bảo trì, thay thế và vận hành nhà máy.",
    images: [siteConfig.defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("theme", bodyFont.variable, headingFont.variable)}>
      <body className={cn(bodyFont.className, "min-h-screen bg-background text-foreground antialiased")}>
        {children}
      </body>
    </html>
  );
}
