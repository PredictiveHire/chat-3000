"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { InterviewChat } from "@/components/InterviewChat";
import { LandingPage } from "@/components/LandingPage";
import { PostInterviewPage } from "@/components/PostInterviewPage";
import { ReportPage } from "@/components/ReportPage";

type View = "landing" | "interview" | "post" | "report";

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const transition = { duration: 0.2 };

export function ChatApp() {
  const [view, setView] = useState<View>("landing");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const reportStarted = useRef(false);

  // Start generating report as soon as the interview is submitted
  useEffect(() => {
    if (view !== "post" || reportStarted.current) return;
    reportStarted.current = true;
    const timer = setInterval(() => {
      setReportProgress(prev => {
        const next = Math.min(100, prev + 0.4); // ~250 ticks × 100ms ≈ 25s
        if (next >= 100) clearInterval(timer);
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [view]);

  return (
    <div className="relative h-full">
      {/* InterviewChat stays mounted once started so chat history is preserved */}
      {interviewStarted && (
        <div className={view === "interview" ? "h-full" : "hidden"}>
          <InterviewChat onComplete={() => setView("report")} />
        </div>
      )}

      {/* All other views layer on top with fade transitions */}
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div key="landing" className="absolute inset-0" {...fadeVariants} transition={transition}>
            <LandingPage onStart={() => { setInterviewStarted(true); setView("interview"); }} />
          </motion.div>
        )}
        {view === "post" && (
          <motion.div key="post" className="absolute inset-0" {...fadeVariants} transition={transition}>
            <PostInterviewPage
              reportProgress={reportProgress}
              onViewReport={() => setView("report")}
              onBack={() => setView("interview")}
            />
          </motion.div>
        )}
        {view === "report" && (
          <motion.div key="report" className="absolute inset-0" {...fadeVariants} transition={transition}>
            <ReportPage onBack={() => setView("post")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
