import type { ReplyOptionStyle } from "@/lib/assistant/reply-templates";
import { cn } from "@/lib/utils";
import { ChatOptionChips } from "./chat-option-chips";

type ChatMessageOptionsProps = {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
  selectedOption?: string | null;
  isResolved?: boolean;
  styleType?: ReplyOptionStyle;
  isMobile?: boolean;
};

export function ChatMessageOptions({
  options,
  onSelect,
  disabled = false,
  selectedOption = null,
  isResolved = false,
  styleType = "chips",
  isMobile = false,
}: ChatMessageOptionsProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex w-full justify-start pr-6 sm:pr-10", isMobile ? "mt-2" : "mt-1.5")}>
      <div className="max-w-[92%]">
        <ChatOptionChips
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          selectedOption={selectedOption}
          isResolved={isResolved}
          styleType={styleType}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
