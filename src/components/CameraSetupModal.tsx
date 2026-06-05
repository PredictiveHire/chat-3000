"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Minus } from "lucide-react";
import { CameraSetup } from "@/components/CameraSetup";

type CameraSetupModalProps = {
  open: boolean;
  onReady: () => void;
  onClose: () => void;
};

const faqSections = [
  {
    title: "Camera & Microphone Issues",
    items: [
      {
        question: "My camera or microphone isn't working. What should I do?",
        answer: "First, ensure you're using the latest version of Chrome or Safari. Click the camera icon in the top right of your browser and make sure \u201cAllow\u201d is selected for both camera and microphone access. If you have multiple devices, select the correct camera and microphone from the dropdown. After adjusting settings, refresh your browser (Command+Shift+R on Mac, Ctrl+Shift+R on Windows).",
      },
      {
        question: "I can see my video but there's no audio in the recording",
        answer: "This is a common microphone detection issue. Check your browser permissions and ensure the correct microphone is selected. Try clearing your browser cache and opening the interview link in an incognito/private window.",
      },
      {
        question: "I don't have a working camera on my device",
        answer: "You'll need access to a device with a working camera to complete the video interview. Try using a mobile phone or tablet if your computer doesn't have a camera.",
      },
    ],
  },
  {
    title: "Upload & Recording Issues",
    items: [
      {
        question: "I'm getting an \u201cUpload Failed, Please Try Again\u201d error",
        answer: "Open your interview link in a new incognito/private window. This clears stored cookies and cache that may be preventing uploads. Make sure the URL is only open in one browser on one device at a time.",
      },
      {
        question: "My screen froze during recording and I lost an attempt",
        answer: "Clear your browser cache and reopen the interview link in a new tab or incognito window. This often resolves freezing issues.",
      },
      {
        question: "The interview page shows a blank screen",
        answer: "Copy your interview link, close the browser, then open a new incognito window and paste the link there. When prompted, click \u201cAllow\u201d for camera and microphone access.",
      },
    ],
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
          className="fixed inset-0 z-[300] flex items-stretch justify-center sm:items-center"
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
            className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-[#F7F7F5] sm:h-auto sm:max-w-3xl sm:rounded-[28px] sm:bg-white sm:shadow-[0_18px_60px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 pb-3 pt-5">
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
                  {isFaq ? "Help" : "Camera & microphone check"}
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
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="animate-fade-up px-5 pb-4 pt-4">
      <div className="max-h-[60vh] overflow-y-auto pr-0.5 sm:max-h-[440px]">
        {faqSections.map(section => (
          <div key={section.title} className="pt-3 first:pt-0">
            <p className="px-1 pb-2 text-base font-semibold text-foreground/40">
              {section.title}
            </p>
            <div className="divide-y divide-[#f0f0f0] overflow-hidden rounded-[16px] border border-[#ececec] px-4">
              {section.items.map(item => {
                const isOpen = openItem === item.question;
                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      onClick={() => setOpenItem(isOpen ? null : item.question)}
                      className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-medium text-foreground/80">{item.question}</span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-foreground/40 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 pr-7 text-base leading-relaxed text-foreground/50">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
