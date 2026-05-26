"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, X } from "lucide-react";
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
          className="pointer-events-auto flex h-full w-full flex-col bg-[#F7F7F5] sm:h-auto sm:max-w-3xl sm:overflow-hidden sm:rounded-[28px] sm:bg-background"
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            y: open ? 0 : 24,
            pointerEvents: open ? "auto" : "none",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
        >
          {/* Desktop header — matches CameraSetupModal */}
          <div className="hidden sm:flex items-start justify-between px-5 pb-2 pt-5">
            <div className="min-w-0 flex-1 pr-3">
              {currentIndex !== undefined && total !== undefined && (
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-foreground/30">
                  Video · {currentIndex} of {total}
                </p>
              )}
              <p className="text-base font-semibold leading-snug text-foreground">{question}</p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-black/5 hover:text-foreground"
                aria-label="Minimise"
              >
                <Minus className="size-4" />
              </button>
            )}
          </div>

          {/* Mobile header */}
          <div className="flex shrink-0 flex-col gap-3 px-5 pb-4 pt-5 sm:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-[#30814C]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#30814C]">
                  {currentIndex !== undefined && total !== undefined
                    ? `Video · ${currentIndex} of ${total}`
                    : "Video response"}
                </span>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 rounded-full border border-[#E8E8E8] bg-white px-3 py-1.5 transition-colors active:bg-black/5"
                  aria-label="Minimise"
                >
                  <X className="size-3 text-[#888]" />
                  <span className="text-xs font-semibold text-[#888]">Minimise</span>
                </button>
              )}
            </div>
            <p className="text-[19px] font-bold leading-[1.4] tracking-[-0.025em] text-[#111]">
              {question}
            </p>
          </div>

          {/* VideoQuestion — portrait on mobile, landscape on desktop */}
          <VideoQuestion
            question={question}
            currentIndex={currentIndex}
            total={total}
            initialTriesUsed={initialTriesUsed}
            onTriesUsedChange={onTriesUsedChange}
            onSubmit={onSubmit}
            portrait={!isDesktop}
          />
        </motion.div>
      </div>
    </>
  );
}
