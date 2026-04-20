"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CountryCodeOption = {
  label: string;
  code: string;
};

const COUNTRY_CODES: CountryCodeOption[] = [
  { label: "Australia", code: "+61" },
  { label: "United States", code: "+1" },
  { label: "United Kingdom", code: "+44" },
  { label: "India", code: "+91" },
  { label: "Singapore", code: "+65" },
];

type MobileNumberQuestionProps = {
  onConfirm: (value: string) => void;
  disabled?: boolean;
  initialValue?: string;
};

export function MobileNumberQuestion({ onConfirm, disabled, initialValue = "" }: MobileNumberQuestionProps) {
  const defaultCode = COUNTRY_CODES.find((option) => initialValue.startsWith(option.code))?.code ?? COUNTRY_CODES[0].code;
  const initialDigits = initialValue.replace(defaultCode, "").replace(/\D/g, "");

  const [countryCode, setCountryCode] = useState(defaultCode);
  const [digits, setDigits] = useState(initialDigits);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isLocked = Boolean(disabled);

  const normalized = useMemo(() => digits.replace(/\D/g, ""), [digits]);

  const onChangeDigits = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");
    setDigits(numbersOnly);
    if (error) setError("");
  };

  const submit = () => {
    if (isLocked) return;

    if (normalized.length < 7 || normalized.length > 15) {
      setError("Enter a valid mobile number (7 to 15 digits).");
      return;
    }

    setError("");
    onConfirm(`${countryCode} ${normalized}`);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-col px-3 pb-3 pt-0">
      {open && !isLocked && (
        <div className="animate-fade-up absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-border)] z-50">
          <div
            className="flex flex-col divide-y divide-border overflow-y-auto"
            style={{ maxHeight: 200 }}
          >
            {COUNTRY_CODES.map((option) => (
              <button
                key={option.code}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCountryCode(option.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors duration-100",
                  countryCode === option.code ? "bg-chat-primary/10 text-foreground" : "text-foreground",
                )}
              >
                {option.label} ({option.code})
              </button>
            ))}
          </div>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-2"
      >
        <div className="relative flex items-end rounded-2xl border border-input bg-white focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50">
          <button
            type="button"
            disabled={isLocked}
            onClick={() => setOpen(!open)}
            className={cn(
              "flex items-center gap-1.5 h-10 shrink-0 border-r border-input bg-transparent px-3 text-sm font-medium outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 hover:bg-black/5 rounded-l-2xl transition-colors",
            )}
            aria-label="Country code"
          >
            {countryCode}
            <ChevronDown className={cn("size-3.5 opacity-50 transition-transform", open && "rotate-180")} />
          </button>

          <label className="sr-only" htmlFor="mobile-number">
            Mobile number
          </label>
          <input
            id="mobile-number"
            value={digits}
            inputMode="numeric"
            autoComplete="tel-national"
            disabled={isLocked}
            onChange={(e) => onChangeDigits(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Mobile number"
            className={cn(
              "h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50 sm:h-11",
            )}
            aria-invalid={Boolean(error)}
          />

          <Button
            type="submit"
            size="icon"
            disabled={isLocked || normalized.length === 0}
            className="mb-1 mr-1 size-8 shrink-0 rounded-full bg-chat-primary text-chat-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-chat-primary/90 active:not-disabled:scale-[0.96]"
            aria-label="Confirm mobile number"
          >
            <SendHorizontal className="size-3.5" />
          </Button>
        </div>

        {error && <p className="px-1 text-xs text-destructive">{error}</p>}
      </form>
    </div>
  );
}
