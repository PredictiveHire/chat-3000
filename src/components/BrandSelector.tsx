"use client";

import { motion } from "framer-motion";

type Brand = {
  id: string;
  name: string;
  role: string;
  color: string;
  textColor: string;
  bg: string;
  available: boolean;
  initial: string;
};

const brands: Brand[] = [
  {
    id: "woolworths",
    name: "Woolworths",
    role: "Team Member",
    color: "#30814C",
    textColor: "#fff",
    bg: "#e8f5ee",
    available: true,
    initial: "W",
  },
  {
    id: "qantas",
    name: "Qantas",
    role: "Cabin Crew",
    color: "#F63200",
    textColor: "#fff",
    bg: "#fde8e0",
    available: true,
    initial: "Q",
  },
  {
    id: "sephora",
    name: "Sephora",
    role: "Beauty Advisor",
    color: "#000000",
    textColor: "#fff",
    bg: "#f0f0f0",
    available: false,
    initial: "S",
  },
  {
    id: "bt",
    name: "BT",
    role: "Customer Service",
    color: "#5514B4",
    textColor: "#fff",
    bg: "#ede8f7",
    available: false,
    initial: "BT",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function BrandSelector({ onSelect }: { onSelect: (brandId: string) => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f8f8f6] px-5 py-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-1.5">
          <span className="size-1.5 rounded-full bg-[#30814C]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-foreground/40">Demo environment</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Select a brand</h1>
        <p className="mt-1.5 text-sm text-foreground/50">Choose a client to preview their candidate interview experience</p>
      </motion.div>

      {/* Brand grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid w-full max-w-2xl grid-cols-2 gap-3"
      >
        {brands.map((brand) => (
          <motion.button
            key={brand.id}
            variants={item}
            onClick={() => brand.available && onSelect(brand.id)}
            disabled={!brand.available}
            className="group relative flex flex-col items-start overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white p-5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200 disabled:cursor-default"
            style={
              brand.available
                ? { "--hover-border": brand.color } as React.CSSProperties
                : undefined
            }
            whileHover={brand.available ? { y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" } : {}}
            whileTap={brand.available ? { scale: 0.98 } : {}}
          >
            {/* Brand avatar */}
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-xl text-base font-bold"
              style={{ background: brand.bg, color: brand.color }}
            >
              {brand.initial}
            </div>

            {/* Brand info */}
            <p className={`text-base font-bold leading-tight ${brand.available ? "text-foreground" : "text-foreground/40"}`}>
              {brand.name}
            </p>
            <p className={`mt-0.5 text-xs ${brand.available ? "text-foreground/50" : "text-foreground/30"}`}>
              {brand.role}
            </p>

            {/* Available indicator */}
            {brand.available ? (
              <div
                className="mt-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: brand.bg, color: brand.color }}
              >
                <span className="size-1.5 rounded-full" style={{ background: brand.color }} />
                View demo
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-1.5 rounded-full border border-[#ebebeb] px-2.5 py-1 text-[11px] font-medium text-foreground/30">
                Coming soon
              </div>
            )}

            {/* Hover accent bar */}
            {brand.available && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] translate-y-full transition-transform duration-200 group-hover:translate-y-0"
                style={{ background: brand.color }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8 text-center text-xs text-foreground/30"
      >
        Powered by Sapia.ai
      </motion.p>
    </div>
  );
}
