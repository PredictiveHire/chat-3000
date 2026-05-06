"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { InterviewChat } from "@/components/InterviewChat";
import { PostInterviewPage } from "@/components/PostInterviewPage";
import { ReportPage } from "@/components/ReportPage";

type View = "interview" | "post" | "report";

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const transition = { duration: 0.25 };

export function ChatApp() {
  const [view, setView] = useState<View>("interview");

  return (
    <div className="relative h-full">
      {/* InterviewChat stays mounted so chat history is preserved */}
      <div className={view === "interview" ? "h-full" : "hidden"}>
        <InterviewChat onComplete={() => setView("report")} />
      </div>

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
