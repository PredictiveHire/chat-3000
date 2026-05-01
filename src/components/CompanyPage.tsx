"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  reportProgress: number;
  onViewReport: () => void;
  onBack: () => void;
};

type Message = { id: string; role: "user" | "ai"; content: string };

function newId() {
  return crypto.randomUUID();
}

const INITIAL_AI = "Hi! I'm here to answer any questions about Sapia.ai, the role, or the hiring process. What would you like to know?";

function getAIResponse(input: string): string {
  const q = input.toLowerCase();
  if (/timeline|when|weeks/.test(q))
    return "The full process typically takes 2–4 weeks. We aim to give feedback within 5 business days of each stage.";
  if (/remote|hybrid|office/.test(q))
    return "Hybrid — 2 days per week in Melbourne HQ, rest fully remote. $1,500 home-office setup covered.";
  if (/team|engineer|size/.test(q))
    return "Engineering team is ~35 people, flat, autonomous, product-led.";
  if (/salary|pay|compensation/.test(q))
    return "Benchmarked at the 65th percentile for Melbourne tech. Discussed at offer stage.";
  if (/process|stage|next/.test(q))
    return "Chat interview → human review → technical challenge → final interview.";
  if (/culture|values/.test(q))
    return "Low ego, high ownership. Most of the team has been here 3+ years.";
  return "Great question! Raise it in your next interview stage or email hiring@sapia.ai.";
}

const STEPS = [
  {
    num: 1,
    label: "Chat Interview",
    done: true,
    description: "Answer 5 written questions at your own pace.",
  },
  {
    num: 2,
    label: "Human Review",
    done: false,
    description: "A recruiter reviews your application and personality profile.",
  },
  {
    num: 3,
    label: "Technical Assessment",
    done: false,
    description: "A short take-home challenge relevant to the role.",
  },
  {
    num: 4,
    label: "Final Interview",
    done: false,
    description: "A 45-minute conversation with the hiring team.",
  },
];

const VALUES = [
  { icon: "🎯", title: "Bias-free by default", desc: "Structured processes designed to remove unconscious bias from every stage." },
  { icon: "🔬", title: "Evidence over intuition", desc: "Every hiring decision is backed by psychometric data and validated research." },
  { icon: "🤝", title: "Candidate first", desc: "We treat every applicant with transparency, speed, and genuine respect." },
  { icon: "🚀", title: "Move with purpose", desc: "We ship fast, learn faster, and don't let perfection block progress." },
];

const PERKS = [
  "Flexible hybrid work",
  "$1,500 home office budget",
  "Learning & development fund",
  "Mental health support",
  "Equity options for all staff",
  "18 weeks parental leave",
  "Annual team offsite",
  "No-meeting Fridays",
];

const QUICK_QUESTIONS = [
  "What's the hiring timeline?",
  "Is the role remote-friendly?",
  "What does the team look like?",
];

export function CompanyPage({ reportProgress, onViewReport, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: newId(), role: "ai", content: INITIAL_AI },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reportDone = reportProgress >= 100;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;
      setInputValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setMessages((prev) => [...prev, { id: newId(), role: "user", content: trimmed }]);
      setIsTyping(true);
      setTimeout(() => {
        const reply = getAIResponse(trimmed);
        setMessages((prev) => [...prev, { id: newId(), role: "ai", content: reply }]);
        setIsTyping(false);
      }, 1400);
    },
    [isTyping],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(inputValue);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Fixed header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg">
            🤖
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">Sapia.ai</p>
            <p className="text-xs text-muted-foreground">Melbourne · AI &amp; HR Tech · ~80 people</p>
          </div>
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 pt-8 pb-6 space-y-10">
          {/* About */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">About Sapia.ai</h2>
            <div className="space-y-3 text-sm text-foreground leading-relaxed">
              <p>
                Sapia.ai is a mission-driven company helping large employers hire at scale — fairly,
                efficiently, and without bias. We combine psychometric science with conversational AI to
                replace resume screening and unstructured interviews with a better, more human process.
              </p>
              <p>
                Founded in 2018, we&apos;re profitable, growing, and home to around 80 people across
                Melbourne, London, and Singapore. We work with some of the world&apos;s largest employers
                across retail, logistics, healthcare, and financial services.
              </p>
            </div>
          </section>

          {/* Hiring process */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-4">Our hiring process</h2>
            <div className="space-y-4">
              {STEPS.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        step.done
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {step.done ? "✓" : step.num}
                    </div>
                    {step.num < STEPS.length && (
                      <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pb-4 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        step.done ? "line-through text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {step.label}
                      {step.done && (
                        <span className="ml-2 text-xs font-normal text-green-600 no-underline" style={{ textDecoration: "none" }}>
                          — Completed
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">What we value</h2>
            <div className="grid grid-cols-2 gap-3">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl bg-card shadow-[var(--shadow-border)] p-4">
                  <div className="text-xl mb-2">{v.icon}</div>
                  <p className="text-sm font-semibold text-foreground mb-1">{v.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Perks */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Perks &amp; benefits</h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Ask anything header */}
          <section className="pb-2">
            <h2 className="text-base font-bold text-foreground">Ask anything</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get instant answers about the role, process, or culture.
            </p>
          </section>
        </div>

        {/* Chat messages */}
        <div className="mx-auto max-w-2xl px-4 pb-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-black rounded-tr-sm ring-1 ring-black/10"
                    : "bg-card text-foreground rounded-tl-sm ring-1 ring-black/10 shadow-sm",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card text-foreground rounded-2xl rounded-tl-sm px-4 py-3 text-sm ring-1 ring-black/10 shadow-sm flex items-center gap-1">
                {[0, 200, 400].map((delay) => (
                  <span
                    key={delay}
                    className="size-1.5 rounded-full bg-muted-foreground animate-pulse-scale"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick question chips */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-foreground/30 hover:bg-background transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="shrink-0 border-t border-border bg-background">
        {/* Report progress row */}
        <div className="mx-auto max-w-2xl px-4 pt-3 pb-2 flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full",
              reportDone ? "bg-green-100" : "bg-muted",
            )}
          >
            <FileText className={cn("size-4", reportDone ? "text-green-600" : "text-muted-foreground")} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs font-medium", reportDone ? "text-green-700" : "text-foreground")}>
              {reportDone ? "Your personality report is ready" : "Generating your personality report…"}
            </p>
            <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", reportDone ? "bg-green-500" : "bg-primary")}
                style={{ width: `${reportProgress}%` }}
              />
            </div>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground shrink-0">
            {Math.floor(reportProgress)}%
          </span>
          {reportDone && (
            <button
              onClick={onViewReport}
              className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors shrink-0"
            >
              View <ArrowRight className="size-3" />
            </button>
          )}
        </div>

        {/* Chat input */}
        <div className="mx-auto max-w-2xl px-3 pb-3 flex items-end gap-2">
          <div className="flex-1 rounded-2xl border border-border bg-card px-4 py-2.5 flex items-end gap-2 shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none max-h-32"
            />
          </div>
          <button
            onClick={() => send(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-black transition-all hover:opacity-90 active:scale-[0.96] disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
