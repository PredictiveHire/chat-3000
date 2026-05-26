"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LOADING_TEXTS = [
  "Preparing your interview...",
  "Getting your questions ready...",
  "Loading your session...",
  "Almost there...",
];

type LoadingScreenProps = {
  name?: string;
};

export function LoadingScreen({ name }: LoadingScreenProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextVisible(false);
      const swap = setTimeout(() => {
        setTextIndex((i) => (i + 1) % LOADING_TEXTS.length);
        setTextVisible(true);
      }, 350);
      return () => clearTimeout(swap);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 w-full max-w-sm overflow-hidden rounded-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/woolworths-team.png"
          alt="Woolworths team members"
          width={1024}
          height={683}
          className="block h-auto w-full"
        />
      </motion.div>
      <div className="flex flex-col items-center gap-1 text-center">
        {name && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl font-light tracking-[-0.03em] text-[#1a1a1a] sm:text-[28px]"
          >
            Hi {name}.
          </motion.p>
        )}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: name ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl font-light leading-[1.42] tracking-[-0.03em] text-[#1a1a1a] sm:text-[28px] sm:leading-[1.35]"
        >
          Welcome to your Chat Interview
        </motion.p>
      </div>

      {/* Loading text + progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <AnimatePresence mode="wait">
          {textVisible && (
            <motion.p
              key={textIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[13px] tracking-[0.02em] text-[#8a8a8a]"
            >
              {LOADING_TEXTS[textIndex]}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Progress bar — fills to 100% over 4s, giving a natural hold at the end */}
        <div className="h-0.5 w-[120px] overflow-hidden rounded-full bg-[#f0f0f0]">
          <motion.div
            className="h-full rounded-full bg-[#30814C]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      </motion.div>
    </div>
  );
}
