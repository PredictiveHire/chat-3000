"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
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

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <div className="flex flex-1 items-end rounded-2xl border border-input bg-white px-4 py-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => { setText(e.target.value); resize(); }}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="max-h-[300px] min-h-8 flex-1 resize-none bg-transparent py-0.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Your reply"
        />
      </div>
      <Button
        type="submit"
        disabled={disabled || !text.trim()}
        size="icon"
        className="relative mb-0.5 size-10 shrink-0 rounded-full bg-chat-primary text-chat-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-chat-primary/90 active:not-disabled:scale-[0.96]"
        aria-label="Send reply"
      >
        <SendHorizontal className="size-4" />
      </Button>
    </form>
    <p className="mt-2 text-center text-xs text-muted-foreground">
      We encourage you to share more about your experiences to get better evaluation
    </p>
    </div>
  );
}
