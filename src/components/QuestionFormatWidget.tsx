"use client";

import { motion } from "framer-motion";

const rows = [
  { title: "5 Text based questions", desc: "These will be assessed by Sapia.ai using our ethical AI." },
  { title: "3 Single Choice Questions", desc: "We want to get to know more about your experiences and qualifications." },
  { title: "1 Video question", desc: "You can retry 5 times and submit when you're ready." },
];

export function QuestionFormatWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="mt-3 w-full rounded-[20px] bg-[#F4F4F4] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
    >
      {/* Header sits in the grey surface */}
      <div className="px-6 py-3">
        <p className="text-[14px] font-semibold text-[#373737]">Here&apos;s what to expect</p>
      </div>
      {/* White card inset — grey visible on left, right and bottom */}
      <div className="flex flex-col gap-4 overflow-hidden rounded-[16px] border border-[#e5e5e5] bg-white p-6">
        {rows.map((row, i) => (
          <div key={row.title}>
            {i > 0 && <div className="mb-4 h-px w-full bg-border" />}
            <div className="flex flex-col gap-3">
              <p className="text-[16px] font-medium text-black">{row.title}</p>
              <p className="text-[14px] leading-snug text-[#373737]">{row.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
