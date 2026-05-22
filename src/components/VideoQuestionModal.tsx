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
      {/* Backdrop — desktop only, animated in/out */}
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
          className="pointer-events-auto flex h-full w-full flex-col bg-background sm:h-[580px] sm:max-w-lg sm:overflow-hidden sm:rounded-[28px]"
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            y: open ? 0 : 24,
            pointerEvents: open ? "auto" : "none",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
        >
          {/* Header bar */}
          <div className="flex shrink-0 items-start justify-between px-5 pb-3 pt-5">
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
            <div className="flex shrink-0 items-center gap-2 pl-4">
              <button className="rounded-full border border-[#e5e5e5] px-3 py-1 text-xs font-medium text-foreground/50 transition-colors hover:border-foreground/20 hover:text-foreground">
                I need help
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-black/5 hover:text-foreground"
                  aria-label="Minimise"
                >
                  <Minus className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Content — fills remaining height */}
          <div className="flex min-h-0 flex-1 flex-col">
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
