"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Maximize2, Minimize2, List } from "lucide-react";
import { cn } from "@/lib/utils";

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
      expanded ? "fixed inset-0 z-50 bg-background p-4" : "px-3 pb-3 pt-0"
    )}>
      <form onSubmit={onSubmit} className={cn("flex flex-col", expanded && "h-full")}>
        <div className={cn(
          "relative flex rounded-2xl border border-input bg-white focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
          expanded ? "flex-col flex-1" : "flex-row items-end sm:flex-col sm:items-stretch"
        )}>
          <textarea
            ref={textareaRef}
            rows={viewport.width > 0 && viewport.width < 640 && !expanded ? 1 : 4}
            value={text}
            onChange={(e) => { setText(e.target.value); onTextChange?.(e.target.value); }}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              expanded 
                ? "flex-1 p-4" 
                : "min-h-10 py-2.5 pl-4 pr-10 sm:min-h-24 sm:px-4 sm:pt-3 sm:pr-4"
            )}
            style={{ overflowY: "hidden" }}
            aria-label="Your reply"
          />
          
          <div className={cn(
            "flex items-center",
            expanded ? "justify-end p-3" : "pb-1 pl-2 pr-1 sm:justify-between sm:px-3 sm:pb-2 sm:pt-1"
          )}>
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={insertBullet}
                className="hidden sm:flex size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5"
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
                "size-8 shrink-0 rounded-full bg-chat-primary text-chat-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-chat-primary/90 active:not-disabled:scale-[0.96]",
                !expanded && "mb-0.5 sm:mb-0"
              )}
              aria-label="Send reply"
            >
              <SendHorizontal className="size-3.5" />
            </Button>
          </div>

          {/* Expand/Collapse Button (Mobile Only) */}
          {(showExpand || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "absolute flex items-center justify-center size-8 rounded-full text-muted-foreground hover:bg-black/5 active:scale-[0.96] transition-transform sm:hidden",
                expanded ? "top-3 right-3" : "top-1 right-1"
              )}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          )}
        </div>
      </form>
      
      {/* Mobile hint text (outside container) */}
      {!expanded && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          We encourage you to share more about your experiences to get better evaluation
        </p>
      )}
    </div>
  );
}
