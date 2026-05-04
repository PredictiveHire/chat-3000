"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  location: string;
};

type ProfileFormProps = {
  onSubmit: (data: ProfileData) => void;
  initialValues?: Partial<ProfileData>;
};

const COUNTRY_CODES = [
  { code: "+1", label: "US/CA", country: "United States" },
  { code: "+44", label: "UK", country: "United Kingdom" },
  { code: "+61", label: "AU", country: "Australia" },
  { code: "+64", label: "NZ", country: "New Zealand" },
  { code: "+91", label: "IN", country: "India" },
];

const variants = {
  enter: (dir: 1 | -1) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: 1 | -1) => ({ x: dir * -40, opacity: 0 }),
};

export function ProfileForm({ onSubmit, initialValues }: ProfileFormProps) {
  const [countryCode, setCountryCode] = useState(() => {
    if (initialValues?.phone) {
      const code = COUNTRY_CODES.find(c => initialValues.phone!.startsWith(c.code));
      return code ? code.code : "+61";
    }
    return "+61";
  });
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const countryCodeRef = useRef<HTMLDivElement>(null);

  const [step1, setStep1] = useState({
    name:  initialValues?.name  ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone 
      ? initialValues.phone.replace(/^\+\d+\s*/, '') 
      : "",
  });
  
  const [location, setLocation] = useState(() => {
    if (initialValues?.location) return initialValues.location;
    if (initialValues?.phone) {
      const code = COUNTRY_CODES.find(c => initialValues.phone!.startsWith(c.code));
      if (code) return code.country;
    }
    return "Australia";
  });
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationTyped, setLocationTyped] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const locationRef = useRef<HTMLDivElement>(null);

  const [attemptedNext, setAttemptedNext] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [dir, setDir] = useState<1 | -1>(1);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then(res => res.json())
      .then((data: any[]) => {
        const names = data.map(d => d.name.common).sort();
        setCountries(names);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!locationRef.current?.contains(e.target as Node)) {
        setLocationOpen(false);
      }
      if (!countryCodeRef.current?.contains(e.target as Node)) {
        setCountryCodeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCountries = useMemo(() => {
    const q = location.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(c => c.toLowerCase().includes(q));
  }, [countries, location]);

  const isNameValid = step1.name.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email);
  const cleanPhone = step1.phone.replace(/[\s-]/g, "");
  const isPhoneValid = /^\d{8,15}$/.test(cleanPhone);

  const step1Valid = isNameValid && isEmailValid && isPhoneValid;
  const step2Valid = location.trim().length > 0;

  const goTo2 = () => {
    setAttemptedNext(true);
    if (!step1Valid) return;
    setDir(1);
    setStep(2);
  };

  const goTo1 = () => {
    setDir(-1);
    setStep(1);
  };

  const handleSubmit = () => {
    if (!step2Valid || submitted) return;
    setSubmitted(true);
    onSubmit({ 
      ...step1, 
      phone: `${countryCode} ${step1.phone}`.trim(), 
      location 
    });
  };

  return (
    <motion.div 
      layout
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className={cn(
        "w-full rounded-[20px] bg-[#F4F4F4] shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
        (locationOpen || countryCodeOpen) ? "overflow-visible" : "overflow-hidden"
      )}
    >
      <motion.div layout className="relative">
        <AnimatePresence mode="wait" custom={dir}>
          {step === 1 ? (
            <motion.div
              key="header1"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="w-full px-6 py-3"
            >
              <p className="text-[14px] font-semibold text-[#373737]">Your details</p>
            </motion.div>
          ) : (
            <motion.div
              key="header2"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="flex w-full items-center gap-2 px-4 py-3"
            >
              <button
                onClick={goTo1}
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                aria-label="Back"
              >
                <ArrowLeft className="size-4" />
              </button>
              <p className="text-[14px] font-semibold text-[#373737]">Your location</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        layout
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className={cn(
          "relative rounded-[16px] border border-[#e5e5e5] bg-white",
          (locationOpen || countryCodeOpen) ? "overflow-visible" : "overflow-hidden"
        )}
      >
        <AnimatePresence mode="wait" custom={dir}>
          {step === 1 ? (
            <motion.div
              key="content1"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="w-full"
            >
              <div>
                <div className="px-4 py-3">
                  <div className={cn(
                    "flex flex-col rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10",
                    attemptedNext && !isNameValid ? "border-red-400" : "border-[#e5e5e5]"
                  )}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-muted-foreground">Full name</label>
                      {attemptedNext && !isNameValid && (
                        <span className="text-[10px] text-red-500">Required</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={step1.name}
                      onChange={e => {
                        setStep1(prev => ({ ...prev, name: e.target.value }));
                        if (attemptedNext) setAttemptedNext(false);
                      }}
                      onKeyDown={e => e.key === "Enter" && goTo2()}
                      placeholder="Enter your full name"
                      className={cn(
                        "mt-0.5 w-full bg-transparent text-[12px] placeholder-[#bbb] outline-none transition-colors",
                        attemptedNext && !isNameValid ? "text-red-500" : "text-black"
                      )}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="px-4 pb-3">
                  <div className={cn(
                    "flex flex-col rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10",
                    attemptedNext && !isEmailValid ? "border-red-400" : "border-[#e5e5e5]"
                  )}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-muted-foreground">Email address</label>
                      {attemptedNext && !isEmailValid && (
                        <span className="text-[10px] text-red-500">
                          {step1.email.length === 0 ? "Required" : "Invalid email"}
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      value={step1.email}
                      onChange={e => {
                        setStep1(prev => ({ ...prev, email: e.target.value }));
                        if (attemptedNext) setAttemptedNext(false);
                      }}
                      onKeyDown={e => e.key === "Enter" && goTo2()}
                      placeholder="Enter your email"
                      className={cn(
                        "mt-0.5 w-full bg-transparent text-[12px] placeholder-[#bbb] outline-none transition-colors",
                        attemptedNext && !isEmailValid ? "text-red-500" : "text-black"
                      )}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="px-4 pb-3">
                  <div className={cn(
                    "flex flex-col rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10",
                    attemptedNext && !isPhoneValid ? "border-red-400" : "border-[#e5e5e5]"
                  )} ref={countryCodeRef}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-muted-foreground">Phone number</label>
                      {attemptedNext && !isPhoneValid && (
                        <span className="text-[10px] text-red-500">
                          {step1.phone.length === 0 ? "Required" : "Invalid phone number"}
                        </span>
                      )}
                    </div>
                    <div className="relative mt-0.5 flex items-center">
                      <button
                        type="button"
                        onClick={() => setCountryCodeOpen(v => !v)}
                        className="flex items-center gap-1 shrink-0 pr-2 text-[12px] font-medium text-black outline-none transition-colors hover:text-foreground/70"
                      >
                        {countryCode}
                        <ChevronDown className={cn("size-3 text-muted-foreground transition-transform duration-150", countryCodeOpen && "rotate-180")} />
                      </button>
                      {countryCodeOpen && (
                        <div className="absolute left-0 bottom-[calc(100%+6px)] z-50 animate-in fade-in zoom-in-95 overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-border)]">
                          <div className="flex flex-col divide-y divide-border overflow-y-auto" style={{ maxHeight: 200 }}>
                            {COUNTRY_CODES.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onMouseDown={e => {
                                  e.preventDefault();
                                  setCountryCode(c.code);
                                  setCountryCodeOpen(false);
                                  const matched = COUNTRY_CODES.find(x => x.code === c.code);
                                  if (matched) {
                                    setLocation(matched.country);
                                    setLocationTyped(false);
                                  }
                                }}
                                className={cn(
                                  "flex w-full items-center px-4 py-3 text-left text-[12px] font-medium transition-colors duration-100",
                                  countryCode === c.code ? "bg-primary/20 text-foreground" : "text-foreground hover:bg-black/5"
                                )}
                              >
                                {c.label} <span className="ml-1 text-muted-foreground">({c.code})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <input
                        type="tel"
                        value={step1.phone}
                        onChange={e => {
                          setStep1(prev => ({ ...prev, phone: e.target.value }));
                          if (attemptedNext) setAttemptedNext(false);
                        }}
                        onKeyDown={e => e.key === "Enter" && goTo2()}
                        placeholder="e.g. 400 000 000"
                        className={cn(
                          "w-full bg-transparent text-[12px] placeholder-[#bbb] outline-none transition-colors",
                          attemptedNext && !isPhoneValid ? "text-red-500" : "text-black"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-3">
                <button
                  onClick={goTo2}
                  className={cn(
                    "w-full rounded-2xl py-3.5 text-[14px] font-semibold transition-[opacity,scale] duration-150 ease-out bg-primary text-black hover:opacity-90 active:scale-[0.96]"
                  )}
                >
                  Next
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content2"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="w-full"
            >
              <div className="px-4 py-3 relative" ref={locationRef}>
                  <div className="flex flex-col rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10">
                  <label className="text-[11px] font-medium text-muted-foreground">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => {
                      const val = e.target.value;
                      setLocation(val);
                      setLocationTyped(true);
                      if (val.trim().length > 0) {
                        setLocationOpen(true);
                      } else {
                        setLocationOpen(false);
                      }
                    }}
                    onFocus={() => {
                      if (locationTyped && location.trim().length > 0) {
                        setLocationOpen(true);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!locationOpen || filteredCountries.length === 0) {
                          handleSubmit();
                        }
                      }
                    }}
                    placeholder="Search countries..."
                    disabled={submitted}
                    autoFocus
                    className="mt-0.5 w-full bg-transparent text-[12px] text-black placeholder-[#bbb] outline-none disabled:opacity-50"
                  />
                </div>
                
                {locationOpen && filteredCountries.length > 0 && (
                  <div className="absolute left-4 right-4 bottom-[calc(100%+4px)] z-50 animate-in fade-in zoom-in-95 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                    <div className="flex max-h-[160px] flex-col overflow-y-auto py-1">
                      {filteredCountries.map(country => (
                        <button
                          key={country}
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault();
                            setLocation(country);
                            setLocationOpen(false);
                          }}
                          className="px-3 py-2 text-left text-[12px] text-black hover:bg-black/5"
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 pb-3">
                <button
                  onClick={handleSubmit}
                  disabled={!step2Valid || submitted}
                  className={cn(
                    "w-full rounded-2xl py-3.5 text-[14px] font-semibold transition-[opacity,scale] duration-150 ease-out",
                    step2Valid && !submitted
                      ? "bg-primary text-black hover:opacity-90 active:scale-[0.96]"
                      : "cursor-not-allowed bg-muted text-muted-foreground",
                  )}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

