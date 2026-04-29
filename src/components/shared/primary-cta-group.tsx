import Link from "next/link";
import { MessageCircle, PhoneCall, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PrimaryCtaGroupProps = {
  className?: string;
  submitLabel?: string;
  callLabel?: string;
  zaloLabel?: string;
};

export function PrimaryCtaGroup({
  className,
  submitLabel = "Gửi yêu cầu kỹ thuật",
  callLabel = "Liên hệ B2B",
  zaloLabel = "Zalo kinh doanh",
}: PrimaryCtaGroupProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", className)}>
      <Button asChild className="h-11 bg-blue-800 px-4 text-sm hover:bg-blue-900">
        <Link href="/tra-ma-bao-gia">
          <Search className="mr-2 size-4" />
          {submitLabel}
        </Link>
      </Button>
      <Button asChild variant="outline" className="h-11 border-blue-200 bg-blue-50 px-4 text-blue-800 hover:bg-blue-100">
        <a href={siteConfig.zaloLink} target="_blank" rel="noreferrer">
          <MessageCircle className="mr-2 size-4" />
          {zaloLabel}
        </a>
      </Button>
      <Button asChild variant="outline" className="h-11 border-blue-300 bg-white px-4 text-blue-900 hover:bg-blue-50">
        <a href={siteConfig.phoneHref}>
          <PhoneCall className="mr-2 size-4" />
          {callLabel}
        </a>
      </Button>
    </div>
  );
}
