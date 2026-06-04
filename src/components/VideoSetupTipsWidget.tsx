"use client";

import { motion } from "framer-motion";

const sections = [
  {
    label: "Before you record",
    items: [
      {
        title: "Set up your space",
        body: "A quiet, well-lit spot with your face visible and minimal background noise.",
      },
    ],
  },
  {
    label: "While you're recording",
    items: [
      {
        title: "Use the STAR method",
        body: "Situation, Task, Action, Result — for a clear, compelling story.",
      },
      {
        title: "Five retries per question",
        body: "Review and re-record until you're happy.",
      },
    ],
  },
  {
    label: "After you submit",
    items: [
      {
        title: "Reviewed by a person",
        body: "Not AI assessed — the recruiting team personally views your application.",
      },
    ],
  },
];

export function VideoSetupTipsWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" }}
      className="mt-3 w-full"
    >
      <div className="overflow-hidden rounded-[28px] border border-[#e8e8e8] bg-white px-6 shadow-[0_14px_40px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] sm:px-8">
        <div className="flex flex-col divide-y divide-[#f0f0f0]">
          {sections.map(section => (
            <div key={section.label} className="py-6">
              <p className="mb-5 text-sm font-medium text-muted-foreground">
                {section.label}
              </p>
              <div className="flex flex-col gap-5">
                {section.items.map(({ title, body }) => (
                  <div key={title} className="min-w-0">
                    <p className="text-base font-semibold leading-snug text-foreground">{title}</p>
                    <p className="mt-1 text-base leading-relaxed text-foreground/60">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
