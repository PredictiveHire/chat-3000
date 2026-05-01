"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { cn } from "@/lib/utils";

const TYPING_DELAY_MS = 1200;

type Msg = { id: string; role: "interviewer" | "candidate"; content: string };
type Phase = "rating" | "demographics" | "qa";

const RATING_OPTIONS = ["1–2 · Terrible", "3–4 · Poor", "5–6 · OK", "7–8 · Good", "9–10 · Excellent"];

const DEMO_QUESTIONS = [
  {
    id: "gender",
    label: "Gender",
    options: ["Male", "Female", "Non-binary / genderqueer", "Prefer not to say"],
  },
  {
    id: "age",
    label: "Age range",
    options: ["Under 24", "25–34", "35–44", "45–54", "55+", "Prefer not to say"],
  },
  {
    id: "education",
    label: "Highest education",
    options: ["High school", "Bachelor's degree", "Master's degree", "Doctoral degree", "Trade / vocational", "Prefer not to say"],
  },
  {
    id: "ethnicity",
    label: "Ethnicity",
    options: ["Asian / Pacific Islander", "Black or African American", "Hispanic or Latino", "White / Caucasian", "Multiracial", "Other", "Prefer not to say"],
  },
] as const;

const HIRING_STEPS = [
  { num: 1, label: "Chat Interview", done: true, description: "Answer 5 written questions at your own pace." },
  { num: 2, label: "Human Review", done: false, description: "A recruiter reviews your application and personality profile." },
  { num: 3, label: "Technical Assessment", done: false, description: "A short take-home challenge relevant to the role." },
  { num: 4, label: "Final Interview", done: false, description: "A 45-minute conversation with the hiring team." },
];

const COMPANY_VALUES = [
  { icon: "🎯", title: "Bias-free by default", desc: "Structured processes designed to remove unconscious bias from every stage." },
  { icon: "🔬", title: "Evidence over intuition", desc: "Every hiring decision is backed by psychometric data and validated research." },
  { icon: "🤝", title: "Candidate first", desc: "We treat every applicant with transparency, speed, and genuine respect." },
  { icon: "🚀", title: "Move with purpose", desc: "We ship fast, learn faster, and don't let perfection block progress." },
];

const PERKS = [
  "Flexible hybrid work", "$1,500 home office budget", "Learning & development fund", "Mental health support",
  "Equity options for all staff", "18 weeks parental leave", "Annual team offsite", "No-meeting Fridays",
];

const QUICK_QUESTIONS = ["What's the hiring timeline?", "Is the role remote-friendly?", "What does the team look like?"];

const COMPANY_QA = [
  { test: /timeline|when|how long|weeks|hear back/i, response: "The full process typically takes 2–4 weeks. You'll hear back within 5 business days of each stage." },
  { test: /remote|hybrid|office|home|wfh/i, response: "We work on a hybrid model — 2 days per week in our Melbourne HQ, the rest fully remote. Home-office setup is covered up to $1,500." },
  { test: /team|people|size|engineer/i, response: "The engineering team is ~35 people. Flat structure, high autonomy, genuinely collaborative." },
  { test: /salary|pay|compensation|money/i, response: "Salaries are benchmarked at the 65th percentile for Melbourne tech. Specifics are discussed at the offer stage." },
  { test: /process|stage|step|next|after/i, response: "After your chat interview: a human review, a take-home technical challenge, then a final interview with the hiring manager." },
  { test: /culture|value|vibe|feel/i, response: "Low ego, high ownership. Most of the team has been here 3+ years and genuinely enjoys the work." },
];

function getCompanyResponse(input: string) {
  for (const { test, response } of COMPANY_QA) {
    if (test.test(input)) return response;
  }
  return "Great question! Our team will be best placed to answer that — feel free to raise it in your next interview stage, or email hiring@sapia.ai.";
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type Props = {
  reportProgress: number;
  onViewReport: () => void;
  onBack: () => void;
};

export function PostInterviewPage({ reportProgress, onViewReport, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("rating");

  // Rating chat state
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [ratingSelected, setRatingSelected] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  // Demographics form state
  const [demoAnswers, setDemoAnswers] = useState<Record<string, string>>({});

  // Q&A chat state
  const [chatInput, setChatInput] = useState("");
  const [chatReplying, setChatReplying] = useState(false);
  const [qaMessages, setQaMessages] = useState<Msg[]>([]);
  const qaBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const enqueue = useCallback((bubbles: string[], onDone?: () => void) => {
    let i = 0;
    const next = () => {
      if (i >= bubbles.length) { setIsTyping(false); onDone?.(); return; }
      setIsTyping(true);
      const text = bubbles[i++];
      setTimeout(() => {
        setMessages(prev => [...prev, { id: newId(), role: "interviewer", content: text }]);
        next();
      }, TYPING_DELAY_MS);
    };
    next();
  }, []);

  // Seed the rating question on mount
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    enqueue([
      "Interview submitted! Your MyInsights report is being created — wait here or we'll email it to you. While you're here, share feedback on your Chat Interview experience, then ask us anything about the role or company.",
    ]);
  }, [enqueue]);

  // Scroll to bottom in rating chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Scroll to bottom in Q&A chat
  useEffect(() => {
    qaBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [qaMessages, chatReplying]);


  const pickRating = useCallback((opt: string) => {
    if (ratingSelected) return;
    setRatingSelected(opt);
    setMessages(prev => [...prev, { id: newId(), role: "candidate", content: opt }]);
    setTimeout(() => {
      setPhase("demographics");
    }, 600);
  }, [ratingSelected]);

  const pickDemo = (questionId: string, option: string) => {
    setDemoAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const submitDemographics = () => {
    setPhase("qa");
  };

  const sendQuestion = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatReplying) return;
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setQaMessages(prev => [...prev, { id: newId(), role: "candidate", content: trimmed }]);
    setChatReplying(true);
    setTimeout(() => {
      setQaMessages(prev => [...prev, { id: newId(), role: "interviewer", content: getCompanyResponse(trimmed) }]);
      setChatReplying(false);
    }, 1400);
  }, [chatInput, chatReplying]);

  const reportDone = reportProgress >= 100;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Mobile header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground shrink-0"
          >
            <ArrowLeft className="size-4" />
          </button>
          <p className="text-sm font-semibold text-foreground">Interview submitted</p>
        </div>
        {/* Mi report status pill */}
        <div className={cn(
          "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-500",
          reportDone ? "border-green-200 bg-green-50" : "border-border bg-background"
        )}>
          <span className={cn(
            "size-2 shrink-0 rounded-full transition-colors duration-500",
            reportDone ? "bg-green-500" : "animate-pulse bg-yellow-400"
          )} />
          <span className={cn(
            "text-xs font-medium transition-colors duration-500",
            reportDone ? "text-green-700" : "text-foreground"
          )}>
            {reportDone
              ? "Mi report ready!"
              : `Mi report ${Math.round(reportProgress)}% ready…`}
          </span>
          {reportDone && (
            <button
              onClick={onViewReport}
              className="text-xs font-medium text-green-700 underline underline-offset-2 hover:text-green-900 transition-colors"
            >
              View report
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto flex h-full w-full max-w-3xl flex-col sm:px-4 sm:pb-6 sm:pt-8">

        {/* Header */}
        <div className="mb-4 hidden shrink-0 items-center gap-3 sm:flex">
          <button
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground shrink-0"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Interview submitted</h1>
            <p className="text-sm text-muted-foreground">
              {phase === "rating" && "Rate your experience"}
              {phase === "demographics" && "Optional: a few quick questions"}
              {phase === "qa" && "Got questions? Ask away"}
            </p>
          </div>
          {/* Mi report status pill */}
          <div className={cn(
            "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-500",
            reportDone ? "border-green-200 bg-green-50" : "border-border bg-background"
          )}>
            <span className={cn(
              "size-2 shrink-0 rounded-full transition-colors duration-500",
              reportDone ? "bg-green-500" : "animate-pulse bg-yellow-400"
            )} />
            <span className={cn(
              "text-xs font-medium transition-colors duration-500",
              reportDone ? "text-green-700" : "text-foreground"
            )}>
              {reportDone
                ? "Mi report ready!"
                : `Mi report ${Math.round(reportProgress)}% ready…`}
            </span>
            {reportDone && (
              <button
                onClick={onViewReport}
                className="text-xs font-medium text-green-700 underline underline-offset-2 hover:text-green-900 transition-colors"
              >
                View report
              </button>
            )}
          </div>
        </div>

        {/* ── Phase: Rating (chat card) ── */}
        {phase === "rating" && (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-2xl sm:bg-card sm:shadow-[var(--shadow-border)]">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map(m => (
                <div key={m.id} className={cn("flex flex-col", m.role === "candidate" ? "items-end" : "items-start")}>
                  <MessageBubble role={m.role}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </MessageBubble>
                </div>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {!isTyping && !ratingSelected && (
              <div className="animate-fade-up shrink-0 px-3 pb-3">
                <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-border)]">
                  <div className="bg-muted/30 px-5 py-4 border-b border-border">
                    <h3 className="text-lg font-medium text-foreground leading-snug">How would you rate your experience today?</h3>
                  </div>
                  <div className="flex w-full flex-col gap-2 p-3 bg-muted/10">
                    {RATING_OPTIONS.map((opt, i) => (
                      <button
                        key={opt}
                        onClick={() => pickRating(opt)}
                        style={{ animationDelay: `${i * 50}ms` }}
                        className="animate-bubble-in flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm font-medium text-foreground transition-all hover:border-chat-primary/30 hover:bg-chat-primary/5 hover:shadow-sm active:scale-[0.98]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center border-t border-border px-5 py-3">
                    <button
                      onClick={() => setPhase("demographics")}
                      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Phase: Demographics (form layout) ── */}
        {phase === "demographics" && (
          <div className="animate-fade-up min-h-0 flex-1 overflow-y-auto">
            <div className="sm:rounded-2xl sm:bg-card sm:shadow-[var(--shadow-border)] flex flex-col gap-0 overflow-hidden">
              {/* Section header */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Optional</span>
                </div>
                <h2 className="text-base font-semibold text-foreground">Help us hire more fairly</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">These anonymous questions help us identify and reduce bias in our hiring process.</p>
              </div>

              {/* Questions */}
              <div className="flex flex-col divide-y divide-border">
                {DEMO_QUESTIONS.map((q) => (
                  <div key={q.id} className="px-6 py-5">
                    <p className="mb-3 text-sm font-medium text-foreground">{q.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map(opt => {
                        const selected = demoAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => pickDemo(q.id, opt)}
                            className={cn(
                              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                              selected
                                ? "border-transparent bg-foreground text-background"
                                : "border-border bg-background text-foreground hover:border-foreground/30 hover:bg-muted/50"
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
                <button
                  onClick={submitDemographics}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={submitDemographics}
                  className="group flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Continue
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase: Q&A (chat card) ── */}
        {phase === "qa" && (
          <div className="animate-fade-up relative flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-2xl sm:bg-card sm:shadow-[var(--shadow-border)]">
            <div className="min-h-0 flex-1 overflow-y-auto">

              {/* Company content */}
              <div className="space-y-8 px-5 pt-6 pb-4">
                {/* About */}
                <section>
                  <h2 className="text-sm font-bold text-foreground mb-2">About Sapia.ai</h2>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p>Sapia.ai helps large employers hire at scale — fairly, efficiently, and without bias. We combine psychometric science with conversational AI to replace resume screening with a better process.</p>
                    <p>Founded in 2018, we&apos;re profitable, growing, and ~80 people across Melbourne, London, and Singapore.</p>
                  </div>
                </section>

                {/* Hiring process */}
                <section>
                  <h2 className="text-sm font-bold text-foreground mb-3">Hiring process</h2>
                  <div className="space-y-3">
                    {HIRING_STEPS.map((step) => (
                      <div key={step.num} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            step.done ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                          )}>
                            {step.done ? "✓" : step.num}
                          </div>
                          {step.num < HIRING_STEPS.length && (
                            <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: 20 }} />
                          )}
                        </div>
                        <div className="pb-3 min-w-0">
                          <p className={cn("text-sm font-semibold", step.done ? "line-through text-muted-foreground" : "text-foreground")}>
                            {step.label}
                            {step.done && <span className="ml-2 text-xs font-normal text-green-600 no-underline">— Completed</span>}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Values */}
                <section>
                  <h2 className="text-sm font-bold text-foreground mb-2">What we value</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPANY_VALUES.map((v) => (
                      <div key={v.title} className="rounded-xl border border-border bg-background p-3">
                        <div className="text-base mb-1">{v.icon}</div>
                        <p className="text-xs font-semibold text-foreground mb-0.5">{v.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Perks */}
                <section>
                  <h2 className="text-sm font-bold text-foreground mb-2">Perks &amp; benefits</h2>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                    {PERKS.map((p) => (
                      <div key={p} className="flex items-center gap-2 text-xs text-foreground">
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* Chat messages */}
              <div className="space-y-3 px-4 pb-4">
                {qaMessages.map(m => (
                  <div key={m.id} className={cn("flex flex-col", m.role === "candidate" ? "items-end" : "items-start")}>
                    <MessageBubble role={m.role}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </MessageBubble>
                  </div>
                ))}
                {chatReplying && <TypingIndicator />}

                {/* Quick question chips */}
                {qaMessages.length <= 1 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          const trimmed = q.trim();
                          if (chatReplying) return;
                          setQaMessages(prev => [...prev, { id: newId(), role: "candidate", content: trimmed }]);
                          setChatReplying(true);
                          setTimeout(() => {
                            setQaMessages(prev => [...prev, { id: newId(), role: "interviewer", content: getCompanyResponse(trimmed) }]);
                            setChatReplying(false);
                          }, 1400);
                        }}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/30 hover:bg-muted/50 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={qaBottomRef} />
              </div>
            </div>

            <div className="shrink-0 border-t border-border px-3 py-3 flex items-end gap-2">
              <div className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5">
                <textarea
                  ref={textareaRef}
                  value={chatInput}
                  rows={1}
                  placeholder="Ask about Sapia.ai or the hiring process…"
                  onChange={e => {
                    setChatInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion(); }
                  }}
                  className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
                />
              </div>
              <button
                onClick={sendQuestion}
                disabled={!chatInput.trim() || chatReplying}
                className="size-10 shrink-0 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-[0.96]"
              >
                <Send className="size-4 text-black" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
