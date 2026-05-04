"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = { onViewCompany: () => void };

type RatingState = { type: "idle" } | { type: "rated"; value: number } | { type: "skipped" };

const GENDER_OPTIONS = ["Male", "Female", "Non-binary / genderqueer", "Prefer not to say"];
const AGE_OPTIONS = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+", "Prefer not to say"];
const EDUCATION_OPTIONS = [
  "High school or equivalent",
  "Some college / no degree",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctoral degree",
  "Trade / vocational certification",
  "Prefer not to say",
];
const ETHNICITY_OPTIONS = [
  "Asian / Pacific Islander",
  "Black or African American",
  "Hispanic or Latino",
  "Middle Eastern / North African",
  "Native American / Alaska Native",
  "White / Caucasian",
  "Multiracial",
  "Other",
  "Prefer not to say",
];

function getRatingColors(n: number) {
  if (n <= 4) return { bg: "bg-red-50", hoverBg: "hover:bg-red-100", activeBg: "bg-red-100", text: "text-red-600", ring: "ring-red-600" };
  if (n <= 7) return { bg: "bg-amber-50", hoverBg: "hover:bg-amber-100", activeBg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-700" };
  return { bg: "bg-green-50", hoverBg: "hover:bg-green-100", activeBg: "bg-green-100", text: "text-green-700", ring: "ring-green-700" };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function PostInterviewScreen({ onViewCompany }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<RatingState>({ type: "idle" });
  const [demographics, setDemographics] = useState({ gender: "", age: "", education: "", ethnicity: "" });

  if (!submitted) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm text-center"
        >
          <div className="rounded-3xl bg-card shadow-[var(--shadow-border)] p-10 flex flex-col items-center gap-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle2 className="size-8 text-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">You&apos;re all done!</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your responses have been saved. Review them once more before submitting.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(true)}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-black transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
            >
              Submit interview
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-lg px-4 pt-8 pb-10 space-y-4">
        {/* Confirmation header */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="flex flex-col items-center text-center gap-3 pb-2"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Interview submitted!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll review your responses and be in touch soon.
            </p>
          </div>
        </motion.div>

        {/* Rating card */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="rounded-2xl bg-card shadow-[var(--shadow-border)] p-5"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-sm font-semibold text-foreground">Rate your experience</h2>
            {rating.type === "idle" && (
              <button
                onClick={() => setRating({ type: "skipped" })}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Skip
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            How would you rate this interview experience? (0 = terrible, 10 = excellent)
          </p>

          {rating.type === "idle" && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 11 }, (_, i) => {
                const c = getRatingColors(i);
                return (
                  <button
                    key={i}
                    onClick={() => setRating({ type: "rated", value: i })}
                    className={cn(
                      "size-9 rounded-full text-sm font-semibold ring-1 transition-[background-color,scale] duration-150 ease-out active:scale-[0.96]",
                      c.bg, c.hoverBg, c.text, c.ring
                    )}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          )}

          {rating.type === "rated" && (
            <div className="flex items-center gap-3">
              {(() => {
                const c = getRatingColors(rating.value);
                return (
                  <div className={cn("size-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 shrink-0", c.activeBg, c.text, c.ring)}>
                    {rating.value}
                  </div>
                );
              })()}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Thanks for the feedback!</p>
              </div>
              <button
                onClick={() => setRating({ type: "idle" })}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Change
              </button>
            </div>
          )}

          {rating.type === "skipped" && (
            <p className="text-sm text-muted-foreground italic">Skipped — thanks anyway!</p>
          )}
        </motion.div>

        {/* Demographics card */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="rounded-2xl bg-card shadow-[var(--shadow-border)] p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-1">A little about you</h2>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Optional — helps us ensure fair hiring practices. Your answers are never used in hiring decisions.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={demographics.gender}
              onChange={(e) => setDemographics((d) => ({ ...d, gender: e.target.value }))}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Gender</option>
              {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select
              value={demographics.age}
              onChange={(e) => setDemographics((d) => ({ ...d, age: e.target.value }))}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Age range</option>
              {AGE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select
              value={demographics.education}
              onChange={(e) => setDemographics((d) => ({ ...d, education: e.target.value }))}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Education</option>
              {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select
              value={demographics.ethnicity}
              onChange={(e) => setDemographics((d) => ({ ...d, ethnicity: e.target.value }))}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Ethnicity</option>
              {ETHNICITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Company CTA card */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <button
            onClick={onViewCompany}
            className="group w-full rounded-2xl bg-card shadow-[var(--shadow-border)] p-5 text-left flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xl">
              🏢
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Learn more about Sapia.ai</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                See the hiring process, company values, and get your personality report.
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
