"use client";

import type { ReactNode } from "react";
import { useBrand } from "@/lib/BrandContext";

type TextQuestionHeaderProps = {
  question: string;
  currentIndex?: number;
  total?: number;
  children?: ReactNode;
};

export function TextQuestionHeader({ question, currentIndex, total, children }: TextQuestionHeaderProps) {
  const { accent } = useBrand();
  return (
    <div className="flex items-stretch gap-3">
      <div className="w-[6px] shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <div className="flex flex-col gap-3">
        {currentIndex !== undefined && total !== undefined && (
          <p className="text-xs font-medium text-foreground/60">
            Question {currentIndex} of {total}
          </p>
        )}
        <p className="flex-1 text-xl font-semibold leading-snug text-foreground">
          {children ?? question}
        </p>
      </div>
    </div>
  );
}
