"use client";

type TextQuestionHeaderProps = {
  question: string;
  currentIndex?: number;
  total?: number;
};

export function TextQuestionHeader({ question, currentIndex, total }: TextQuestionHeaderProps) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="w-[6px] shrink-0 rounded-full bg-[#30814C]" />
      <div className="flex flex-col gap-3">
        {currentIndex !== undefined && total !== undefined && (
          <p className="text-xs font-medium text-foreground/30">
            AI assessed text question · {currentIndex}/{total}
          </p>
        )}
        <p className="flex-1 text-lg font-semibold leading-snug text-foreground">
          {question}
        </p>
      </div>
    </div>
  );
}
