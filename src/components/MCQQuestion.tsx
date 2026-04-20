"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MCQQuestionProps = {
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export function MCQQuestion({ options, onSelect, disabled }: MCQQuestionProps) {
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
      className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-border)]"
    >
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
              "animate-bubble-in group flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium transition-[background-color,color,scale] duration-150 ease-out",
              isChosen
                ? "bg-chat-primary text-chat-primary-foreground"
                : "text-foreground hover:bg-chat-primary/10",
              locked && !isChosen && "cursor-not-allowed opacity-40",
              !locked && "active:scale-[0.99]",
            )}
          >
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
