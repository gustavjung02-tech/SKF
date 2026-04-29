"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, ChevronUp, MessageCircle, PhoneCall, Search } from "lucide-react";
import { siteConfig } from "@/config/site";

export function MobileQuickActions() {
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!contactRef.current) {
        return;
      }

      if (!contactRef.current.contains(event.target as Node)) {
        setContactOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2">
        <Link
          href="/tra-ma-bao-gia"
          className="flex items-center justify-center gap-1 rounded-md bg-blue-800 px-2 py-2 text-xs font-semibold text-white"
        >
          <Search className="size-4" />
          Gửi yêu cầu
        </Link>
        <Link
          href="/tuyen-dung"
          className="flex items-center justify-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-800"
        >
          <BriefcaseBusiness className="size-4" />
          Tuyển dụng
        </Link>

        <div ref={contactRef} className="relative">
          {contactOpen ? (
            <div className="absolute right-0 bottom-[calc(100%+0.5rem)] w-44 overflow-hidden rounded-lg border border-blue-200 bg-white shadow-[0_12px_28px_-16px_rgba(15,23,42,0.5)]">
              <a
                href={siteConfig.phoneHref}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-900 transition hover:bg-blue-50"
                onClick={() => setContactOpen(false)}
              >
                <PhoneCall className="size-4" />
                Goi {siteConfig.phone}
              </a>
              <a
                href={siteConfig.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border-t border-blue-100 px-3 py-2 text-xs font-semibold text-blue-900 transition hover:bg-blue-50"
                onClick={() => setContactOpen(false)}
              >
                <MessageCircle className="size-4" />
                Mo Zalo
              </a>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setContactOpen((prev) => !prev)}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-blue-300 bg-white px-2 py-2 text-xs font-semibold text-blue-900"
            aria-label={contactOpen ? "Dong lua chon lien he" : "Mo lua chon lien he"}
            title="Lien he"
          >
            <PhoneCall className="size-4" />
            Liên hệ
            <ChevronUp className={`size-3.5 transition ${contactOpen ? "rotate-180" : "rotate-0"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
