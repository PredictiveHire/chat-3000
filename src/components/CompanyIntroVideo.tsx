"use client";

import { motion } from "framer-motion";

export function CompanyIntroVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mt-4 w-full overflow-hidden rounded-[20px] border border-[#e6e6e6] bg-white shadow-sm"
    >
      <div className="aspect-video w-full overflow-hidden bg-black">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/mvJ7w5RTO30"
          title="Sapia.ai company introduction video"
          loading="eager"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
}
