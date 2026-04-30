"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AssistantBubble() {
  return (
    <div className="fixed bottom-[calc(7.8rem+env(safe-area-inset-bottom))] left-4 z-50 lg:bottom-8 lg:left-5">
      <a
        href={siteConfig.zaloLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#008fd3] text-white shadow-[0_14px_34px_-20px_rgba(0,143,211,0.85)] transition hover:-translate-y-0.5 hover:bg-[#007db8]"
        aria-label="Chat Zalo"
        title="Chat Zalo"
      >
        <MessageCircle className="size-5" />
      </a>
    </div>
  );
}
