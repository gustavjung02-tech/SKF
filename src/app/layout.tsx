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
    "Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp.",
  openGraph: {
    title: `${siteConfig.brandName} | ${siteConfig.slogan}`,
    description:
      "Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành.",
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
