"use client";

import { motion } from "framer-motion";

const PHOTO = "https://www.figma.com/api/mcp/asset/a738168b-bb04-4fc1-9c74-995fda1f3e53";
const CHAT_ICON = "https://www.figma.com/api/mcp/asset/512bb5d3-66ee-4d44-8135-697dcd55b5d0";
const PURPLE_DOT = "https://www.figma.com/api/mcp/asset/a9d53099-c2e0-4e00-887d-5ae9ebd2062c";
const BADGE_CIRCLE = "https://www.figma.com/api/mcp/asset/76c5f11b-2002-4ea2-998a-3ccf85587176";
const WOOLWORTHS_LOGO = "https://www.figma.com/api/mcp/asset/37f3429f-d228-4b18-858d-8609ffa8fae7";

const TIMELINE_ITEMS = [
  {
    label: "5 Questions",
    description:
      "Written, open-ended. Your words. We read between the lines of how you write, and pick up on things like how you handle pressure, how you work with people.",
  },
  {
    label: "You get your personal insights report",
    description: "A snapshot of your strengths. Yours to keep.",
  },
  {
    label: "A human reviews your application",
    description: "AI is one output, not the whole decision.",
  },
];

type Props = { onStart: () => void };

export function LandingPage({ onStart }: Props) {
  return (
    <div className="flex h-full items-center justify-center bg-background p-4 sm:px-4 sm:pt-8 sm:pb-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg xl:max-w-none xl:w-auto"
      >
        <div className="relative overflow-hidden rounded-[40px] border border-black/[0.06] bg-white xl:flex xl:flex-row xl:rounded-[40px]">
          {/* Photo panel — desktop only */}
          <div className="relative hidden xl:block xl:w-[500px] xl:h-[648px] shrink-0 overflow-hidden">
            <img
              alt=""
              src={PHOTO}
              className="absolute max-w-none outline outline-1 -outline-offset-1 outline-black/10"
              style={{ height: "100.08%", width: "194.48%", left: "-50.5%", top: "-0.04%" }}
            />
            {/* Woolworths badge */}
            <div className="absolute left-[23px] top-[20px] size-[88px]">
              <img alt="" src={BADGE_CIRCLE} className="absolute inset-0 size-full" />
              <img
                alt="Woolworths"
                src={WOOLWORTHS_LOGO}
                className="absolute w-[52px] h-[42px]"
                style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
              />
            </div>
          </div>

          {/* Content panel */}
          <div className="flex flex-col gap-6 p-8 sm:gap-8 sm:p-10 xl:gap-10 xl:px-20 xl:py-[60px] xl:w-[678px]">
            <img alt="" src={CHAT_ICON} className="size-9 shrink-0 sm:size-[42px] outline outline-1 -outline-offset-1 outline-black/10" />

            <div className="flex flex-col gap-5 sm:gap-7">
              <p className="text-lg font-semibold leading-snug text-black sm:text-xl">
                Welcome to your Chat Interview!
              </p>

              <div className="flex flex-col gap-4 sm:gap-6">
                {TIMELINE_ITEMS.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-3">
                      <img alt="" src={PURPLE_DOT} className="size-4 shrink-0 outline outline-1 -outline-offset-1 outline-black/10" />
                      <p className="text-sm font-bold leading-normal text-black sm:text-[15px]">
                        {item.label}
                      </p>
                    </div>
                    <p className="pl-7 text-sm leading-relaxed text-black/70 sm:text-[15px] text-pretty">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onStart}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold leading-snug text-primary-foreground transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96] sm:text-[15px]"
            >
              I&apos;m ready, let&apos;s go!
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
