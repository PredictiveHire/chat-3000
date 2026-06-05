"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui/cta-button";
import { useBrand } from "@/lib/BrandContext";

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

export function FeedbackWidget({ onSubmit, onSkip }: { onSubmit: (rating: number, comment: string) => void; onSkip: () => void }) {
  const { accent } = useBrand();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const active = hovered || rating;

  return (
    <div className="animate-fade-up flex flex-col gap-5 rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-0.5">
        <p className="text-base font-semibold text-foreground">How was your experience?</p>
        <p className="text-base text-foreground/50">Your feedback helps us improve the process.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              className="p-0.5 transition-transform active:scale-90"
              aria-label={`Rate ${i} out of 5`}
            >
              <Star
                className="size-8 transition-colors duration-100"
                style={i <= active ? { fill: accent, color: accent } : { fill: "none", color: "rgba(0,0,0,0.2)" }}
              />
            </button>
          ))}
          {active > 0 && (
            <span className="ml-2 text-base font-medium text-foreground/60">{ratingLabels[active]}</span>
          )}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Any comments? (optional)"
        rows={3}
        className="w-full resize-none rounded-xl border border-[#e5e5e5] bg-white p-3 text-base leading-relaxed placeholder:text-foreground/30 outline-none focus:border-foreground/20 transition-colors"
      />

      <CTAButton onClick={() => onSubmit(rating, comment)} disabled={!rating}>
        Submit feedback
      </CTAButton>
      <button
        type="button"
        onClick={onSkip}
        className="py-1 text-base font-medium text-foreground/40 transition-colors hover:text-foreground/60"
      >
        Skip
      </button>
    </div>
  );
}
