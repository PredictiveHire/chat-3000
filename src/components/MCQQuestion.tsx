"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBrand } from "@/lib/BrandContext";

type MCQQuestionProps = {
  question?: string;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export function MCQQuestion({ question, options, onSelect, disabled }: MCQQuestionProps) {
  const { accent } = useBrand();
  const [selected, setSelected] = useState<string | null>(null);

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
      className="w-full"
    >
      <div className="overflow-hidden rounded-[16px] border border-[#e5e5e5] bg-white">
        {options.map((opt, i) => {
          const isChosen = selected === opt;
          return (
            <div key={opt}>
              {i > 0 && <div className="mx-5 h-px bg-[#efefef]" />}
              <button
                type="button"
                role="radio"
                aria-checked={isChosen}
                disabled={locked && !isChosen}
                onClick={() => pick(opt)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn(
                  "animate-bubble-in flex w-full items-center gap-3 px-5 py-[14px] text-left transition-[background-color] duration-150",
                  isChosen ? "bg-[#f2f2f2]" : "hover:bg-[#fafafa]",
                  locked && !isChosen && "cursor-not-allowed opacity-40",
                )}
              >
                <div
                  className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-[8px] transition-colors duration-150"
                  style={{ backgroundColor: isChosen ? accent : "#f2f2f2" }}
                >
                  <span className={cn("text-xs font-medium", isChosen ? "text-white" : "text-[#666666]")}>
                    {i + 1}
                  </span>
                </div>
                <p className="text-lg font-medium text-black">{opt}</p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
