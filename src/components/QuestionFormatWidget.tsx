"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlignLeft, Video, ListChecks } from "lucide-react";

type Row = {
  count: number;
  label: string;
  icon: React.ElementType;
  desc: ReactNode;
};

const rows: Row[] = [
  {
    count: 5,
    label: "Text Questions",
    icon: AlignLeft,
    desc: "These will be assessed by Sapia.ai using our ethical AI.",
  },
  {
    count: 1,
    label: "Video Question",
    icon: Video,
    desc: (
      <>
        When we do ask, we will give you instructions to test your camera and microphone.{" "}
        You can retry <span className="font-bold">5 times</span> and submit when you&apos;re ready.
      </>
    ),
  },
  {
    count: 3,
    label: "Single Choice Questions",
    icon: ListChecks,
    desc: "We want to get to know more about your experiences and qualifications.",
  },
];

export function QuestionFormatWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="mt-3 w-full rounded-[20px] bg-[rgba(255,206,255,0.4)]"
    >
      <p className="px-[23px] py-3 text-[16px] font-semibold text-[#373737]">
        Here&apos;s what to expect
      </p>
      <div className="flex flex-col gap-6 rounded-[20px] border border-[#e6e6e6] bg-white p-6">
        {/* Total summary */}
        <div className="flex flex-col items-center gap-3 rounded-[18px] bg-[#f8f8f8] px-3 py-4">
          <p className="text-[16px] font-medium uppercase tracking-wide text-[#7c7c7c]">Total</p>
          <div className="flex items-center gap-1">
            <span className="text-[18px] font-medium text-black">9 Questions</span>
            <span className="text-[18px] font-medium text-[#616161]">&nbsp;(~ 30 minutes)</span>
          </div>
        </div>

        {/* Question type rows */}
        {rows.map(({ count, label, icon: Icon, desc }) => (
          <div key={label} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-[26px] w-[6px] shrink-0 rounded-full bg-[#ffceff]" />
              <Icon className="size-[18px] shrink-0 text-black" strokeWidth={1.5} />
              <p className="text-[18px] font-medium text-black">
                {count}&nbsp;&nbsp;{label}
              </p>
            </div>
            <p className="pl-4 text-[16px] leading-normal text-black/65">{desc}</p>
          </div>
        ))}

        {/* Footer */}
        <p className="text-[16px] text-black">
          You can pause and come back to this interview at anytime
        </p>
      </div>
    </motion.div>
  );
}
