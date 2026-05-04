"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type MessageBubbleProps = {
  role: "interviewer" | "candidate";
  children: React.ReactNode;
};

export function MessageBubble({ role, children }: MessageBubbleProps) {
  const isInterviewer = role === "interviewer";
  const [isMultiline, setIsMultiline] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bubbleRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // text-sm leading-relaxed has line height of 21px. 
        // If content height is > 24px, it's spanning multiple lines.
        setIsMultiline(entry.contentRect.height > 24);
      }
    });
    observer.observe(bubbleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "flex w-full animate-bubble-in",
        isInterviewer ? "justify-start" : "justify-end",
      )}
    >
      <div
        ref={bubbleRef}
        className={cn(
          "px-4 py-2.5 text-sm leading-relaxed max-w-[85%] break-words",
          isInterviewer
            ? cn("bg-[#EFEFEF] text-card-foreground", isMultiline ? "rounded-2xl rounded-tl-sm" : "rounded-full rounded-tl-md")
            : cn("bg-[#F4F4F4] text-black ring-1 ring-black/5", isMultiline ? "rounded-[10px] rounded-tr-sm" : "rounded-full rounded-tr-md")
        )}
      >
        {children}
      </div>
    </div>
  );
}
