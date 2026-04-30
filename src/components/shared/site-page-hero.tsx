import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroCtaTone = "blue" | "red" | "outline";

type HeroCta = {
  label: string;
  href: string;
  external?: boolean;
  icon?: ReactNode;
  tone?: HeroCtaTone;
};

type SitePageHeroProps = {
  badge: string;
  title: string;
  highlightText?: string;
  description?: string;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  imageSrc: string;
  imageAlt: string;
  imagePriority?: boolean;
  className?: string;
  contentClassName?: string;
  imageContainerClassName?: string;
};

function renderTitle(title: string, highlightText?: string) {
  if (!highlightText) {
    return title;
  }

  const titleLower = title.toLowerCase();
  const highlightLower = highlightText.toLowerCase();
  const startIndex = titleLower.indexOf(highlightLower);

  if (startIndex < 0) {
    return title;
  }

  const endIndex = startIndex + highlightText.length;
  const before = title.slice(0, startIndex);
  const highlighted = title.slice(startIndex, endIndex);
  const after = title.slice(endIndex);

  return (
    <>
      {before}
      <span className="bg-gradient-to-r from-[#005BAC] via-[#1E6FD9] to-[#E31E24] bg-clip-text text-transparent">
        {highlighted}
      </span>
      {after}
    </>
  );
}

function HeroCtaButton({ cta }: { cta: HeroCta }) {
  const tone = cta.tone ?? "blue";
  const className =
    tone === "red"
      ? "h-11 bg-[#E30613] px-5 text-white hover:bg-[#c80511]"
      : tone === "outline"
        ? "h-11 border-[#0050A4]/25 bg-white px-5 text-[#0050A4] hover:bg-[#EEF4FB]"
        : "h-11 bg-[#0050A4] px-5 text-white hover:bg-[#003d7d]";

  if (cta.external) {
    return (
      <Button asChild className={className}>
        <a href={cta.href} target="_blank" rel="noreferrer">
          {cta.icon}
          {cta.label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <Link href={cta.href}>
        {cta.icon}
        {cta.label}
      </Link>
    </Button>
  );
}

export function SitePageHero({
  badge,
  title,
  highlightText,
  description,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt,
  imagePriority = false,
  className,
  contentClassName,
  imageContainerClassName,
}: SitePageHeroProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-[#DDE7F3] bg-white shadow-[0_20px_44px_-34px_rgba(15,23,42,0.28)]",
        className,
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[1.03fr_0.97fr] lg:items-stretch">
        <div className={cn("space-y-5 p-6 sm:p-8 lg:p-10", contentClassName)}>
          <p className="inline-flex rounded-full border border-[#0050A4]/20 bg-[#EEF4FB] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0050A4]">
            {badge}
          </p>
          <h1 className="max-w-[22ch] font-heading text-balance text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-[2.7rem]">
            {renderTitle(title, highlightText)}
          </h1>
          {description ? <p className="max-w-[60ch] text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <HeroCtaButton cta={primaryCta} />
            {secondaryCta ? <HeroCtaButton cta={secondaryCta} /> : null}
          </div>
        </div>

        <div
          className={cn(
            "relative min-h-[240px] overflow-hidden border-t border-[#DDE7F3] bg-slate-100 lg:min-h-[360px] lg:border-l lg:border-t-0",
            imageContainerClassName,
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={imagePriority}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/42 via-slate-950/8 to-transparent" />
        </div>
      </div>
    </section>
  );
}
