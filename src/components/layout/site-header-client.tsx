"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, PhoneCall } from "lucide-react";
import { mainMenu, siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type CoreBrandLogo = {
  src: string;
  alt: string;
  name: string;
};

type SiteHeaderClientProps = {
  coreBrands: CoreBrandLogo[];
};

const desktopMenuLabels: Record<string, string> = {
  "/": "Trang chủ",
  "/gioi-thieu": "Giới thiệu",
  "/san-pham": "Sản phẩm",
  "/giai-phap-theo-khach-hang": "Giải pháp",
  "/tuyen-dung": "Tuyển dụng",
  "/tra-ma-bao-gia": "Yêu cầu",
  "/kien-thuc": "Kiến thức",
  "/lien-he": "Liên hệ",
};

function CoreBrandMarks({ compact = false, brands }: { compact?: boolean; brands: CoreBrandLogo[] }) {
  const [primary, secondary] = brands;

  if (!primary || !secondary) return null;

  return (
    <span className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
      <Image
        src={primary.src}
        alt={primary.alt}
        width={116}
        height={40}
        className={cn("h-7 w-auto object-contain", !compact && "sm:h-8")}
        priority
      />
      <span className="h-7 w-px bg-slate-200" aria-hidden />
      <Image
        src={secondary.src}
        alt={secondary.alt}
        width={116}
        height={34}
        className={cn("h-6 w-auto object-contain", compact ? "block" : "hidden sm:block")}
        priority
      />
    </span>
  );
}

export function SiteHeaderClient({ coreBrands }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <CoreBrandMarks brands={coreBrands} />
          <span className="sr-only">{siteConfig.brandName}</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 px-4 lg:flex">
          {mainMenu.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-2.5 text-[13px] font-semibold transition-colors xl:px-3 xl:text-sm",
                  active ? "bg-blue-800 text-white" : "text-slate-600 hover:bg-blue-50 hover:text-slate-900",
                )}
              >
                {desktopMenuLabels[item.href] ?? item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden bg-blue-800 hover:bg-blue-900 sm:inline-flex">
            <a href={siteConfig.phoneHref}>
              <PhoneCall className="mr-2 size-4" />
              Liên hệ B2B
            </a>
          </Button>
          <Sheet>
            <SheetTrigger
              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <CoreBrandMarks compact brands={coreBrands} />
                  <p className="text-xs leading-relaxed text-slate-500">{siteConfig.slogan}</p>
                </div>

                <div className="flex flex-col gap-2">
                  {mainMenu.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium",
                          active ? "bg-blue-800 text-white" : "text-slate-700 hover:bg-blue-50",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="grid gap-2">
                  <Button asChild className="bg-blue-800 hover:bg-blue-900">
                    <a href={siteConfig.phoneHref}>
                      <PhoneCall className="mr-2 size-4" />
                      Liên hệ kinh doanh
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-100">
                    <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 size-4" />
                      Zalo kinh doanh
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
