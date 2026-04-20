import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  role: "interviewer" | "candidate";
  children: React.ReactNode;
};

export function MessageBubble({ role, children }: MessageBubbleProps) {
  const isInterviewer = role === "interviewer";

  return (
    <div
      className={cn(
        "flex w-full animate-bubble-in",
        isInterviewer ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isInterviewer
            ? "rounded-tl-sm bg-card text-card-foreground ring-1 ring-black/10 shadow-[var(--shadow-border)]"
            : "rounded-tr-sm bg-chat-primary text-chat-primary-foreground ring-1 ring-chat-primary-foreground/10 shadow-[0px_1px_2px_-1px_rgba(61,21,57,0.06)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
