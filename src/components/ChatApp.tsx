"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { InterviewChat } from "@/components/InterviewChat";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PostInterviewPage } from "@/components/PostInterviewPage";
import { ReportPage } from "@/components/ReportPage";
import { BrandSelector } from "@/components/BrandSelector";
import { CANDIDATE_NAME } from "@/lib/mockData";
import { BrandContext, type BrandCtx } from "@/lib/BrandContext";

type View = "brand-select" | "loading" | "interview" | "post" | "report";

const BRAND_CONFIGS: Record<string, BrandCtx & { image: string }> = {
  woolworths: {
    id: "woolworths",
    accent: "#30814C",
    accentLight: "#d1ead9",
    buttonColor: "#30814C",
    name: "Woolworths",
    role: "Team Member",
    headerTitle: "Team Member role with Woolworths Group",
    image: "/woolworths-team.png",
  },
  qantas: {
    id: "qantas",
    accent: "#F63200",
    accentLight: "#fde8e0",
    buttonColor: "#111111",
    name: "Qantas",
    role: "Cabin Crew",
    headerTitle: "Cabin Crew role with Qantas",
    image: "/qantas-team.png",
  },
  sephora: {
    id: "sephora",
    accent: "#DD0032",
    accentLight: "#fde8ec",
    buttonColor: "#000000",
    name: "Sephora",
    role: "Beauty Advisor",
    headerTitle: "Beauty Advisor role with Sephora",
    image: "/sephora-team.jpg",
    logo: "/sephora-logo.png",
  },
};

// Progress bar fills over 4s, then holds ~1.5s before this fires and fades out
const LOADING_DURATION = 5500;

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const transition = { duration: 0.25 };
const loadingTransition = { duration: 0.7 };

export function ChatApp() {
  const [view, setView] = useState<View>("brand-select");
  const [chatStarted, setChatStarted] = useState(false);
  const [brandConfig, setBrandConfig] = useState(BRAND_CONFIGS.woolworths);

  const startLoading = (brandId: string) => {
    setBrandConfig(BRAND_CONFIGS[brandId] ?? BRAND_CONFIGS.woolworths);
    setChatStarted(false);
    setView("loading");
    setTimeout(() => setView("interview"), LOADING_DURATION);
  };

  return (
    <BrandContext.Provider value={brandConfig}>
      <div className="relative h-full">
        {/* key resets the component for each brand so closures always see fresh mock data */}
        <div className={view === "interview" || view === "post" || view === "report" ? "h-full" : "hidden"}>
          <InterviewChat key={brandConfig.id} onComplete={() => setView("report")} started={chatStarted} />
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
              <LoadingScreen name={CANDIDATE_NAME} image={brandConfig.image} accentColor={brandConfig.accent} />
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
    </BrandContext.Provider>
  );
}
