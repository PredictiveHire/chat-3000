import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";
import { useBrand } from "@/lib/BrandContext";

type CTAButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

type PrimaryButtonProps = Omit<CTAButtonProps, "variant">;

export function PrimaryButton(props: PrimaryButtonProps) {
  return <CTAButton variant="primary" {...props} />;
}

export function CTAButton({ variant = "primary", className, style, children, ...props }: CTAButtonProps) {
  const { buttonColor } = useBrand();
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-full py-3.5 text-sm font-semibold transition-[opacity,scale] duration-150 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary"
          ? "text-white hover:opacity-90"
          : "border border-[#e5e5e5] bg-white text-foreground hover:bg-[#f0f0f0]",
        className,
      )}
      style={variant === "primary" ? { backgroundColor: buttonColor, ...style } : style}
      {...props}
    >
      {children}
    </button>
  );
}
