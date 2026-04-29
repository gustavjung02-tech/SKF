"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, SendHorizonal, X } from "lucide-react";
import { AssistantMessage } from "./assistant-message";
import { ChatMessageOptions } from "./chat-message-options";
import { ContactCta } from "./contact-cta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  applyDiscoverySelection,
  buildDiscoveryContext,
  createInitialDiscoveryState,
  getPromptForStage,
  type DiscoveryPrompt,
  type DiscoveryStage,
  type DiscoveryState,
} from "@/lib/assistant/discovery-flow";
import { parseIntentInput, type ParsedIntent } from "@/lib/assistant/intent-parser";
import {
  coerceAssistantResponse,
  type AssistantStructuredResponse,
} from "@/lib/assistant/schemas";
import {
  buildAssistantReplyMessage,
  buildConversationalReply,
  buildErrorFallbackMessage,
  isConversationalIntent,
  type ReplyOptionStyle,
} from "@/lib/assistant/reply-templates";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";
type AssistantUiState = "idle" | "typing" | "waiting_api" | "rendering_reply";
type MessageOptionAction = "discovery" | "submit";

type UiMessage = {
  id: string;
  role: ChatRole;
  text: string;
  payload?: AssistantStructuredResponse;
  options?: string[];
  optionStyle?: ReplyOptionStyle;
  optionAction?: MessageOptionAction;
  isOptionResolved?: boolean;
  selectedOption?: string | null;
  discoveryStage?: DiscoveryStage | null;
  showContactCta?: boolean;
};

type AssistantPanelProps = {
  mode?: "mobile" | "desktop";
  onClose: () => void;
  className?: string;
  showCloseButton?: boolean;
};

const defaultGreeting =
  "Chào anh/chị, THL hỗ trợ đối chiếu NTN, Tsubaki và vật tư truyền động theo mã cũ, ảnh tem hoặc mô tả cụm máy.";

const INTERNAL_FIELD_TOKENS = [
  "exact_code", "normalized_code", "dimensions", "application_detail",
  "old_code", "shaft_size", "seal_or_shield", "confusion_note",
  "product_group", "input_style", "discovery_stage", "final_status",
  "recommended_items", "missing_fields", "buying_motive", "avoid_recommendation",
];

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getHumanDelay(input: { kind: "discovery" | "api_reply" | "status"; textLength?: number }): number {
  if (input.kind === "status") {
    return randomInt(90, 180);
  }

  if (input.kind === "discovery") {
    const lengthBoost = Math.min(130, Math.floor((input.textLength ?? 0) / 60) * 25);
    return randomInt(700, 1200) + lengthBoost;
  }

  const apiBoost = Math.min(180, Math.floor((input.textLength ?? 0) / 120) * 30);
  return randomInt(1200, 1800) + apiBoost;
}

function toApiMessages(messages: UiMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.text,
  }));
}

function sanitizeReply(text: string): string {
  let cleaned = text;

  for (const token of INTERNAL_FIELD_TOKENS) {
    cleaned = cleaned.replaceAll(token, "");
  }

  return cleaned.replace(/ {2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function sanitizeOptions(options: string[]): string[] {
  const cleaned = options
    .map((option) => sanitizeReply(option))
    .map((option) => option.replace(/[.;:,]+$/g, "").trim())
    .filter((option) => option.length > 0);

  return Array.from(new Set(cleaned));
}

function getDiscoveryOptionLabel(option: string): string {
  if (option === "Tôi có ảnh tem / ảnh mẫu") {
    return "Tôi có ảnh tem";
  }

  if (option === "Tôi chỉ biết hệ máy / triệu chứng") {
    return "Tôi mô tả theo máy";
  }

  return option;
}

function getDiscoveryOptionStyle(stage: DiscoveryStage, optionsLength: number): ReplyOptionStyle {
  if (stage.startsWith("machine_flow") || optionsLength > 4) {
    return "stacked";
  }

  return "chips";
}

function buildDiscoveryPromptMessage(prompt: DiscoveryPrompt): UiMessage {
  const options = sanitizeOptions(prompt.options.map(getDiscoveryOptionLabel));

  return {
    id: createId(),
    role: "assistant",
    text: sanitizeReply(prompt.message),
    options,
    optionStyle: getDiscoveryOptionStyle(prompt.stage, options.length),
    optionAction: "discovery",
    isOptionResolved: false,
    selectedOption: null,
    discoveryStage: prompt.stage,
  };
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label="Đang soạn">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-[5px] rounded-full bg-slate-400"
          style={{
            animation: "typing-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </span>
  );
}

function buildPromptFromParsed(parsed: ParsedIntent): DiscoveryPrompt {
  const normalized = parsed.normalized_text;

  if (normalized.includes("hino") || normalized.includes("xe tai") || normalized.includes("4hk1")) {
    return {
      stage: "machine_flow_1",
      message: "Anh/chị đang kiểm tra vòng bi ở cụm nào: bánh xe, máy phát, puly tăng, lốc lạnh hay hộp số?",
      options: ["Bánh xe", "Máy phát", "Puly tăng", "Lốc lạnh", "Hộp số"],
    };
  }

  if (normalized.includes("spindle") || normalized.includes("cnc")) {
    return {
      stage: "machine_flow_1",
      message: "Anh/chị đang kiểm tra cụm nào trên spindle: ổ trước, ổ sau, puly truyền hay cụm phớt?",
      options: ["Ổ trước spindle", "Ổ sau spindle", "Puly truyền", "Cụm phớt", "Chưa rõ vị trí"],
    };
  }

  if (normalized.includes("may bom") || normalized.includes("bom")) {
    return {
      stage: "machine_flow_1",
      message: "Em cần khoanh đúng cụm trước. Máy đang nóng ở ổ trục, puly hay vị trí phớt?",
      options: ["Ổ trục bơm", "Puly bơm", "Cụm phớt", "Khớp nối", "Chưa rõ vị trí"],
    };
  }

  return (
    getPromptForStage("greeting") ?? {
      stage: "greeting",
      message: "Anh/chị đang có mã cũ hay đang mô tả theo máy?",
      options: ["Tôi có mã cũ", "Tôi có ảnh tem", "Tôi mô tả theo máy", "Tôi cần thay gấp"],
    }
  );
}

function createInitialMessages(): UiMessage[] {
  const starter: UiMessage[] = [
    {
      id: createId(),
      role: "assistant",
      text: defaultGreeting,
      isOptionResolved: true,
    },
  ];

  const greetingPrompt = getPromptForStage("greeting");
  if (greetingPrompt) {
    starter.push(buildDiscoveryPromptMessage(greetingPrompt));
  }

  return starter;
}

export function AssistantPanel({
  mode = "desktop",
  onClose,
  className,
  showCloseButton = true,
}: AssistantPanelProps) {
  const isMobile = mode === "mobile";

  const [messages, setMessages] = useState<UiMessage[]>(() => createInitialMessages());
  const [inputValue, setInputValue] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [assistantUiState, setAssistantUiState] = useState<AssistantUiState>("idle");
  const [providerInfo, setProviderInfo] = useState<{ provider: string; model: string } | null>(null);
  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>(() => createInitialDiscoveryState());

  const isBusy = assistantUiState !== "idle";

  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<UiMessage[]>(messages);
  const discoveryRef = useRef<DiscoveryState>(discoveryState);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    discoveryRef.current = discoveryState;
  }, [discoveryState]);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, assistantUiState]);

  function commitMessages(nextMessages: UiMessage[]): UiMessage[] {
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    return nextMessages;
  }

  function updateMessages(updater: (prev: UiMessage[]) => UiMessage[]): UiMessage[] {
    const nextMessages = updater(messagesRef.current);
    return commitMessages(nextMessages);
  }

  function appendMessage(message: UiMessage): UiMessage[] {
    return updateMessages((prev) => [...prev, message]);
  }

  function appendAssistantMessage(message: Omit<UiMessage, "id" | "role">): UiMessage[] {
    const cleanedText = sanitizeReply(message.text);
    const cleanedOptions = sanitizeOptions(message.options ?? []);
    const hasOptions = cleanedOptions.length > 0;

    return appendMessage({
      id: createId(),
      role: "assistant",
      text: cleanedText,
      payload: message.payload,
      options: hasOptions ? cleanedOptions : undefined,
      optionStyle: message.optionStyle ?? "chips",
      optionAction: hasOptions ? message.optionAction ?? "submit" : undefined,
      isOptionResolved: hasOptions ? message.isOptionResolved ?? false : true,
      selectedOption: message.selectedOption ?? null,
      discoveryStage: message.discoveryStage ?? null,
      showContactCta: message.showContactCta ?? false,
    });
  }

  function resolveOptionMessage(messageId: string, selectedOption?: string): void {
    updateMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        return {
          ...message,
          isOptionResolved: true,
          selectedOption: selectedOption ?? message.selectedOption ?? null,
        };
      })
    );
  }

  function resolveAllOpenOptions(): void {
    updateMessages((prev) =>
      prev.map((message) => {
        if (!message.options || message.isOptionResolved) {
          return message;
        }

        return {
          ...message,
          isOptionResolved: true,
        };
      })
    );
  }

  async function appendDiscoveryPrompt(prompt: DiscoveryPrompt): Promise<void> {
    setAssistantUiState("typing");
    await wait(getHumanDelay({ kind: "discovery", textLength: prompt.message.length }));
    appendMessage(buildDiscoveryPromptMessage(prompt));
    setAssistantUiState("idle");
  }

  async function requestAssistant(
    history: UiMessage[],
    parsedContext: ParsedIntent | null,
    overrideDiscoveryState?: DiscoveryState
  ) {
    const effectiveDiscoveryState = overrideDiscoveryState ?? discoveryRef.current;
    const hasDiscoveryContext = effectiveDiscoveryState.selectedPath.length > 0;
    const discoveryContext = hasDiscoveryContext ? buildDiscoveryContext(effectiveDiscoveryState) : null;

    setAssistantUiState("waiting_api");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: toApiMessages(history),
          discovery_context: discoveryContext,
          parsed_context: parsedContext,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        result?: unknown;
        provider?: string;
        model_used?: string;
      };

      if (payload.provider) {
        setProviderInfo({ provider: payload.provider, model: payload.model_used ?? "" });
      }

      if (!response.ok || !payload.ok) {
        const latestUserText = [...history].reverse().find((message) => message.role === "user")?.text ?? "";
        const fallback = buildErrorFallbackMessage({
          latestUserText,
          intentRoute: parsedContext?.intent_route ?? null,
        });

        setAssistantUiState("rendering_reply");
        await wait(getHumanDelay({ kind: "api_reply", textLength: fallback.text.length }));

        appendAssistantMessage({
          text: fallback.text,
          options: fallback.options,
          optionStyle: fallback.optionStyle,
          optionAction: "submit",
          isOptionResolved: false,
        });

        return;
      }

      const structured = coerceAssistantResponse(payload.result);
      const latestUserText = [...history].reverse().find((message) => message.role === "user")?.text ?? "";
      const builtReply = buildAssistantReplyMessage({
        payload: structured,
        latestUserText,
        intentRoute: parsedContext?.intent_route ?? null,
      });

      setAssistantUiState("rendering_reply");
      await wait(getHumanDelay({ kind: "api_reply", textLength: builtReply.text.length }));

      appendAssistantMessage({
        text: builtReply.text,
        payload: structured,
        options: builtReply.options,
        optionStyle: builtReply.optionStyle,
        optionAction: builtReply.options && builtReply.options.length > 0 ? "submit" : undefined,
        showContactCta: builtReply.showContactCta,
      });
    } catch {
      const latestUserText = [...history].reverse().find((message) => message.role === "user")?.text ?? "";
      const fallback = buildErrorFallbackMessage({
        latestUserText,
        intentRoute: parsedContext?.intent_route ?? null,
      });

      setAssistantUiState("rendering_reply");
      await wait(getHumanDelay({ kind: "api_reply", textLength: fallback.text.length }));

      appendAssistantMessage({
        text: fallback.text,
        options: fallback.options,
        optionStyle: fallback.optionStyle,
        optionAction: "submit",
        isOptionResolved: false,
      });
    } finally {
      setAssistantUiState("idle");
    }
  }

  async function continueDiscoveryFlow(sourceMessageId: string, option: string) {
    const displayOption = getDiscoveryOptionLabel(option);

    resolveOptionMessage(sourceMessageId, displayOption);
    appendMessage({
      id: createId(),
      role: "user",
      text: displayOption,
      isOptionResolved: true,
    });

    const transition = applyDiscoverySelection(discoveryRef.current, option);
    setDiscoveryState(transition.nextState);
    discoveryRef.current = transition.nextState;

    if (transition.nextPrompt) {
      await appendDiscoveryPrompt(transition.nextPrompt);
      return;
    }

    if (transition.shouldSubmit) {
      setAssistantUiState("typing");
      await wait(getHumanDelay({ kind: "status" }));

      appendAssistantMessage({
        text: "Đã ghi nhận, em đang đối chiếu nhanh theo cụm máy...",
        isOptionResolved: true,
      });

      await requestAssistant(messagesRef.current, transition.nextState.parsed, transition.nextState);
    }
  }

  async function handleMessageOption(messageId: string, option: string) {
    if (isBusy) {
      return;
    }

    const source = messagesRef.current.find((message) => message.id === messageId);
    if (!source || source.isOptionResolved) {
      return;
    }

    if (source.optionAction === "discovery") {
      await continueDiscoveryFlow(messageId, option);
      return;
    }

    if (option === "Thử lại") {
      resolveOptionMessage(messageId);
      const lastUserMsg = [...messagesRef.current].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        const parsed = parseIntentInput(lastUserMsg.text);
        const collapsedState: DiscoveryState = {
          ...discoveryRef.current,
          stage: "none",
          parsed,
        };
        setDiscoveryState(collapsedState);
        discoveryRef.current = collapsedState;
        await requestAssistant(messagesRef.current, parsed, collapsedState);
      }
      return;
    }

    const displayOption = getDiscoveryOptionLabel(option);
    resolveOptionMessage(messageId, displayOption);

    appendMessage({
      id: createId(),
      role: "user",
      text: displayOption,
      isOptionResolved: true,
    });

    const parsed = parseIntentInput(displayOption);
    const collapsedState: DiscoveryState = {
      ...discoveryRef.current,
      stage: "none",
      parsed,
    };

    setDiscoveryState(collapsedState);
    discoveryRef.current = collapsedState;

    await requestAssistant(messagesRef.current, parsed, collapsedState);
  }

  async function submitMessage(rawText: string) {
    const content = rawText.trim();

    if (!content || isBusy) {
      return;
    }

    const parsed = parseIntentInput(content);
    resolveAllOpenOptions();

    appendMessage({
      id: createId(),
      role: "user",
      text: content,
      isOptionResolved: true,
    });

    setInputValue("");

    if (parsed.should_trigger_discovery) {
      const nextState = createInitialDiscoveryState();
      nextState.parsed = parsed;

      setDiscoveryState(nextState);
      discoveryRef.current = nextState;

      await appendDiscoveryPrompt(buildPromptFromParsed(parsed));
      return;
    }

    /* Conversational intents — reply locally, no API call */
    if (isConversationalIntent(parsed.intent_route)) {
      setAssistantUiState("typing");
      const reply = buildConversationalReply(parsed.intent_route, content);
      await wait(getHumanDelay({ kind: "discovery", textLength: reply.text.length }));
      appendAssistantMessage({ text: reply.text });
      setAssistantUiState("idle");
      return;
    }

    const collapsedState: DiscoveryState = {
      ...discoveryRef.current,
      stage: "none",
      parsed,
    };

    setDiscoveryState(collapsedState);
    discoveryRef.current = collapsedState;

    await requestAssistant(messagesRef.current, parsed, collapsedState);
  }

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-[#fffefc] via-white to-[#fffdfa] text-slate-900",
        className
      )}
      role="dialog"
      aria-label="Hỗ trợ kỹ thuật THL"
    >
      <div className="shrink-0 border-b border-slate-200/65 bg-white/85 px-4 pb-2.5 pt-2 supports-[backdrop-filter]:backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {isMobile && (
              <p className="mb-1 inline-flex rounded-full border border-blue-200/70 bg-blue-50/85 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-900/85">
                Hỗ trợ trực tuyến
              </p>
            )}
            <h3 className="font-heading text-[15px] font-semibold tracking-tight text-slate-900">Hỗ trợ kỹ thuật THL</h3>
            <p className="mt-0.5 text-[11.5px] leading-[1.45] text-slate-500">
              Đối chiếu NTN, Tsubaki và vật tư truyền động.
            </p>
          </div>
          {showCloseButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="mt-0.5 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              onClick={onClose}
              aria-label="Đóng hỗ trợ kỹ thuật THL"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="chat-scroll-area flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain px-3.5 py-4 sm:gap-4 sm:px-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-0.5">
              <AssistantMessage role={message.role} text={message.text} />

              {message.role === "assistant" && message.showContactCta && (
                <div className="pl-1">
                  <ContactCta />
                </div>
              )}

              {message.role === "assistant" && message.options && message.options.length > 0 && (
                <ChatMessageOptions
                  options={message.options}
                  onSelect={(option) => void handleMessageOption(message.id, option)}
                  disabled={isBusy}
                  selectedOption={message.selectedOption}
                  isResolved={Boolean(message.isOptionResolved)}
                  styleType={message.optionStyle}
                  isMobile={isMobile}
                />
              )}
            </div>
          ))}

          {assistantUiState !== "idle" && (
            <div className="flex w-full justify-start pr-10">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-100/60 bg-gradient-to-b from-blue-50/40 via-white to-white px-4 py-3 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.1)]">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomAnchorRef} />
        </div>

        <div
          className={cn(
            "shrink-0 border-t border-slate-200/65 bg-white/92 px-3.5 pb-3 pt-2.5 supports-[backdrop-filter]:backdrop-blur-sm sm:px-4",
            isMobile ? "pb-[calc(0.75rem+env(safe-area-inset-bottom))]" : ""
          )}
        >
          <div className="flex items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300/80 bg-white px-3 text-[12px] text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50">
              <ImagePlus className="size-3.5" />
              Tải ảnh
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setSelectedFileName(file?.name ?? "");
                }}
              />
            </label>
            {selectedFileName && <p className="truncate text-[12px] text-slate-500">{selectedFileName}</p>}
          </div>

          <div
            className={cn(
              "mt-2 flex items-end gap-2 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)]",
              isMobile ? "rounded-[1.1rem]" : ""
            )}
          >
            <Textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitMessage(inputValue);
                }
              }}
              placeholder="Nhập mã, kích thước hoặc cụm máy..."
              className="min-h-10 max-h-32 flex-1 resize-none border-0 bg-transparent px-1.5 py-1.5 text-[13px] leading-6 shadow-none placeholder:text-slate-400 focus-visible:ring-0 sm:text-sm"
            />
            <Button
              type="button"
              size="sm"
              className="h-10 shrink-0 rounded-xl bg-blue-700 px-3 text-[12px] font-semibold text-white shadow-[0_12px_20px_-16px_rgba(29,78,216,0.85)] hover:bg-blue-800 disabled:bg-blue-600/70 disabled:opacity-60"
              onClick={() => void submitMessage(inputValue)}
              disabled={isBusy || inputValue.trim().length === 0}
              aria-label="Gửi yêu cầu đối chiếu"
            >
              <SendHorizonal className="mr-1 size-3.5" />
              Gửi
            </Button>
          </div>

          <p className="mt-1.5 px-1 text-[10.5px] leading-4 text-slate-400">
            Trả lời theo ứng dụng thực tế. Giá xác nhận riêng.
          </p>

          {process.env.NEXT_PUBLIC_SHOW_ASSISTANT_PROVIDER === "true" && providerInfo && (
            <div className="mt-1 px-1 text-[10px] leading-4 text-slate-400/80">
              <p>AI: {providerInfo.provider}</p>
              <p>Model: {providerInfo.model || "(không xác định)"}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
