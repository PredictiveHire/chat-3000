export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start animate-bubble-in">
      <div className="flex items-center gap-[5px] rounded-2xl rounded-tl-sm bg-card px-4 py-3.5 ring-1 ring-black/10 shadow-[var(--shadow-border)]">
        <span
          className="size-1.5 rounded-full bg-muted-foreground animate-pulse-scale"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground animate-pulse-scale"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground animate-pulse-scale"
          style={{ animationDelay: "400ms" }}
        />
      </div>
    </div>
  );
}
