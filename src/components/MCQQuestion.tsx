"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type MCQQuestionProps = {
  question?: string;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export function MCQQuestion({ question, options, onSelect, disabled }: MCQQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const pick = (opt: string) => {
    if (disabled || selected) return;
    setSelected(opt);
    onSelect(opt);
  };

  const locked = Boolean(disabled || selected);

  return (
    <div
      role="radiogroup"
      aria-label="Choose one answer"
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-border)]"
    >
      {question && (
        <div className="bg-muted/30 px-5 py-4 border-b border-border w-full relative">
          <h3 className="w-full pr-16 text-lg font-medium text-foreground leading-snug break-words">{question}</h3>
        </div>
      )}
      <div className="flex w-full flex-col gap-2 p-3 bg-muted/10">
        {options.map((opt, i) => {
          const isChosen = selected === opt;
          const isHovered = hovered === opt;

        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={isChosen}
            disabled={locked && !isChosen}
            onClick={() => pick(opt)}
            onMouseEnter={() => !locked && setHovered(opt)}
            onMouseLeave={() => setHovered(null)}
            style={{ animationDelay: `${i * 50}ms` }}
            className={cn(
              "animate-bubble-in group flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-300 ease-out-quart",
              isChosen
                ? "border-chat-primary bg-chat-primary text-chat-primary-foreground shadow-sm ring-2 ring-chat-primary/20 ring-offset-1"
                : "border-border bg-card text-foreground hover:border-chat-primary/30 hover:bg-chat-primary/5 hover:shadow-sm",
              locked && !isChosen && "cursor-not-allowed opacity-40 hover:border-border hover:bg-card hover:shadow-none",
              !locked && "active:scale-[0.98]",
            )}
          >
            <span className="transition-transform duration-300 ease-out-quart" style={{ transform: isChosen ? "translateX(2px)" : "translateX(0)" }}>{opt}</span>
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out-quart",
                isChosen ? "scale-100 bg-chat-primary-foreground text-chat-primary" : "scale-0 opacity-0"
              )}
            >
              <Check className="size-3.5 stroke-[3]" />
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}
