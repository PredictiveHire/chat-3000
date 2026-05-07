"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui/cta-button";

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

type CountryOption = {
  name: string;
  code?: string;
};

const COUNTRY_CODES = [
  { code: "+1",  label: "United States", country: "United States" },
  { code: "+44", label: "United Kingdom", country: "United Kingdom" },
  { code: "+61", label: "Australia",      country: "Australia"      },
  { code: "+64", label: "New Zealand",    country: "New Zealand"    },
  { code: "+91", label: "India",          country: "India"          },
];

function getCallingCode(idd?: { root?: string; suffixes?: string[] }) {
  if (!idd?.root) return undefined;
  const suffix = idd.suffixes?.[0] ?? "";
  return `${idd.root}${suffix}`;
}

const variants = {
  enter:  (dir: 1 | -1) => ({ x: dir * 40,  opacity: 0 }),
  center:              () => ({ x: 0,         opacity: 1 }),
  exit:   (dir: 1 | -1) => ({ x: dir * -40, opacity: 0 }),
};

// Steps: 1 = name+email+location, 2 = SMS consent, 3 = phone (conditional), 4 = review
type Step = 1 | 2 | 3 | 4;

export function ProfileForm({ onSubmit, initialValues }: ProfileFormProps) {
  // ── Step 1 fields ──────────────────────────────────────────────
  const [name, setName]   = useState(initialValues?.name  ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");

  const [location, setLocation]       = useState(initialValues?.location ?? "Australia");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationTyped, setLocationTyped] = useState(false);
  const [countries, setCountries]     = useState<CountryOption[]>([]);
  const locationRef = useRef<HTMLDivElement>(null);

  // ── Step 2: SMS consent ────────────────────────────────────────
  const [smsConsent, setSmsConsent] = useState<boolean | null>(null);

  // ── Step 3: phone (only when smsConsent === true) ─────────────
  const [countryCode, setCountryCode]       = useState(() => {
    if (initialValues?.phone) {
      const code = COUNTRY_CODES.find(c => initialValues.phone!.startsWith(c.code));
      if (code) return code.code;
    }
    return COUNTRY_CODES.find(c => c.country === (initialValues?.location ?? "Australia"))?.code ?? "+61";
  });
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const countryCodeRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState(() => {
    if (initialValues?.phone) {
      return initialValues.phone.replace(/^\+\d+\s*/, "");
    }
    return "";
  });

  // ── Navigation ─────────────────────────────────────────────────
  const [step, setStep]   = useState<Step>(1);
  const [dir, setDir]     = useState<1 | -1>(1);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Prefill from initialValues
  useEffect(() => {
    if (initialValues?.phone) {
      const code = COUNTRY_CODES.find(c => initialValues.phone!.startsWith(c.code));
      if (code) setCountryCode(code.code);
    }
    if (initialValues?.phone) setSmsConsent(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch countries list
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,idd")
      .then(r => r.json())
      .then((data: { name: { common: string }; idd?: { root?: string; suffixes?: string[] } }[]) => {
        setCountries(
          data
            .map(d => ({ name: d.name.common, code: getCallingCode(d.idd) }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      })
      .catch(console.error);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!locationRef.current?.contains(e.target as Node))    setLocationOpen(false);
      if (!countryCodeRef.current?.contains(e.target as Node)) setCountryCodeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCountries = useMemo(() => {
    const q = location.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(c => c.name.toLowerCase().includes(q));
  }, [countries, location]);

  const countryCodeOptions = useMemo(() => {
    const options = [
      ...COUNTRY_CODES,
      ...countries
        .filter(country => country.code)
        .map(country => ({
          code: country.code!,
          label: country.name,
          country: country.name,
        })),
    ];

    return options.filter((option, index, all) => (
      index === all.findIndex(candidate => candidate.code === option.code && candidate.country === option.country)
    ));
  }, [countries]);

  useEffect(() => {
    const selected = countries.find(country => country.name.toLowerCase() === location.trim().toLowerCase());
    const fallback = COUNTRY_CODES.find(country => country.country.toLowerCase() === location.trim().toLowerCase());
    const nextCode = selected?.code ?? fallback?.code;
    if (nextCode) setCountryCode(nextCode);
  }, [countries, location]);

  // ── Validation ─────────────────────────────────────────────────
  const isNameValid  = name.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isLocationValid = location.trim().length > 0;
  const step1Valid   = isNameValid && isEmailValid && isLocationValid;

  const cleanPhone   = phone.replace(/[\s-]/g, "");
  const isPhoneValid = /^\d{8,15}$/.test(cleanPhone);

  // ── Navigation helpers ─────────────────────────────────────────
  const nav = (to: Step, direction: 1 | -1) => { setDir(direction); setStep(to); };

  const goTo2 = () => {
    setAttemptedNext(true);
    if (!step1Valid) return;
    setAttemptedNext(false);
    nav(2, 1);
  };

  const handleSmsAnswer = (yes: boolean) => {
    setSmsConsent(yes);
    if (yes) {
      nav(3, 1);
    } else {
      nav(4, 1);
    }
  };

  const goTo4FromPhone = () => {
    if (!isPhoneValid) return;
    nav(4, 1);
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit({
      name,
      email,
      phone: smsConsent && phone ? `${countryCode} ${phone}`.trim() : "",
      location,
    });
  };

  // ── Step label helpers ─────────────────────────────────────────
  const totalSteps = smsConsent === true ? 4 : 3; // with phone: 4 steps, without: 3

  const headerLabel: Record<Step, string> = {
    1: "Your details",
    2: "SMS updates",
    3: "Phone number",
    4: "Review details",
  };

  const backTarget: Partial<Record<Step, () => void>> = {
    2: () => nav(1, -1),
    3: () => nav(2, -1),
    4: () => nav(smsConsent === true ? 3 : 2, -1),
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className={cn(
        "w-full rounded-[20px] bg-[#F4F4F4] shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
        (locationOpen || countryCodeOpen) ? "overflow-visible" : "overflow-hidden",
      )}
    >
      {/* ── Header ── */}
      <motion.div layout transition={{ duration: 0.22, ease: "easeInOut" }} className="relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={`header-${step}`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className={cn("w-full", step === 1 ? "px-6 py-3" : "flex items-center gap-2 px-4 py-3")}
          >
            {step !== 1 && (
              <button
                onClick={backTarget[step]}
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                aria-label="Back"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <p className="text-sm font-semibold text-[#373737]">{headerLabel[step]}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Content card ── */}
      <motion.div
        layout
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className={cn(
          "relative rounded-[16px] border border-[#e5e5e5] bg-white",
          (locationOpen || countryCodeOpen) ? "overflow-visible" : "overflow-hidden",
        )}
      >
        <AnimatePresence mode="wait" custom={dir}>

          {/* ── Step 1: Name + Email + Location ── */}
          {step === 1 && (
            <motion.div key="s1" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease: "easeInOut" }} className="w-full">

              {/* Name */}
              <div className="px-4 py-3">
                <div className={cn(
                  "flex flex-col rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10",
                  attemptedNext && !isNameValid ? "border-red-400" : "border-[#e5e5e5]",
                )}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Full name</label>
                    {attemptedNext && !isNameValid && <span className="text-xs text-red-500">Required</span>}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setAttemptedNext(false); }}
                    onKeyDown={e => e.key === "Enter" && goTo2()}
                    placeholder="Enter your full name"
                    className={cn("mt-0.5 w-full bg-transparent text-sm placeholder-[#bbb] outline-none", attemptedNext && !isNameValid ? "text-red-500" : "text-black")}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="px-4 pb-3">
                <div className={cn(
                  "flex flex-col rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10",
                  attemptedNext && !isEmailValid ? "border-red-400" : "border-[#e5e5e5]",
                )}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Email address</label>
                    {attemptedNext && !isEmailValid && (
                      <span className="text-xs text-red-500">{email.length === 0 ? "Required" : "Invalid email"}</span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setAttemptedNext(false); }}
                    onKeyDown={e => e.key === "Enter" && goTo2()}
                    placeholder="Enter your email"
                    className={cn("mt-0.5 w-full bg-transparent text-sm placeholder-[#bbb] outline-none", attemptedNext && !isEmailValid ? "text-red-500" : "text-black")}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="px-4 pb-3 relative" ref={locationRef}>
                <div className={cn(
                  "flex flex-col rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10",
                  attemptedNext && !isLocationValid ? "border-red-400" : "border-[#e5e5e5]",
                )}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Location</label>
                    {attemptedNext && !isLocationValid && <span className="text-xs text-red-500">Required</span>}
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={e => {
                      setLocation(e.target.value);
                      setLocationTyped(true);
                      setLocationOpen(e.target.value.trim().length > 0);
                      setAttemptedNext(false);
                    }}
                    onFocus={() => { if (locationTyped && location.trim().length > 0) setLocationOpen(true); }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!locationOpen || filteredCountries.length === 0) goTo2();
                      }
                    }}
                    placeholder="Search countries..."
                    className={cn("mt-0.5 w-full bg-transparent text-sm placeholder-[#bbb] outline-none", attemptedNext && !isLocationValid ? "text-red-500" : "text-black")}
                  />
                </div>
                {locationOpen && filteredCountries.length > 0 && (
                  <div className="absolute left-4 right-4 bottom-[calc(100%+4px)] z-50 animate-in fade-in zoom-in-95 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                    <div className="flex max-h-[160px] flex-col overflow-y-auto py-1">
                      {filteredCountries.map(country => (
                        <button
                          key={country.name}
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault();
                            setLocation(country.name);
                            if (country.code) setCountryCode(country.code);
                            setLocationOpen(false);
                          }}
                          className="px-3 py-2 text-left text-sm text-black hover:bg-black/5"
                        >
                          {country.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next */}
              <div className="px-4 pb-3 pt-1">
                <CTAButton onClick={goTo2}>Next</CTAButton>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: SMS consent ── */}
          {step === 2 && (
            <motion.div key="s2" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease: "easeInOut" }} className="w-full">
              <div className="px-4 py-5 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dce8fc]">
                    <MessageSquare className="size-4 text-[#3770E5]" />
                  </div>
                  <p className="text-sm leading-snug text-foreground/70 pt-1.5">
                    Do you consent to receive SMS updates about your application status? This will be optional and only application updates will be sent.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <CTAButton onClick={() => handleSmsAnswer(true)}>Yes, I consent</CTAButton>
                  <CTAButton variant="secondary" onClick={() => handleSmsAnswer(false)}>No, skip this</CTAButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Phone number (only when smsConsent === true) ── */}
          {step === 3 && (
            <motion.div key="s3" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease: "easeInOut" }} className="w-full">
              <div className="px-4 py-3">
                <div
                  className="flex flex-col rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5 transition-colors focus-within:border-[#aaa] focus-within:ring-1 focus-within:ring-black/10"
                  ref={countryCodeRef}
                >
                  <label className="text-xs font-medium text-muted-foreground">Phone number</label>
                  <div className="relative mt-0.5 flex items-center">
                    <button
                      type="button"
                      onClick={() => setCountryCodeOpen(v => !v)}
                      className="flex shrink-0 items-center gap-1 pr-2 text-sm font-medium text-black outline-none transition-colors hover:text-foreground/70"
                    >
                      {countryCode}
                      <ChevronDown className={cn("size-3 text-muted-foreground transition-transform duration-150", countryCodeOpen && "rotate-180")} />
                    </button>
                    {countryCodeOpen && (
                      <div className="absolute left-0 bottom-[calc(100%+6px)] z-50 animate-in fade-in zoom-in-95 overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-border)]">
                        <div className="flex flex-col divide-y divide-border overflow-y-auto" style={{ maxHeight: 200 }}>
                          {countryCodeOptions.map(c => (
                            <button
                              key={`${c.country}-${c.code}`}
                              type="button"
                              onMouseDown={e => {
                                e.preventDefault();
                                setCountryCode(c.code);
                                setCountryCodeOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors duration-100",
                                countryCode === c.code ? "bg-primary/20 text-foreground" : "text-foreground hover:bg-black/5",
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
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && goTo4FromPhone()}
                      placeholder="e.g. 400 000 000"
                      autoFocus
                      className="w-full bg-transparent text-sm text-black placeholder-[#bbb] outline-none"
                    />
                  </div>
                </div>
                {phone.length > 0 && !isPhoneValid && (
                  <p className="mt-1.5 px-1 text-xs text-red-500">Please enter a valid phone number</p>
                )}
              </div>
              <div className="px-4 pb-3">
                <CTAButton onClick={goTo4FromPhone} disabled={!isPhoneValid}>Continue</CTAButton>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <motion.div key="s4" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease: "easeInOut" }} className="w-full">
              <div className="flex flex-col divide-y divide-[#f0f0f0] px-4 pt-3">
                {[
                  { label: "Name",     value: name },
                  { label: "Email",    value: email },
                  { label: "Location", value: location },
                  ...(smsConsent && phone
                    ? [{ label: "Phone", value: `${countryCode} ${phone}` }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    <span className="max-w-[60%] truncate text-right text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs leading-snug text-foreground/60">
                  Please review your details carefully — this cannot be modified once you proceed.
                </p>
              </div>
              <div className="px-4 pb-3 pt-3">
                <CTAButton onClick={handleSubmit} disabled={submitted}>Accept</CTAButton>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
