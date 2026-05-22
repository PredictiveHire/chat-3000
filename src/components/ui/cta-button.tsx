import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type CTAButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

/**
 * Full-width CTA button used throughout the interview flow.
 * - primary:   brand fill, used for the main action
 * - secondary: white with border, used for alternative/skip actions
 */
export function CTAButton({ variant = "primary", className, children, ...props }: CTAButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-full py-3.5 text-sm font-semibold transition-[opacity,scale] duration-150 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary"
          ? "bg-[#30814C] text-white hover:opacity-90"
          : "border border-[#e5e5e5] bg-white text-foreground hover:bg-black/5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
