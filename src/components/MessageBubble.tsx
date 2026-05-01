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
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isInterviewer
            ? "rounded-tl-sm bg-[#EFEFEF] text-card-foreground"
            : "rounded-tr-sm bg-primary text-black ring-1 ring-black/10",
        )}
      >
        {children}
      </div>
    </div>
  );
}
