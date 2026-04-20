export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start animate-bubble-in">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card px-4 py-3.5 ring-1 ring-black/10 shadow-[var(--shadow-border)]">
        <span
          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "900ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "180ms", animationDuration: "900ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "360ms", animationDuration: "900ms" }}
        />
      </div>
    </div>
  );
}
