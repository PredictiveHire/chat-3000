"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlignLeft, Link, Video, ListChecks } from "lucide-react";

type Row = {
  count: number;
  label: string;
  icon: React.ElementType;
  desc: ReactNode;
};

const rows: Row[] = [
  {
    count: 5,
    label: "AI Assessed Text Questions",
    icon: AlignLeft,
    desc: "These will be assessed by Sapia.ai using our ethical AI.",
  },
  {
    count: 1,
    label: "Video Question",
    icon: Video,
    desc: (
      <>
        These responses will not be assessed with AI. You can retry <span className="font-bold">5 times</span> per question and submit when you&apos;re ready.
      </>
    ),
  },
  {
    count: 3,
    label: "Single Choice Questions",
    icon: ListChecks,
    desc: "We want to get to know more about your experiences and qualifications. These questions will not be assesed with AI.",
  },
];

export function QuestionFormatWidget({ onCopyLink }: { onCopyLink: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" }}
        className="mt-3 w-full rounded-[20px] bg-[#f3f4f6]"
      >
        <p className="px-[23px] py-3 text-[16px] font-semibold text-[#373737]">
          Here&apos;s what to expect
        </p>
        <div className="flex flex-col gap-4 rounded-[20px] border border-[#e6e6e6] bg-white p-5">
          {/* Total summary */}
          <div className="flex flex-col items-center gap-2 rounded-[18px] bg-[#f8f8f8] px-3 py-3">
            <p className="text-[13px] font-medium uppercase tracking-wide text-[#7c7c7c]">Total</p>
            <div className="flex items-center gap-1">
              <span className="text-[16px] font-medium text-black">9 Questions</span>
              <span className="text-[16px] font-medium text-[#616161]">&nbsp;(~ 30 minutes)</span>
            </div>
          </div>

          {/* Question type rows */}
          {rows.map(({ count, label, icon: Icon, desc }) => (
            <div key={label} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[5px] shrink-0 rounded-full bg-[#3770E5]" />
                <Icon className="size-4 shrink-0 text-black" strokeWidth={1.5} />
                <p className="text-[15px] font-medium text-black">
                  {count}&nbsp;&nbsp;{label}
                </p>
              </div>
              <p className="pl-4 text-[13px] leading-snug text-black/65">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.35, ease: "easeOut" }}
        className="mt-3 w-full rounded-[18px] border border-[#e6e6e6] bg-white p-4 shadow-sm"
      >
        <p className="text-[15px] leading-relaxed text-black/70">
          You can pause and come back to this interview at anytime using this web link. It will also be sent to your email inbox.
        </p>
        <button
          type="button"
          onClick={onCopyLink}
          className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-[#3770E5] transition-colors hover:text-[#2f63cc]"
        >
          <Link className="size-4" />
          Copy link
        </button>
      </motion.div>
    </>
  );
}
