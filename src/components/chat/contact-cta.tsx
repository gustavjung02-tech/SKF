import { Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export function ContactCta() {
  return (
    <div className="flex items-center gap-2 px-1 pt-1">
      <a
        href={siteConfig.phoneHref}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-100 active:scale-[0.97]"
      >
        <Phone className="size-3.5" />
        Liên hệ B2B
      </a>
      <a
        href={siteConfig.zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-800 shadow-sm transition hover:bg-blue-100 active:scale-[0.97]"
      >
        <svg viewBox="0 0 48 48" className="size-3.5" fill="currentColor" aria-hidden="true">
          <path d="M12.5 7C9.46 7 7 9.46 7 12.5v23C7 38.54 9.46 41 12.5 41h23c3.04 0 5.5-2.46 5.5-5.5v-23C41 9.46 38.54 7 35.5 7h-23zm1.05 9h7.1c.52 0 .85.45.85.95v.1c0 .5-.33.95-.85.95H16v2.5h4.6c.52 0 .9.45.9.95v.1c0 .5-.38.95-.9.95H15.5c-.55 0-1-.45-1-1V17c0-.55.45-1 1.05-1zm10.2 0h.5c.55 0 1 .45 1 1v7.5c0 .55-.45 1-1 1h-.5c-.55 0-1-.45-1-1V17c0-.55.45-1 1-1zm3.75 3.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5v3c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5v-3zm2 0v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5zM10 28h28v.5c0 .28-.22.5-.5.5H10.5c-.28 0-.5-.22-.5-.5V28zm2.5 2.5h3.2l-3.6 5.7c-.2.3.02.8.4.8h5.5c.28 0 .5-.22.5-.5v-.5c0-.28-.22-.5-.5-.5h-3.2l3.6-5.7c.2-.3-.02-.8-.4-.8h-5.5c-.28 0-.5.22-.5.5v.5c0 .28.22.5.5.5z" />
        </svg>
        Zalo kinh doanh
      </a>
    </div>
  );
}
