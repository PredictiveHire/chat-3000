"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlignLeft, Video, ListChecks } from "lucide-react";
import { useBrand } from "@/lib/BrandContext";
import type { InterviewStep } from "@/lib/types";

const PRIVACY_AND_DATA_URL = "https://sapia.ai/privacy-policy/";

type Row = {
  count: number;
  label: string;
  icon: React.ElementType;
  desc: ReactNode;
};

function buildRows(interview: InterviewStep[]): Row[] {
  const textCount = interview.filter(step => step.type === "text").length;
  const videoCount = interview.filter(step => step.type === "video").length;
  const singleChoiceCount = interview.filter(step => step.type === "mcq" || step.type === "dropdown").length;
  const multipleChoiceCount = interview.filter(step => step.type === "multi-select").length;

  return [
    {
      count: textCount,
      label: "AI Assessed Text Questions",
      icon: AlignLeft,
      desc: "These will be assessed by Sapia.ai using our ethical AI.",
    },
    {
      count: videoCount,
      label: "Video Question",
      icon: Video,
      desc: (
        <>
          These responses will not be assessed with AI. You can retry <span className="font-bold">5 times</span> per question and submit when you&apos;re ready.
        </>
      ),
    },
    {
      count: singleChoiceCount,
      label: "Single Choice Questions",
      icon: ListChecks,
      desc: "We want to get to know more about your experiences and qualifications. These questions will not be assesed with AI.",
    },
    {
      count: multipleChoiceCount,
      label: "Multiple Choice Questions",
      icon: ListChecks,
      desc: "We want to get to know more about your experiences and qualifications. These questions will not be assesed with AI.",
    },
  ].filter(row => row.count > 0);
}

export function QuestionFormatWidget({ interview }: { interview: InterviewStep[] }) {
  const { accent } = useBrand();
  const rows = buildRows(interview);
  const totalQuestions = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" }}
      className="mt-3 w-full"
    >
      <div className="overflow-hidden rounded-[28px] border border-[#e8e8e8] bg-white px-6 shadow-[0_3px_10px_rgba(15,23,42,0.035),0_1px_2px_rgba(15,23,42,0.025)] sm:px-8">
        {/* Total summary */}
        <div className="mt-6 flex flex-col items-center gap-2 rounded-[18px] bg-[#f8f8f8] px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7c7c7c]">Total</p>
          <div className="flex items-center gap-1">
            <span className="text-base font-medium text-black">{totalQuestions} Questions</span>
            <span className="text-base font-medium text-[#616161]">&nbsp;(~ 30 minutes)</span>
          </div>
        </div>

        {/* Question type rows */}
        <div className="flex flex-col gap-4 py-6">
          {rows.map(({ count, label, icon: Icon, desc }, index) => (
            <div key={`${label}-${index}`} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[5px] shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                <Icon className="size-4 shrink-0 text-black" strokeWidth={1.5} />
                <p className="text-base font-medium text-black">
                  {count}&nbsp;&nbsp;{label}
                </p>
              </div>
              <p className="pl-4 text-base leading-relaxed text-black/65">{desc}</p>
            </div>
          ))}
        </div>

        <div className="h-px bg-[#f0f0f0]" />
        <div className="py-5 text-sm leading-relaxed text-black/60">
          Learn more about how we handle your data by reading our{" "}
          <a
            href={PRIVACY_AND_DATA_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ color: accent }}
          >
            Privacy Policy
          </a>.
        </div>
      </div>
    </motion.div>
  );
}
