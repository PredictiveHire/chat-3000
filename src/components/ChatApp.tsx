"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { InterviewChat } from "@/components/InterviewChat";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PostInterviewPage } from "@/components/PostInterviewPage";
import { ReportPage } from "@/components/ReportPage";
import { BrandSelector } from "@/components/BrandSelector";
import { CANDIDATE_NAME } from "@/lib/mockData";

type View = "brand-select" | "loading" | "interview" | "post" | "report";

type BrandConfig = {
  id: string;
  color: string;
  image: string;
};

const BRAND_CONFIGS: Record<string, BrandConfig> = {
  woolworths: { id: "woolworths", color: "#30814C", image: "/woolworths-team.png" },
  qantas:     { id: "qantas",     color: "#F63200", image: "/qantas-team.png" },
};

// Progress bar fills over 4s, then holds ~1.5s before this fires and fades out
const LOADING_DURATION = 5500;

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const transition = { duration: 0.25 };
// Slow fade gives the "brief pause before landing" feel
const loadingTransition = { duration: 0.7 };

export function ChatApp() {
  const [view, setView] = useState<View>("brand-select");
  const [chatStarted, setChatStarted] = useState(false);
  const [brand, setBrand] = useState<BrandConfig>(BRAND_CONFIGS.woolworths);

  const startLoading = (brandId: string) => {
    setBrand(BRAND_CONFIGS[brandId] ?? BRAND_CONFIGS.woolworths);
    setView("loading");
    setTimeout(() => setView("interview"), LOADING_DURATION);
  };

  return (
    <div className="relative h-full">
      {/* InterviewChat stays mounted so chat history is preserved */}
      <div className={view === "interview" || view === "post" || view === "report" ? "h-full" : "hidden"}>
        <InterviewChat onComplete={() => setView("report")} started={chatStarted} />
      </div>

      {/* Brand selector — shown before loading */}
      <AnimatePresence>
        {view === "brand-select" && (
          <motion.div
            key="brand-select"
            className="absolute inset-0 z-50"
            {...fadeVariants}
            transition={transition}
          >
            <BrandSelector onSelect={(brandId) => startLoading(brandId)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* onExitComplete fires only when the fade-out is fully done — perfect moment to start streaming */}
      <AnimatePresence onExitComplete={() => setChatStarted(true)}>
        {view === "loading" && (
          <motion.div
            key="loading"
            className="absolute inset-0 z-50"
            {...fadeVariants}
            transition={loadingTransition}
          >
            <LoadingScreen name={CANDIDATE_NAME} image={brand.image} accentColor={brand.color} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === "post" && (
          <motion.div key="post" className="absolute inset-0" {...fadeVariants} transition={transition}>
            <PostInterviewPage
              reportProgress={100}
              onViewReport={() => setView("report")}
              onBack={() => setView("interview")}
            />
          </motion.div>
        )}
        {view === "report" && (
          <motion.div key="report" className="absolute inset-0" {...fadeVariants} transition={transition}>
            <ReportPage onBack={() => setView("interview")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
