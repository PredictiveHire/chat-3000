"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUp, Maximize2, Minimize2, List } from "lucide-react";
import { cn } from "@/lib/utils";

function WordCount({ text, min }: { text: string; min: number }) {
  const count = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const met = count >= min;
  return (
    <span className={cn(
      "shrink-0 tabular-nums text-xs font-medium transition-colors",
      count === 0 ? "text-muted-foreground/50" : met ? "text-green-500" : "text-muted-foreground"
    )}>
      {count}<span className="text-muted-foreground/50">/{min}</span>
    </span>
  );
}

type ReplyBarProps = {
  onSend: (text: string) => void;
  onTextChange?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialText?: string;
};

export function ReplyBar({
  onSend,
  onTextChange,
  disabled,
  placeholder = "Share your experiences...",
  initialText = "",
}: ReplyBarProps) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);
  const [expanded, setExpanded] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_TEXTAREA_HEIGHT = 340;

  useEffect(() => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Run after every render where `text` changed so React has already
  // committed the new value to the DOM before we measure scrollHeight.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    
    if (expanded) {
      el.style.height = "auto";
      el.style.overflowY = "auto";
      return;
    }

    // Reset to 0 temporarily so scrollHeight can shrink if text is deleted
    el.style.height = "0px";
    const scrollHeight = el.scrollHeight;
    
    const isMobile = viewport.width > 0 && viewport.width < 640;
    const maxH = isMobile ? viewport.height * 0.2 : MAX_TEXTAREA_HEIGHT;
    
    el.style.height = `${Math.min(scrollHeight, maxH)}px`;
    el.style.overflowY = scrollHeight > maxH ? "auto" : "hidden";
    setShowExpand(isMobile && scrollHeight >= maxH);
  }, [text, expanded, viewport]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    setExpanded(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      textareaRef.current.style.overflowY = "hidden";
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const insertBullet = () => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    
    // Check if current line already has a bullet
    const beforeCursor = text.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf("\n");
    const currentLineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const currentLine = beforeCursor.substring(currentLineStart);
    
    let newText;
    let newCursorPos;

    if (currentLine.trim() === "") {
      // Empty line, just add bullet
      const prefix = beforeCursor;
      const suffix = text.substring(end);
      newText = prefix + "• " + suffix;
      newCursorPos = start + 2;
    } else if (currentLine.startsWith("• ")) {
      // Already has bullet, maybe remove it or add new line with bullet?
      // For simplicity, let's just add a new line with bullet
      const prefix = text.substring(0, start);
      const suffix = text.substring(end);
      newText = prefix + "\n• " + suffix;
      newCursorPos = start + 3;
    } else {
      // Has text, add new line with bullet
      const prefix = text.substring(0, start);
      const suffix = text.substring(end);
      newText = prefix + "\n• " + suffix;
      newCursorPos = start + 3;
    }

    setText(newText);
    
    // Reset focus and cursor position after React re-renders
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
      return;
    }

    // Auto-continue bullets
    if (e.key === "Enter" && e.shiftKey) {
      const el = textareaRef.current;
      if (!el) return;
      
      const start = el.selectionStart;
      const beforeCursor = text.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf("\n");
      const currentLineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = beforeCursor.substring(currentLineStart);

      if (currentLine.startsWith("• ")) {
        if (currentLine.trim() === "•") {
          // Empty bullet, just remove it
          e.preventDefault();
          const prefix = text.substring(0, currentLineStart);
          const suffix = text.substring(el.selectionEnd);
          setText(prefix + suffix);
          setTimeout(() => {
            el.selectionStart = currentLineStart;
            el.selectionEnd = currentLineStart;
          }, 0);
        } else {
          // Continue bullet on next line
          e.preventDefault();
          const prefix = text.substring(0, start);
          const suffix = text.substring(el.selectionEnd);
          setText(prefix + "\n• " + suffix);
          setTimeout(() => {
            el.selectionStart = start + 3;
            el.selectionEnd = start + 3;
          }, 0);
        }
      }
    }
  };

  return (
    <div className={cn(
      "flex flex-col",
      !expanded && "animate-fade-up",
      expanded ? "fixed inset-x-0 bottom-0 top-[76px] z-[300] bg-background/80 backdrop-blur-md p-4 sm:inset-0" : "px-3 pb-3 pt-0"
    )}>
      <form onSubmit={onSubmit} className={cn("flex flex-col", expanded && "h-full")}>
        <div className={cn(
          "relative flex flex-col rounded-[20px] bg-[#F4F4F4] shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
          expanded && "flex-1"
        )}>
        <div className={cn(
          "relative flex flex-col rounded-[16px] border border-[#e5e5e5] bg-white",
          expanded && "flex-1"
        )}>
          <textarea
            ref={textareaRef}
            rows={expanded ? undefined : 3}
            value={text}
            onChange={(e) => { setText(e.target.value); onTextChange?.(e.target.value); }}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              expanded
                ? "flex-1 p-4"
                : "min-h-20 px-4 pt-3 pr-4 sm:min-h-24"
            )}
            aria-label="Your reply"
          />

          <div className={cn(
            "flex items-center",
            expanded ? "justify-end p-3" : "justify-between px-3 pb-2 pt-1"
          )}>
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={insertBullet}
                className="flex size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5"
                title="Add bullet point"
              >
                <List className="size-4" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={disabled || !text.trim()}
              size="icon"
              className={cn(
                "size-8 shrink-0 rounded-full bg-primary text-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:opacity-90 active:not-disabled:scale-[0.96]",
                !expanded && "mb-0.5 sm:mb-0"
              )}
              aria-label="Send reply"
            >
              <ArrowUp className="size-3.5" />
            </Button>
          </div>

          {/* Expand/Collapse Button (Mobile Only) */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "absolute flex items-center justify-center size-8 rounded-full text-muted-foreground hover:bg-black/5 active:scale-[0.96] transition-[background-color,scale] duration-150 ease-out sm:hidden",
              expanded ? "top-3 right-3" : "top-1 right-1"
            )}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
              <div className="relative size-4">
                <AnimatePresence initial={false} mode="popLayout">
                  {expanded ? (
                    <motion.span
                      key="minimize"
                      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Minimize2 className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="maximize"
                      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Maximize2 className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
        </div>
        </div>
      </form>
      
      {/* Word count hint */}
      {!expanded && (
        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            We encourage a minimum of 50 words so we can better evaluate your experience
          </p>
          <WordCount text={text} min={50} />
        </div>
      )}
    </div>
  );
}
