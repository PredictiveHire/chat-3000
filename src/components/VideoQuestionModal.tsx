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
      {/* Keep VideoQuestion always mounted once first opened so state is preserved */}
      <motion.div
        key="video-modal-backdrop"
        className="fixed inset-0 z-[300] flex flex-col bg-background"
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 24, pointerEvents: open ? "auto" : "none" }}
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
        aria-hidden={!open}
      >
        {/* Header bar */}
        <div className="flex shrink-0 items-start justify-between px-5 pt-5 pb-3">
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-medium text-foreground/40">
              {currentIndex !== undefined && total !== undefined
                ? `Question ${currentIndex} of ${total}`
                : "Video response"}
            </p>
            <p className="text-[16px] font-semibold leading-snug text-foreground">
              {question}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 pl-4">
            <button className="rounded-full border border-[#e5e5e5] px-3 py-1 text-[12px] font-medium text-foreground/50 transition-colors hover:border-foreground/20 hover:text-foreground">
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
    </>
  );
}
