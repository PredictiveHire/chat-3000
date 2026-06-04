"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrand } from "@/lib/BrandContext";

const PRIVACY_AND_DATA_URL = "https://sapia.ai/privacy-policy/";

type MultiSelectQuestionProps = {
  options: string[];
  onConfirm: (values: string[]) => void;
  initialValues?: string[];
};

export function MultiSelectQuestion({ options, onConfirm, initialValues = [] }: MultiSelectQuestionProps) {
  const { accent, buttonColor } = useBrand();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialValues));
  const [submitted, setSubmitted] = useState(false);

  const toggle = (opt: string) => {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(opt)) {
        next.delete(opt);
      } else {
        next.add(opt);
      }
      return next;
    });
  };

  const confirm = () => {
    if (submitted || selected.size === 0) return;
    setSubmitted(true);
    onConfirm(Array.from(selected));
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div role="group" aria-label="Select all that apply" className="overflow-hidden rounded-[16px] border border-[#e5e5e5] bg-white">
        {options.map((opt, i) => {
          const isChosen = selected.has(opt);
          return (
            <div key={opt}>
              {i > 0 && <div className="mx-5 h-px bg-[#efefef]" />}
              <button
                type="button"
                role="checkbox"
                aria-checked={isChosen}
                disabled={submitted}
                onClick={() => toggle(opt)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn(
                  "animate-bubble-in flex w-full items-center gap-3 px-5 py-[14px] text-left transition-[background-color] duration-150",
                  isChosen ? "bg-[#f2f2f2]" : "hover:bg-[#fafafa]",
                  submitted && "cursor-not-allowed",
                )}
              >
                <div
                  className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-[8px] transition-colors duration-150"
                  style={{ backgroundColor: isChosen ? accent : "#f2f2f2" }}
                >
                  {isChosen
                    ? <Check className="size-4 text-white" strokeWidth={2.5} />
                    : <span className="text-xs font-medium text-[#666666]">{i + 1}</span>
                  }
                </div>
                <p className="text-lg font-medium text-black">{opt}</p>
              </button>
            </div>
          );
        })}
        <div className="mx-5 h-px bg-[#efefef]" />
        <div className="px-5 py-3">
          <a
            href={PRIVACY_AND_DATA_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium underline underline-offset-2 transition-colors hover:text-foreground"
            style={{ color: accent }}
          >
            Privacy and data
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={confirm}
        disabled={selected.size === 0 || submitted}
        className={cn(
          "w-full rounded-[14px] py-4 text-[15px] font-semibold transition-all duration-150",
          selected.size > 0 && !submitted
            ? "text-white active:scale-[0.98]"
            : "bg-[#f2f2f2] text-[#b0b0b0] cursor-not-allowed",
        )}
        style={selected.size > 0 && !submitted ? { backgroundColor: buttonColor } : undefined}
      >
        Confirm
      </button>
    </div>
  );
}
