import { cn } from "@/lib/utils";

type AssistantMessageProps = {
  role: "user" | "assistant";
  text: string;
};

const emphasizedPrefixes = [
  "Nhận định nhanh:",
  "Khả năng cao:",
  "Cần chốt thêm:",
  "Mã / hướng khả dĩ:",
  "Mã đề xuất:",
  "Không nên dùng:",
  "Giá:",
  "Nhãn hàng đề xuất:",
  "Căn cứ chọn:",
  "Lưu ý dễ nhầm:",
  "Lưu ý:",
  "Câu hỏi tiếp theo:",
];

export function AssistantMessage({ role, text }: AssistantMessageProps) {
  const isAssistant = role === "assistant";
  const lines = text.split("\n");

  return (
    <div className={cn("flex w-full", isAssistant ? "justify-start pr-6 sm:pr-10" : "justify-end pl-6 sm:pl-10")}>
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-4 py-3 text-[13px] leading-[1.7] sm:text-sm",
          isAssistant
            ? "border border-blue-100/60 bg-gradient-to-b from-blue-50/40 via-white to-white text-slate-700 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.1)]"
            : "bg-slate-800 text-white shadow-[0_2px_10px_-6px_rgba(15,23,42,0.35)]"
        )}
      >
        <div className="space-y-2">
          {lines.map((line, index) => {
            const trimmed = line.trim();

            if (!trimmed) {
              return <div key={`line-gap-${index}`} className="h-1" />;
            }

            if (trimmed.startsWith("- ")) {
              return (
                <p key={`line-item-${index}`} className="relative pl-3.5 whitespace-pre-wrap break-words">
                  <span className="absolute left-0 top-[0.55rem] size-1 rounded-full bg-slate-400" />
                  {trimmed.slice(2)}
                </p>
              );
            }

            const isEmphasized = emphasizedPrefixes.some((prefix) => trimmed.startsWith(prefix));

            return (
              <p
                key={`line-text-${index}`}
                className={cn(
                  "whitespace-pre-wrap break-words",
                  isAssistant && isEmphasized ? "font-semibold text-slate-800" : "font-normal"
                )}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
