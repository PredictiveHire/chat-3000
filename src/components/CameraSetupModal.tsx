"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Minus } from "lucide-react";
import { CameraSetup } from "@/components/CameraSetup";

type CameraSetupModalProps = {
  open: boolean;
  onReady: () => void;
  onClose: () => void;
};

const faqs = [
  {
    question: "Why can't the page see my camera or microphone?",
    answer: "Your browser may still be waiting for permission, or access may have been blocked earlier. Look near the address bar for the camera icon and make sure this site is allowed to use both devices.",
  },
  {
    question: "What should I check in my system settings?",
    answer: "On macOS, open System Settings > Privacy & Security, then check Camera and Microphone. Make sure your browser is enabled for both permissions, then return here and try again.",
  },
  {
    question: "Why is another camera or microphone selected?",
    answer: "Your browser uses the default device from your system settings. If you use an external headset, webcam, or dock, set it as your system default and reopen the check.",
  },
  {
    question: "What if another app is using my camera?",
    answer: "Close video meeting apps, screen recorders, or other browser tabs that may be using the camera. Then come back to this check and retry access.",
  },
];

export function CameraSetupModal({ open, onReady, onClose }: CameraSetupModalProps) {
  const [view, setView] = useState<"setup" | "faq">("setup");

  useEffect(() => {
    if (!open) setView("setup");
  }, [open]);

  const isFaq = view === "faq";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="camera-modal-backdrop"
          className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet / modal */}
          <motion.div
            key="camera-modal-panel"
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] bg-background mx-3 mb-3 sm:mx-0 sm:mb-0"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <div className="flex min-w-0 items-center gap-2">
                {isFaq && (
                  <button
                    type="button"
                    onClick={() => setView("setup")}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-black/5 hover:text-foreground"
                    aria-label="Back to camera and microphone check"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                )}
                <p className="truncate text-base font-semibold text-foreground">
                  {isFaq ? "Camera & microphone help" : "Camera & microphone check"}
                </p>
              </div>
              {!isFaq && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-black/5 hover:text-foreground"
                  aria-label="Minimise"
                >
                  <Minus className="size-4" />
                </button>
              )}
            </div>

            {isFaq ? (
              <CameraSetupFaq />
            ) : (
              <CameraSetup onReady={onReady} onSkip={onClose} onHelp={() => setView("faq")} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CameraSetupFaq() {
  return (
    <div className="animate-fade-up px-3 pb-3 pt-2">
      <div className="overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white">
        <div className="divide-y divide-[#f0f0f0]">
          {faqs.map(item => (
            <div key={item.question} className="px-4 py-4">
              <p className="text-sm font-semibold text-foreground/80">{item.question}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/50">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
