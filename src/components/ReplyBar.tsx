"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

type ReplyBarProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ReplyBar({
  onSend,
  disabled,
  placeholder = "Type your reply…",
}: ReplyBarProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_TEXTAREA_HEIGHT = 340;

  // Run after every render where `text` changed so React has already
  // committed the new value to the DOM before we measure scrollHeight.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Reset to 0 temporarily so scrollHeight can shrink if text is deleted
    el.style.height = "0px";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    el.style.overflowY = scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [text]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      textareaRef.current.style.overflowY = "hidden";
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col px-3 pb-3 pt-0">
      <form onSubmit={onSubmit}>
        <div className="flex flex-col rounded-2xl border border-input bg-white focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50">
          <textarea
            ref={textareaRef}
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="min-h-24 w-full resize-none bg-transparent px-4 pt-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            style={{ overflowY: "hidden" }}
            aria-label="Your reply"
          />
          <div className="flex items-center justify-between px-3 pb-2 pt-1">
            <p className="text-xs text-muted-foreground">
              We encourage you to share more about your experiences to get better evaluation
            </p>
            <Button
              type="submit"
              disabled={disabled || !text.trim()}
              size="icon"
              className="ml-2 size-8 shrink-0 rounded-full bg-chat-primary text-chat-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-chat-primary/90 active:not-disabled:scale-[0.96]"
              aria-label="Send reply"
            >
              <SendHorizontal className="size-3.5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
