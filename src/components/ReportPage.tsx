"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/TypingIndicator";
import { MessageBubble } from "@/components/MessageBubble";

const IMG_HEADER_BG = "https://www.figma.com/api/mcp/asset/dafbf6f6-6131-4e23-a6fe-cf24c95c7f4a";
const IMG_ROCKET = "https://www.figma.com/api/mcp/asset/384cd5f8-a9fe-4010-b0af-99b6a059b89a";
const IMG_DIVIDER = "https://www.figma.com/api/mcp/asset/742401a8-f5a9-4321-a540-7f1e0437d4c1";
const IMG_CHAT_ICON = "https://www.figma.com/api/mcp/asset/e7cfcc68-8e4d-4fde-ad89-ec00cb2df352";

type Props = { onBack: () => void };

type Message = { id: string; role: "interviewer" | "candidate"; content: string };

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const INITIAL_COACH =
  "Hi! I've analyzed your HEXACO personality profile from your interview responses.\n\nKey highlights:\n• Conscientiousness (82/100) — a standout strength for senior technical roles\n• Openness (79/100) — predicts adaptability and innovation\n• Balanced Emotionality (52/100) — resilience under pressure\n\nWhat would you like to explore? I can help with career trajectory, skill gaps, or how your traits map to specific roles.";

function getCoachResponse(input: string): string {
  const q = input.toLowerCase();
  if (/conscientiousness|organized|diligent/.test(q))
    return "Your high Conscientiousness (82/100) is a major asset for Staff Engineers — it correlates strongly with reliability and earning trust across the org. The main watch-out: perfectionism can slow decisions. Pairing it with your Openness score means you can balance rigour with adaptability.";
  if (/open|creative|curious|inquisitive/.test(q))
    return "Your Openness (79/100) means you thrive in ambiguous, evolving technical landscapes — especially valuable at Staff+ where you're often defining the problem, not just solving it. Lean into architecture reviews, technical strategy, and internal research initiatives.";
  if (/honest|humility|sincere|trust/.test(q))
    return "Your Honesty-Humility (78/100) is a real differentiator in leadership. Teams trust leaders who don't play politics. Make this visible through transparent ADRs, public post-mortems, and direct feedback loops.";
  if (/emotional|anxiety|stress|pressure/.test(q))
    return "Your moderate Emotionality (52/100) means you're resilient without being emotionally unavailable. At Staff level, incidents and ambiguity are constant — your profile suggests you can hold space for a stressed team while staying solution-focused.";
  if (/agree|conflict|team|collaboration/.test(q))
    return "Your Agreeableness (74/100) means you lean cooperative — great for cross-functional work, but watch out for agreeing too quickly on important technical decisions. Staff Engineers often need to hold firm positions while staying respectful.";
  if (/extravert|social|communication|present/.test(q))
    return "Your eXtraversion (68/100) means you can engage confidently in group settings without burning out socially — well-positioned for leading design reviews, giving talks, and driving alignment.";
  if (/career|path|next|level|grow|role/.test(q))
    return "Based on your profile, you're well-suited for Staff or Principal Engineer roles in product-led orgs. Longer-term, your Openness and Conscientiousness suggest you'd thrive as an Engineering Manager or CTO if that direction interests you.";
  if (/improve|develop|gap|weakness|work on/.test(q))
    return "Areas to develop: your Emotionality score suggests some vulnerability to anxiety under sustained pressure — structured routines and proactive stakeholder management help. Also, high Conscientiousness can tip into over-engineering; practice 'good enough' decisions in lower-stakes situations.";
  return "Great question! Based on your profile, I'd love to hear more context to give you the most useful answer. Could you tell me more about the situation or decision you're navigating?";
}

const WHAT_WE_NOTICED = [
  "You're generally reliable in how you handle your work and tend to follow through on what you've agreed to do. You take responsibility for your actions and often reflect on how things go, learning from both good outcomes and challenges. This helps build trust with the people you work alongside.",
  "You're generally comfortable adjusting to change, whether that involves new people, new expectations, or unfamiliar situations. You're able to adapt your approach in a steady way that supports continued progress.",
  "You build solid, honest connections with the people around you. Because you are open and easy to talk to, your coworkers feel comfortable sharing their views with you. You make a point of involving the right people at the right time, which leads to better collaboration and fewer misunderstandings. Continuing to invest time in these relationships will only increase the positive impact you have on your team.",
  "You demonstrate a strong ability to manage conflict in a way that preserves positive relationships. You are attentive to what others are saying and you aren't afraid to address interpersonal issues directly. By promoting open communication and looking for practical solutions, you help maintain a positive environment even when things get stressful. People respect your approach because it is fair, consistent, and gets results.",
  "Your approach to customer service is proactive and thoughtful. You engage with clients in a way that shows you genuinely care about their success, and you work hard to tailor your solutions to their specific requirements. By consistently representing the customer's interests within the company, you ensure that we are delivering real value. This focus on building lasting connections is a key part of your professional impact.",
  "Right now, you may find it challenging to set and pursue ambitious goals consistently. Sometimes, competing demands and unclear requirements make it difficult to take initiative or maintain sustained energy. This variation in performance is common, particularly in high-pressure situations. Focusing on clarifying goals could help you improve your approach over time.",
];

const TRY_THIS = [
  "Set one ambitious goal this week and outline steps to achieve it.",
  "Identify a task that needs attention and start it without waiting for instructions.",
  "Track your progress daily to maintain energy and motivation, even when facing obstacles.",
];

export function ReportPage({ onBack }: Props) {
  const [showCoach, setShowCoach] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: newId(), role: "interviewer", content: INITIAL_COACH },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;
      setInputValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setMessages((prev) => [...prev, { id: newId(), role: "candidate", content: trimmed }]);
      setIsTyping(true);
      setTimeout(() => {
        const reply = getCoachResponse(trimmed);
        setMessages((prev) => [...prev, { id: newId(), role: "interviewer", content: reply }]);
        setIsTyping(false);
      }, 1600);
    },
    [isTyping],
  );

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
          <p className="text-sm font-semibold text-foreground">Your interview insights</p>
        </div>
        <button
          onClick={() => setShowCoach((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Sparkles className="size-3" />
          Career AI Coach
        </button>
      </div>

      <div className={cn(
        "mx-auto flex min-h-0 w-full flex-1 gap-4 sm:px-4 sm:pb-6 sm:pt-8",
        showCoach ? "max-w-[1200px]" : "max-w-3xl"
      )}>
        <main className="relative flex min-w-0 flex-1 flex-col">

        {/* Desktop header */}
        <div className="mb-4 hidden shrink-0 items-center justify-between sm:flex">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground shrink-0"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Your interview insights
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowCoach((v) => !v)}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {showCoach ? "Hide career coach" : "Career AI Coach"}
          </button>
        </div>

        {/* Report container */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-2xl sm:bg-card sm:shadow-[var(--shadow-border)]">
          <div className="min-h-0 flex-1 overflow-y-auto">

            {/* Header image */}
            <div className="relative h-36 w-full overflow-hidden">
              <img alt="" src={IMG_HEADER_BG} className="h-full w-full object-cover" />
            </div>

            {/* Title card */}
            <div className="mx-auto -mt-6 w-full max-w-2xl px-5">
              <div className="rounded-[10px] bg-white shadow-[0px_4px_6px_rgba(196,196,196,0.12)] border border-black/[0.06] p-6 text-center">
                <p className="text-[28px] font-light text-black leading-tight">Your interview insights</p>
                <p className="mt-4 text-[15px] text-black leading-normal">
                  Thanks for completing your AI interview with{" "}
                  <span className="font-bold">Sapia.ai</span>
                </p>
              </div>
            </div>

            <div className="mx-auto w-full max-w-2xl space-y-6 px-5 py-6">

              {/* Intro card */}
              <div className="rounded-[16px] bg-[#fcedfe] flex flex-col items-center gap-4 px-8 py-6 text-center">
                <img alt="" src={IMG_ROCKET} className="h-7 w-auto" />
                <p className="text-[15px] font-normal text-black">Every career is built on moments like this.</p>
                <img alt="" src={IMG_DIVIDER} className="w-10" />
                <p className="text-[14px] text-black leading-[26px]">
                  In your AI interview, you showed how you think, decide, and handle real situations. We've pulled out a few insights about how you approach work — they're here to help you reflect and grow. They don't change the outcome of your application.
                </p>
                <button className="text-[13px] font-semibold text-[#30814C] underline underline-offset-2">
                  Learn how we turn your interview into insights →
                </button>
              </div>

              {/* Disclaimers */}
              <div className="flex flex-col gap-2 text-center text-[11px] font-medium text-[#656565] leading-[20px]">
                <p>These insights are just for you — no one else gets access to them.</p>
                <p>These insights are AI-generated based on your responses. You're more than any single interview — think of this as one lens, not the full picture.</p>
              </div>

              {/* What we noticed */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <p className="text-[20px] font-light text-black shrink-0">What we noticed</p>
                  <div className="flex-1 h-px bg-black/10" />
                </div>

                <div className="flex flex-col gap-3">
                  {WHAT_WE_NOTICED.map((text, i) => {
                    const isEven = i % 2 === 1;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex gap-5 items-start rounded-[10px] border border-black/[0.06] p-5",
                          isEven ? "bg-[#f8f6f4]" : "bg-white"
                        )}
                      >
                        <div className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                          isEven ? "bg-[#30814C] text-white" : "bg-[#d1ead9] text-[#1a4a2e]"
                        )}>
                          {i + 1}
                        </div>
                        <p className="flex-1 text-[14px] text-black leading-[26px]">{text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coaching tip */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24px] text-[#30814C] shrink-0">Coaching tip</p>
                  <div className="flex-1 h-px bg-black/10" />
                </div>
                <div className="border-l-[3px] border-[#30814C] pl-6">
                  <p className="text-[20px] font-light text-black leading-[34px]">
                    Consider how approaching challenges with a proactive mindset can help you make greater progress in reaching your goals.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-[14px] font-medium text-black leading-[34px]">Try this:</p>
                  {TRY_THIS.map((step, i) => (
                    <div key={i} className="flex items-center gap-5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d1ead9] text-[12px] font-semibold text-[#1a4a2e]">
                        {i + 1}
                      </div>
                      <p className="flex-1 text-[14px] text-black leading-[26px]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your voice matters */}
              <div className="rounded-[10px] bg-[#f8f6f4] border border-black/[0.06] flex flex-col items-center gap-4 p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <img alt="" src={IMG_CHAT_ICON} className="size-6" />
                  <p className="text-[15px] text-black">Your voice matters</p>
                </div>
                <img alt="" src={IMG_DIVIDER} className="w-10" />
                <p className="text-[14px] font-light text-black leading-[26px]">
                  We're building something new — and your perspective helps shape it for everyone.
                </p>
                <button className="rounded-full border border-[#30814C] px-4 py-1.5 text-[13px] font-semibold text-[#30814C] hover:bg-[#30814C] hover:text-white transition-colors">
                  Share your thoughts
                </button>
              </div>

            </div>
          </div>
        </div>

        </main>

        {/* Career AI Coach panel — flex sibling, no absolute positioning */}
        {showCoach && (
          <aside className="hidden lg:flex w-[360px] xl:w-[420px] shrink-0 flex-col">
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Career AI Coach</h2>
                </div>
                <button
                  onClick={() => setShowCoach(false)}
                  className="flex items-center justify-center size-7 rounded-full text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
                  aria-label="Close career coach"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col", m.role === "candidate" ? "items-end" : "items-start")}>
                    <MessageBubble role={m.role}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </MessageBubble>
                  </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-border p-3 flex items-end gap-2">
                <div className="flex-1 rounded-xl border border-border bg-background px-3 py-2">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inputValue); }
                    }}
                    placeholder="Ask about your profile…"
                    className="w-full resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none max-h-28 leading-relaxed"
                  />
                </div>
                <button
                  onClick={() => send(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96] disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </aside>
        )}

      </div>
    </div>
  );
}
