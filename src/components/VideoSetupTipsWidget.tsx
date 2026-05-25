"use client";

import { motion } from "framer-motion";
import { Clock, RotateCcw, Wifi, UserCheck } from "lucide-react";

const tips = [
  {
    icon: Clock,
    title: "Recording time",
    body: "Each response can be up to 2 minutes long — a countdown timer keeps you on track.",
  },
  {
    icon: RotateCcw,
    title: "5 Retries per question",
    body: "Review your recording and re-record until you're happy.",
  },
  {
    icon: Wifi,
    title: "Environment",
    body: "Find a quiet, well-lit spot with your face clearly visible and minimal background noise.",
  },
  {
    icon: UserCheck,
    title: "Reviewed by a person",
    body: "These responses are not AI assessed — a member of the recruiting team will personally view your application.",
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
      <div className="flex flex-col gap-4 rounded-[20px] border border-[#e6e6e6] bg-white p-5">
        {tips.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d1ead9]">
              <Icon className="size-4 text-[#30814C]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-sm leading-relaxed text-foreground/60">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
