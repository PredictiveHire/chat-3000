"use client";

import { X } from "lucide-react";

type Props = { onClose: () => void };

export function RoleDescriptionPanel({ onClose }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Role Description</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded-full text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
            aria-label="Close role description"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm text-foreground">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Company</p>
            <p className="font-medium">Sapia.ai</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Role</p>
            <p className="font-medium">Staff Engineer</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Location</p>
            <p>Melbourne, AU · Hybrid</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">About the role</p>
            <p className="leading-relaxed text-muted-foreground">
              We're looking for a Staff Engineer to help shape the technical direction of Sapia.ai's core platform. You'll work across the full stack, driving architectural decisions that enable our AI-powered hiring tools to scale reliably for enterprise customers.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What you'll do</p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Lead the design and implementation of large-scale distributed systems.",
                "Partner with product and ML teams to bring new features from idea to production.",
                "Define and uphold engineering standards across squads.",
                "Mentor senior engineers and contribute to a culture of technical excellence.",
                "Own reliability, observability, and performance across critical services.",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 leading-relaxed">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What we're looking for</p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "8+ years of software engineering experience, with 2+ years at a staff or principal level.",
                "Deep expertise in at least one backend language (Python, Go, or TypeScript).",
                "Strong track record of leading complex, cross-functional projects.",
                "Experience with cloud infrastructure (AWS or GCP) and modern DevOps practices.",
                "Excellent communication skills — you can make the complex simple.",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 leading-relaxed">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Why Sapia.ai</p>
            <p className="leading-relaxed text-muted-foreground">
              We're a mission-driven team building fairer, more human hiring. Our platform is used by some of the world's largest employers. You'll have a real impact on both the product and the team around you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
