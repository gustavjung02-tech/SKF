"use client";

import { useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, MessageCircle, PhoneCall, Search, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function MobileQuickActions() {
  const [isContactExpanded, setIsContactExpanded] = useState(false);

  function toggleContactMenu() {
    setIsContactExpanded((current) => !current);
  }

  function closeContactMenu() {
    setIsContactExpanded(false);
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DDE7F3] bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2">
          <Link
            href="/tra-ma-bao-gia"
            className="flex items-center justify-center gap-1 rounded-full bg-[#0050A4] px-3 py-2 text-xs font-semibold text-white shadow-[0_12px_26px_-16px_rgba(0,80,164,0.9)]"
            aria-label="Tra mã sản phẩm SKF"
            title="Tra mã sản phẩm SKF"
            onClick={closeContactMenu}
          >
            <Search className="size-4" />
            Tra mã
          </Link>
          <Link
            href="/tuyen-dung"
            className="flex items-center justify-center gap-1 rounded-md border border-[#DDE7F3] bg-[#EEF4FB] px-2 py-2 text-xs font-semibold text-[#0050A4]"
            onClick={closeContactMenu}
          >
            <BriefcaseBusiness className="size-4" />
            Tuyển dụng
          </Link>
        </div>
      </div>

      <div className="fixed bottom-[calc(5.6rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-2 lg:hidden">
        {isContactExpanded ? (
          <>
            <a
              href={siteConfig.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#DDE7F3] bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_16px_28px_-18px_rgba(15,23,42,0.5)]"
              aria-label="Gọi ngay"
              title="Gọi ngay"
            >
              <PhoneCall className="size-4 text-[#0050A4]" />
              Gọi
            </a>
            <a
              href={siteConfig.zaloLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#CDEFFB] bg-[#ECFAFF] px-4 py-2 text-sm font-semibold text-[#006B9E] shadow-[0_16px_28px_-18px_rgba(0,143,211,0.5)]"
              aria-label="Mở Zalo"
              title="Mở Zalo"
            >
              <MessageCircle className="size-4" />
              Zalo
            </a>
          </>
        ) : null}

        <button
          type="button"
          onClick={toggleContactMenu}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0050A4] text-white shadow-[0_20px_34px_-18px_rgba(0,80,164,0.9)] transition hover:bg-[#003D7D]"
          aria-label="Liên hệ nhanh"
          title="Liên hệ nhanh"
          aria-expanded={isContactExpanded}
        >
          {isContactExpanded ? <X className="size-5" /> : <PhoneCall className="size-5" />}
        </button>
      </div>
    </>
  );
}
