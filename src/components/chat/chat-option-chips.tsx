import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReplyOptionStyle } from "@/lib/assistant/reply-templates";

type ChatOptionChipsProps = {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
  selectedOption?: string | null;
  styleType?: ReplyOptionStyle;
  isResolved?: boolean;
  isMobile?: boolean;
};

export function ChatOptionChips({
  options,
  onSelect,
  disabled = false,
  selectedOption = null,
  styleType = "chips",
  isResolved = false,
  isMobile = false,
}: ChatOptionChipsProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", styleType === "stacked" ? "space-y-2" : "flex flex-wrap gap-2")}> 
      {options.map((option) => {
        const isSelected = selectedOption === option;

        return (
          <Button
            key={option}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto min-h-9 border bg-white px-3 py-1.5 text-left text-[12.5px] font-medium leading-5 shadow-sm transition",
              styleType === "chips" ? "rounded-2xl" : "w-full justify-start rounded-xl",
              isMobile ? "px-3 py-2 text-[12.5px]" : "text-[13px]",
              isSelected
                ? "border-blue-300 bg-blue-50 text-blue-900"
                : "border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900",
              (disabled || isResolved) && "cursor-not-allowed opacity-70 hover:border-slate-200 hover:bg-white hover:text-slate-700"
            )}
            onClick={() => onSelect(option)}
            disabled={disabled || isResolved}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}
