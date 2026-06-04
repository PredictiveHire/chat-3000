"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui/cta-button";
import { useBrand } from "@/lib/BrandContext";

const questions = [
  {
    id: "gender",
    label: "Gender identity",
    options: ["Man", "Woman", "Non-binary", "Prefer not to say"],
  },
  {
    id: "age",
    label: "Age group",
    options: ["16–17", "18–24", "25–34", "35–44", "45–54", "55+", "Prefer not to say"],
  },
  {
    id: "indigenous",
    label: "Aboriginal or Torres Strait Islander",
    options: ["Yes", "No", "Prefer not to say"],
  },
  {
    id: "disability",
    label: "Do you identify as having a disability?",
    options: ["Yes", "No", "Prefer not to say"],
  },
];

export function DemographicForm({ onSubmit }: { onSubmit: (answers: Record<string, string>) => void }) {
  const { buttonColor } = useBrand();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const allAnswered = questions.every(q => answers[q.id]);

  return (
    <div className="animate-fade-up flex flex-col gap-5 rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-foreground">Diversity & inclusion</p>
        <p className="text-xs text-foreground/50">All questions are optional — you can skip any or all.</p>
      </div>

      {questions.map(q => (
        <div key={q.id} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground/70">{q.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {q.options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  answers[q.id] === opt
                    ? "text-white"
                    : "border-[#e5e5e5] text-foreground/60 hover:border-foreground/30 hover:text-foreground"
                )}
                style={answers[q.id] === opt ? { backgroundColor: buttonColor, borderColor: buttonColor } : undefined}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2 pt-1">
        <CTAButton onClick={() => onSubmit(answers)} disabled={!allAnswered}>
          Continue
        </CTAButton>
        <button
          type="button"
          onClick={() => onSubmit({})}
          className="py-1 text-xs font-medium text-foreground/40 transition-colors hover:text-foreground/60"
        >
          Skip all questions
        </button>
      </div>
    </div>
  );
}
