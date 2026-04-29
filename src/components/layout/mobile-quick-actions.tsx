"use client";

import Link from "next/link";
import { BriefcaseBusiness, PhoneCall, Search } from "lucide-react";

export function MobileQuickActions() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DDE7F3] bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2">
        <Link
          href="/tra-ma-bao-gia"
          className="flex items-center justify-center gap-1 rounded-full bg-[#0050A4] px-3 py-2 text-xs font-semibold text-white shadow-[0_12px_26px_-16px_rgba(0,80,164,0.9)]"
          aria-label="Tra mã sản phẩm SKF"
          title="Tra mã sản phẩm SKF"
        >
          <Search className="size-4" />
          Tra mã
        </Link>
        <Link
          href="/tuyen-dung"
          className="flex items-center justify-center gap-1 rounded-md border border-[#DDE7F3] bg-[#EEF4FB] px-2 py-2 text-xs font-semibold text-[#0050A4]"
        >
          <BriefcaseBusiness className="size-4" />
          Tuyển dụng
        </Link>
        <Link
          href="/lien-he"
          className="flex items-center justify-center gap-1 rounded-md border border-[#DDE7F3] bg-white px-2 py-2 text-xs font-semibold text-slate-900"
          aria-label="Liên hệ"
          title="Liên hệ"
        >
          <PhoneCall className="size-4" />
          Liên hệ
        </Link>
      </div>
    </div>
  );
}
