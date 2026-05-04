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
                  countryCode === option.code ? "bg-chat-primary/10 text-foreground" : "text-foreground hover:bg-black/5",
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
        <div className="w-full rounded-[20px] bg-[#F4F4F4] shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <div className="px-5 py-3">
            <p className="text-[12px] font-semibold text-[#373737]">Your mobile number</p>
          </div>
          <div className="rounded-[16px] border border-[#e5e5e5] bg-white">
            <div className="px-5 py-4">
              <label className="text-[12px] font-medium text-muted-foreground">Phone number</label>
              <div className="mt-1.5 flex items-center">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setOpen(!open)}
                  className={cn(
                    "flex items-center gap-1 shrink-0 pr-2 text-[12px] font-medium text-black outline-none transition-colors hover:text-foreground/70",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  aria-label="Country code"
                >
                  {countryCode}
                  <ChevronDown className={cn("size-3 text-muted-foreground transition-transform duration-150", open && "rotate-180")} />
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
                  placeholder="e.g. 400 000 000"
                  className={cn(
                    "w-full bg-transparent text-[12px] outline-none placeholder-[#bbb] text-black",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  aria-invalid={Boolean(error)}
                />
              </div>
              {error && <p className="mt-1.5 text-[10px] text-destructive">{error}</p>}
            </div>
            <div className="px-5 py-4">
              <Button
                type="submit"
                disabled={isLocked || normalized.length === 0}
                className="w-full rounded-2xl py-3.5 text-[14px] font-semibold bg-chat-primary text-chat-primary-foreground transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:not-disabled:scale-[0.96] h-auto"
                aria-label="Confirm mobile number"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
