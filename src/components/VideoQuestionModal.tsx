"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus } from "lucide-react";
import { VideoQuestion } from "@/components/VideoQuestion";

type VideoQuestionModalProps = {
  open: boolean;
  question: string;
  currentIndex?: number;
  total?: number;
  initialTriesUsed?: number;
  onTriesUsedChange?: (triesUsed: number) => void;
  onSubmit: (value: string, videoUrl?: string) => void;
  onClose?: () => void;
};

const tips = [
  {
    title: "Try the STAR structure",
    body: "Situation, Task, Action, Result.",
  },
  {
    title: "5 attempts available",
    body: "Re-record until you're happy with your answer.",
  },
  {
    title: "2 minute limit",
    body: "A countdown timer will keep you on track.",
  },
];

export function VideoQuestionModal({
  open,
  question,
  currentIndex,
  total,
  initialTriesUsed,
  onTriesUsedChange,
  onSubmit,
  onClose,
}: VideoQuestionModalProps) {
  return (
    <>
      {/* Backdrop — desktop only */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="video-modal-backdrop"
            className="fixed inset-0 z-[299] hidden bg-black/40 backdrop-blur-sm sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel — always mounted to preserve recording state */}
      <div
        className="pointer-events-none fixed inset-0 z-[300] flex flex-col items-stretch sm:items-center sm:justify-center"
        aria-hidden={!open}
      >
        <motion.div
          className="pointer-events-auto flex h-full w-full flex-col bg-background sm:max-w-4xl sm:overflow-hidden sm:rounded-[28px] sm:flex-row sm:h-auto"
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            y: open ? 0 : 24,
            pointerEvents: open ? "auto" : "none",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
        >
          {/* ── Left panel (desktop only) ── */}
          <div className="hidden sm:flex sm:w-[42%] sm:shrink-0 flex-col justify-between border-r border-[#f0f0f0] bg-white p-6">
            {/* Top: label + question */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/30">
                  {currentIndex !== undefined && total !== undefined
                    ? `Question ${currentIndex} of ${total}`
                    : "Video response"}
                </p>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex size-7 items-center justify-center rounded-full text-foreground/30 transition-colors hover:bg-black/5 hover:text-foreground"
                    aria-label="Minimise"
                  >
                    <Minus className="size-4" />
                  </button>
                )}
              </div>
              <div className="border-l-2 border-[#30814C] pl-4">
                <p className="text-xl font-semibold leading-snug text-foreground">
                  {question}
                </p>
              </div>
            </div>

            {/* Bottom: tips */}
            <div className="flex flex-col gap-4 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/25">
                Tips
              </p>
              <div className="flex flex-col gap-4">
                {tips.map(({ title, body }) => (
                  <div key={title} className="flex flex-col gap-0.5">
                    <p className="text-xs font-semibold text-foreground">{title}</p>
                    <p className="text-xs leading-relaxed text-foreground/50">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel: camera + controls ── */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Mobile header */}
            <div className="flex shrink-0 flex-col px-5 pt-5 sm:hidden">
              <div className="flex items-start justify-between pb-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground/40">
                    {currentIndex !== undefined && total !== undefined
                      ? `Question ${currentIndex} of ${total}`
                      : "Video response"}
                  </p>
                  <p className="text-base font-semibold leading-snug text-foreground">
                    {question}
                  </p>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-black/5 hover:text-foreground"
                    aria-label="Minimise"
                  >
                    <Minus className="size-4" />
                  </button>
                )}
              </div>
              {/* Mobile tips */}
              <div className="mb-3 flex flex-col gap-3 border-t border-[#f0f0f0] pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/25">Tips</p>
                <div className="flex flex-col gap-3">
                  {tips.map(({ title, body }) => (
                    <div key={title} className="flex flex-col gap-0.5">
                      <p className="text-xs font-semibold text-foreground">{title}</p>
                      <p className="text-xs leading-relaxed text-foreground/50">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <VideoQuestion
              question={question}
              currentIndex={currentIndex}
              total={total}
              initialTriesUsed={initialTriesUsed}
              onTriesUsedChange={onTriesUsedChange}
              onSubmit={onSubmit}
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
