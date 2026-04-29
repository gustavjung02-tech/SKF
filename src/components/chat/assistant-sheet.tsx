"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssistantSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

const SWIPE_THRESHOLD = 80;

export function AssistantSheet({ open, onClose, children }: AssistantSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, active: false });

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("chat-mobile-open");
      return;
    }

    document.body.classList.add("chat-mobile-open");

    return () => {
      document.body.classList.remove("chat-mobile-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  /* ── Clean up inline styles on close ── */
  useEffect(() => {
    if (!open) {
      requestAnimationFrame(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transform = "";
          sheetRef.current.style.transition = "";
          sheetRef.current.style.opacity = "";
        }
        if (overlayRef.current) {
          overlayRef.current.style.opacity = "";
          overlayRef.current.style.transition = "";
        }
      });
    }
  }, [open]);

  /* ── Swipe-down handlers ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const isHandle = !!target.closest("[data-sheet-handle]");

    if (!isHandle) {
      const scrollArea = sheetRef.current?.querySelector(".chat-scroll-area");
      if (scrollArea && scrollArea.scrollTop > 0) return;
    }

    dragRef.current = { startY: e.touches[0].clientY, currentY: 0, active: true };
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.active) return;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    if (dy <= 0) return;
    dragRef.current.currentY = dy;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
    if (overlayRef.current) overlayRef.current.style.opacity = `${Math.max(0, 1 - dy / 350)}`;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!dragRef.current.active) return;
    const dy = dragRef.current.currentY;
    dragRef.current = { startY: 0, currentY: 0, active: false };

    if (dy > SWIPE_THRESHOLD) {
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 250ms ease-in, opacity 250ms ease-in";
        sheetRef.current.style.transform = "translateY(105%)";
        sheetRef.current.style.opacity = "0";
      }
      if (overlayRef.current) {
        overlayRef.current.style.transition = "opacity 250ms ease-in";
        overlayRef.current.style.opacity = "0";
      }
      setTimeout(() => {
        onClose();
        requestAnimationFrame(() => {
          if (sheetRef.current) {
            sheetRef.current.style.transform = "";
            sheetRef.current.style.transition = "";
            sheetRef.current.style.opacity = "";
          }
          if (overlayRef.current) {
            overlayRef.current.style.opacity = "";
            overlayRef.current.style.transition = "";
          }
        });
      }, 260);
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 200ms ease-out";
        sheetRef.current.style.transform = "";
      }
      if (overlayRef.current) {
        overlayRef.current.style.transition = "opacity 200ms ease-out";
        overlayRef.current.style.opacity = "";
      }
      setTimeout(() => {
        if (sheetRef.current) sheetRef.current.style.transition = "";
        if (overlayRef.current) overlayRef.current.style.transition = "";
      }, 210);
    }
  }, [onClose]);

  return (
    <div
      className={cn("fixed inset-0 z-[70] md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <button
        ref={overlayRef}
        type="button"
        aria-label="Đóng hỗ trợ kỹ thuật THL"
        className={cn(
          "absolute inset-0 bg-slate-950/35 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-[2px]",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom))] transition-all duration-300 ease-out",
          open ? "translate-y-0 opacity-100" : "translate-y-[105%] opacity-0"
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="mx-auto flex h-[88dvh] max-h-[calc(100dvh-0.35rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[1.75rem] rounded-b-lg border border-slate-200/70 bg-[#fffefc] shadow-[0_-8px_40px_-16px_rgba(15,23,42,0.4)]">
          <div
            data-sheet-handle
            className="shrink-0 cursor-grab px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] active:cursor-grabbing"
          >
            <div className="relative flex items-center justify-center">
              <span className="h-[3.5px] w-11 rounded-full bg-slate-300/90" />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-0 rounded-full text-slate-500 hover:bg-white hover:text-slate-800"
                onClick={onClose}
                aria-label="Đóng hỗ trợ kỹ thuật THL"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
