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
    default: `${siteConfig.brandName} | ${siteConfig.slogan}`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description:
    "Công Ty TNHH Tân Hòa Lợi là nhà phân phối chính thức NTN, Tsubaki và Koyo cho hệ vật tư truyền động công nghiệp chính hãng.",
  openGraph: {
    title: `${siteConfig.brandName} | ${siteConfig.slogan}`,
    description:
      "Danh mục triển khai tập trung NTN, Tsubaki, NOK, Soho; Koyo được phân phối chính thức trong nhóm vòng bi và gối đỡ.",
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
