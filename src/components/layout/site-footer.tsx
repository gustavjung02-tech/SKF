import Link from "next/link";
import { Clock3, Globe, Mail, MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";
import { footerMenu, siteConfig } from "@/config/site";

const footerContactItems = [
  { label: siteConfig.phone, href: siteConfig.phoneHref, Icon: PhoneCall },
  { label: siteConfig.email, href: siteConfig.emailHref, Icon: Mail },
  { label: siteConfig.zaloLabel, href: siteConfig.zaloLink, Icon: MessageCircle, external: true },
  { label: siteConfig.supportArea, Icon: Globe },
  { label: `Giờ phản hồi: ${siteConfig.responseTime}`, Icon: Clock3 },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[#DDE7F3] bg-slate-50">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:py-7">
        <div className="space-y-2.5">
          <Link href="/" className="inline-flex items-center gap-2 rounded-md border border-[#DDE7F3] bg-white px-2.5 py-1.5">
            <span className="rounded bg-[#0050A4] px-2 py-0.5 text-xs font-bold tracking-wide text-white">SKF</span>
            <span className="text-xs font-semibold text-slate-700">Công Nghiệp</span>
          </Link>
          <p className="text-sm font-semibold leading-relaxed text-slate-800">{siteConfig.slogan}</p>
          <p className="text-sm leading-relaxed text-slate-600">
            Tra mã, tư vấn và tiếp nhận yêu cầu báo giá sản phẩm SKF cho nhà máy công nghiệp.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0050A4]">
            <ShieldCheck className="size-3.5" />
            Cung cấp và tư vấn sản phẩm SKF theo mã, ứng dụng và điều kiện vận hành.
          </p>
        </div>

        <div className="space-y-2.5">
          <h3 className="font-heading text-base font-semibold text-slate-900">Menu phụ</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {footerMenu.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[#0050A4]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <h3 className="font-heading text-base font-semibold text-slate-900">Thông tin liên hệ</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {footerContactItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5">
                <item.Icon className="size-4 shrink-0 text-[#0050A4]" />
                {"href" in item && item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-[#0050A4]"
                    {...("external" in item && item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[#DDE7F3] px-4 py-2 text-right text-xs text-slate-400 sm:px-6">{siteConfig.footerCredit}</div>
    </footer>
  );
}
