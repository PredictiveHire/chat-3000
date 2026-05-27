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
  image?: string;
  accentColor?: string;
};

export function LoadingScreen({ name, image = "/woolworths-team.png", accentColor = "#30814C" }: LoadingScreenProps) {
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
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-bleed background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Brand team"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient mask — dark at bottom, fades to transparent at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content centred vertically */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
        {/* Welcome text */}
        <div className="flex flex-col items-center gap-1">
          {name && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-light tracking-[-0.03em] text-white sm:text-[32px]"
            >
              Hi {name}.
            </motion.p>
          )}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: name ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl font-light leading-[1.35] tracking-[-0.03em] text-white sm:text-[32px]"
          >
            Welcome to your Chat Interview
          </motion.p>
        </div>

        {/* Loading text + progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <AnimatePresence mode="wait">
            {textVisible && (
              <motion.p
                key={textIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-[13px] tracking-[0.02em] text-white/60"
              >
                {LOADING_TEXTS[textIndex]}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div className="h-0.5 w-[120px] overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
