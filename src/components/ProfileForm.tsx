"use client";

import { useState } from "react";
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

const FIELDS: { key: keyof ProfileData; label: string; placeholder: string; type: string }[] = [
  { key: "name",     label: "Full name",      placeholder: "Enter your full name",  type: "text"  },
  { key: "email",    label: "Email address",  placeholder: "Enter your email",      type: "email" },
  { key: "phone",    label: "Phone number",   placeholder: "e.g. +61 400 000 000",  type: "tel"   },
  { key: "location", label: "Location",       placeholder: "City, Country",         type: "text"  },
];

export function ProfileForm({ onSubmit, initialValues }: ProfileFormProps) {
  const [data, setData] = useState<ProfileData>({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    location: initialValues?.location ?? "",
  });
  const [submitted, setSubmitted] = useState(false);

  const isValid = FIELDS.every(f => data[f.key].trim().length > 0);

  const handleSubmit = () => {
    if (!isValid || submitted) return;
    setSubmitted(true);
    onSubmit(data);
  };

  return (
    <div className="w-full rounded-[20px] bg-[#F4F4F4] shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      {/* Header sits in the grey surface */}
      <div className="px-6 py-3">
        <p className="text-[14px] font-semibold text-[#373737]">Your details</p>
      </div>
      {/* White card inset — grey visible on left, right and bottom */}
      <div className="overflow-hidden rounded-[16px] border border-[#e5e5e5] bg-white">
        {FIELDS.map((field, i) => (
          <div key={field.key}>
            {i > 0 && <div className="mx-5 h-px bg-border" />}
            <div className="px-5 py-4">
              <label className="text-[12px] font-medium text-muted-foreground">
                {field.label}
              </label>
              <input
                type={field.type}
                value={data[field.key]}
                onChange={e => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={field.placeholder}
                disabled={submitted}
                className="mt-1.5 w-full bg-transparent text-[12px] text-black placeholder-[#bbb] outline-none disabled:opacity-50"
              />
            </div>
          </div>
        ))}
        <div className="mx-5 h-px bg-border" />
        <div className="px-5 py-4">
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitted}
            className={cn(
              "w-full rounded-2xl py-3.5 text-[14px] font-semibold transition-all",
              isValid && !submitted
                ? "bg-primary text-black hover:opacity-90 active:scale-[0.98]"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
