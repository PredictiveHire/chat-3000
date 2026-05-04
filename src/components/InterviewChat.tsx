"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DropdownQuestion } from "@/components/DropdownQuestion";
import { MCQQuestion } from "@/components/MCQQuestion";
import { MobileNumberQuestion } from "@/components/MobileNumberQuestion";
import { ProfileForm } from "@/components/ProfileForm";
import { ProgressBar } from "@/components/ProgressBar";
import { ReplyBar } from "@/components/ReplyBar";
import { mockInterview } from "@/lib/mockData";
import type { ChatMessage, MessageWidget, QuestionType, TextLayout } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Link, Pencil } from "lucide-react";
import { QuestionFormatWidget } from "@/components/QuestionFormatWidget";
import { RoleDescriptionPanel } from "@/components/RoleDescriptionPanel";

const STREAM_CHAR_MS = 10;

function InterviewerText({ content, cursor, textLayout = "heading-last" }: {
  content: string;
  cursor?: boolean;
  textLayout?: TextLayout;
}) {
  const paragraphs = content.split("\n\n");
  const headingIdx = textLayout === "heading-first" ? 0 : paragraphs.length - 1;
  return (
    <div className="space-y-4 py-2">
      {paragraphs.map((p, i) => {
        const isHeading = i === headingIdx;
        const isLast = i === paragraphs.length - 1;
        return isHeading ? (
          <p key={i} className="text-[18px] font-semibold leading-snug text-foreground">
            {p}
            {isLast && cursor && (
              <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[1px] animate-pulse bg-foreground/60 align-middle" />
            )}
          </p>
        ) : (
          <p key={i} className="whitespace-pre-wrap text-[16px] leading-relaxed text-foreground/70">
            {p}
            {isLast && cursor && (
              <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[1px] animate-pulse bg-foreground/60 align-middle" />
            )}
          </p>
        );
      })}
    </div>
  );
}

function CandidateTextBubble({ content, isNextVariant }: { content: string; isNextVariant: boolean }) {
  const [isMultiline, setIsMultiline] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bubbleRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsMultiline(entry.contentRect.height > 24);
      }
    });
    observer.observe(bubbleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "px-4 py-2.5 text-[14px] leading-relaxed break-words",
        isNextVariant
          ? cn("bg-[#FFCEFF] text-[#2B2732]", isMultiline ? "rounded-[10px] rounded-tr-sm" : "rounded-full rounded-tr-md")
          : cn("bg-[#F4F4F4] text-black ring-1 ring-black/5", isMultiline ? "rounded-[10px] rounded-tr-sm" : "rounded-full rounded-tr-md")
      )}
    >
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}


function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function InterviewChat({ onComplete }: { onComplete: () => void }) {
  const total = mockInterview.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showRoleDescription, setShowRoleDescription] = useState(false);
  const [complete, setComplete] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputTypeOverride, setInputTypeOverride] = useState<QuestionType | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingOriginalText, setEditingOriginalText] = useState("");
  const [cancelPending, setCancelPending] = useState(false);

  // Preparing loader
  const [isPreparing, setIsPreparing] = useState(true);
  const isMobileRef = useRef(false);

  // Streaming
  const [streamingText, setStreamingText] = useState("");
  const [streamingLayout, setStreamingLayout] = useState<TextLayout>("heading-last");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, []);

  // Stream a single string char-by-char, then commit to messages
  const streamMessage = useCallback((text: string, onDone?: () => void, widget?: MessageWidget, textLayout?: TextLayout) => {
    if (streamRef.current) clearInterval(streamRef.current);
    setIsStreaming(true);
    setStreamingText("");
    setStreamingLayout(textLayout ?? "heading-last");
    let i = 0;
    streamRef.current = setInterval(() => {
      i++;
      setStreamingText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(streamRef.current!);
        streamRef.current = null;
        const msg: ChatMessage = { id: newId(), role: "interviewer", content: text };
        if (widget) msg.widget = widget;
        if (textLayout) msg.textLayout = textLayout;
        setMessages(prev => [...prev, msg]);
        setStreamingText("");
        setIsStreaming(false);
        onDone?.();
      }
    }, STREAM_CHAR_MS);
  }, []);

  // Seed first question on mount — cleanup handles StrictMode double-invoke
  useEffect(() => {
    isMobileRef.current = window.matchMedia("(max-width: 639px)").matches;
    const prepDuration = isMobileRef.current ? 5000 : 2200;
    const streamDelay  = isMobileRef.current ? 1000 : 0;
    let streamTimer: ReturnType<typeof setTimeout> | null = null;

    const prepTimer = setTimeout(() => {
      setIsPreparing(false);
      streamTimer = setTimeout(() => {
        const first = mockInterview[0];
        streamMessage(first.messages.join("\n\n"), undefined, first.widget, first.textLayout);
      }, streamDelay);
    }, prepDuration);

    return () => {
      clearTimeout(prepTimer);
      if (streamTimer) clearTimeout(streamTimer);
      if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const currentStep = mockInterview[stepIndex];
  const activeType = inputTypeOverride ?? currentStep.type;
  const activeOptions = currentStep.options ?? [];
  const inputReady = !isStreaming && !complete;
  const progressCurrent = complete ? total : stepIndex + 1;

  const advance = useCallback((answer: string) => {
    const isNext = answer === "__next__";

    const id = newId();
    setMessages(prev => [
      ...prev,
      {
        id,
        role: "candidate" as const,
        content: isNext ? "Next" : answer,
        ...(isNext ? { variant: "next" as const } : {}),
      },
    ]);

    const keyword = answer.trim().toLowerCase();
    if (keyword === "submit") {
      streamMessage(
        "That's everything — thank you so much for your time! Review your answers below and hit submit when you're ready.",
        () => setComplete(true),
      );
      return;
    }
    if (keyword === "mcq") setInputTypeOverride("mcq");
    else if (keyword === "dropdown") setInputTypeOverride("dropdown");
    else setInputTypeOverride(null);

    const nextIdx = stepIndex + 1;
    if (nextIdx < mockInterview.length) {
      const nextStep = mockInterview[nextIdx];
      streamMessage(nextStep.messages.join("\n\n"), () => {
        setInputTypeOverride(null);
        setStepIndex(nextIdx);
      }, nextStep.widget, nextStep.textLayout);
    } else {
      streamMessage(
        "That's everything — thank you so much for your time! Review your answers below and hit submit when you're ready.",
        () => setComplete(true),
      );
    }
  }, [stepIndex, streamMessage]);

  const startEditing = useCallback((messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingText(content);
    setEditingOriginalText(content);
    setCancelPending(false);
  }, []);

  const handleCancelClick = useCallback((hasChanges: boolean) => {
    if (hasChanges && !cancelPending) {
      setCancelPending(true);
    } else {
      setEditingMessageId(null);
      setEditingText("");
      setEditingOriginalText("");
      setCancelPending(false);
    }
  }, [cancelPending]);

  const submitEditing = useCallback((updated: string) => {
    if (!editingMessageId) return;
    setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: updated } : m));
    setEditingMessageId(null);
    setEditingText("");
    setEditingOriginalText("");
    setCancelPending(false);
  }, [editingMessageId]);

  // Resolve edit context
  let editingActiveType: QuestionType | null = null;
  let editingActiveOptions: string[] = [];
  let editingQuestion = "";
  if (editingMessageId) {
    let cCount = 0;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "candidate") {
        if (m.id === editingMessageId) {
          const step = mockInterview[cCount];
          if (step) { editingActiveType = step.type; editingActiveOptions = step.options ?? []; }
          for (let j = i - 1; j >= 0; j--) {
            if (messages[j].role === "interviewer") { editingQuestion = messages[j].content; break; }
          }
          break;
        }
        cCount++;
      }
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white sm:overflow-hidden sm:bg-background">

      {/* Mobile fullscreen preparing overlay */}
      <AnimatePresence>
        {isPreparing && (
          <motion.div
            key="preparing-overlay"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white sm:hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-[22px] font-semibold text-foreground">
            Getting your questions ready <br></br> this will just take a moment 👋
              <span className="ml-1.5 inline-flex translate-y-[2px] gap-[4px]">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="inline-block size-[5px] rounded-full bg-foreground/50"
                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile header */}
      <motion.div
        className="sticky top-0 z-50 flex shrink-0 flex-col items-start border-b border-[#e5e5e5] bg-white/80 px-5 py-4 backdrop-blur-md sm:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPreparing ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <p className="text-base font-bold tracking-tight text-foreground">Applying for Staff Engineer at Sapia.ai</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs font-normal text-muted-foreground">You can pause and come back later with this link</p>
          <button
            onClick={copyLink}
            className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {linkCopied ? <Check className="size-3 text-green-500" /> : <Link className="size-3" />}
            {linkCopied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </motion.div>

      <div className={cn(
        "mx-auto flex w-full gap-4 sm:min-h-0 sm:flex-1 sm:px-6 sm:pb-8 sm:pt-10",
        showRoleDescription ? "max-w-[1200px]" : "max-w-3xl"
      )}>
        <main className="relative flex min-w-0 flex-col sm:flex-1">

          {/* Desktop header */}
          <div className="mb-6 hidden shrink-0 items-center justify-between sm:flex">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Applying for Staff Engineer at Sapia.ai
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">You can pause and come back later.</p>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {linkCopied ? <Check className="size-3 text-green-500" /> : <Link className="size-3" />}
                  {linkCopied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowRoleDescription(v => !v)}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {showRoleDescription ? "Hide role description" : "View role description"}
            </button>
          </div>

          <ProgressBar current={progressCurrent} total={total} />

          <div className="relative flex flex-col min-h-[calc(100dvh-5rem)] sm:min-h-0 sm:flex-1 sm:overflow-hidden sm:rounded-2xl sm:bg-card sm:shadow-[var(--shadow-border)]">

            {/* Message list */}
            <div className="flex-1 space-y-10 px-5 py-8 sm:min-h-0 sm:overflow-y-auto sm:px-6 sm:py-10">

              <AnimatePresence initial={false}>
              {messages.map((m) => {
                if (m.role === "interviewer") {
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-start"
                    >
                      <InterviewerText content={m.content} textLayout={m.textLayout} />
                      {m.widget === "question-format" && (
                        <QuestionFormatWidget />
                      )}
                    </motion.div>
                  );
                }
                // Candidate message
                const isNextVariant = m.variant === "next";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 480, damping: 30, mass: 0.8 }}
                    className="group flex flex-col items-end"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div>
                        <CandidateTextBubble content={m.content} isNextVariant={isNextVariant} />
                      </div>
                      {!editingMessageId && !isNextVariant && (
                        <button
                          onClick={() => startEditing(m.id, m.content)}
                          className="mr-2 text-[12px] font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                          aria-label="Edit response"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>

              {/* Preparing loader — desktop only; mobile uses the fullscreen overlay */}
              {isPreparing && (
                <div className="hidden sm:flex flex-col items-start py-2">
                  <p className="text-[18px] font-semibold leading-snug text-foreground">
                  Getting your questions ready <br></br> this will just take a moment 👋
                    <span className="inline-flex gap-[3px] ml-1 translate-y-[1px]">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="inline-block size-[5px] rounded-full bg-foreground/50"
                          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </span>
                  </p>
                </div>
              )}

              {/* Live streaming text */}
              {streamingText && (
                <div className="flex flex-col items-start">
                  <InterviewerText content={streamingText} cursor textLayout={streamingLayout} />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Inputs */}
            <div className="sticky bottom-0 z-40 bg-white sm:relative sm:z-auto sm:bg-transparent">
            {editingMessageId ? (
              <div className="animate-fade-up flex flex-col bg-background/95 backdrop-blur-sm">
                {editingActiveType !== "mcq" && (
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
                    <p className="flex-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                      <span className="font-medium text-foreground">Editing: </span>
                      {editingQuestion}
                    </p>
                    <button
                      onClick={() => handleCancelClick(editingText !== editingOriginalText)}
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                        cancelPending
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                      )}
                    >
                      {cancelPending ? "Confirm discard" : "Cancel"}
                    </button>
                  </div>
                )}
                {editingActiveType === "mcq" ? (
                  <div className="relative shrink-0 px-3 pb-3 pt-3">
                    <button
                      onClick={() => handleCancelClick(editingText !== editingOriginalText)}
                      className={cn(
                        "absolute right-6 top-6 z-10 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                        cancelPending
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-muted text-muted-foreground hover:bg-black/5 hover:text-foreground"
                      )}
                    >
                      {cancelPending ? "Confirm discard" : "Cancel"}
                    </button>
                    <MCQQuestion
                      question={editingQuestion}
                      options={editingActiveOptions.length ? editingActiveOptions : ["Option A", "Option B", "Option C", "Option D"]}
                      onSelect={submitEditing}
                    />
                  </div>
                ) : editingActiveType === "dropdown" ? (
                  <DropdownQuestion
                    key={`${editingMessageId}-dropdown`}
                    options={editingActiveOptions.length ? editingActiveOptions : ["Choice 1", "Choice 2", "Choice 3"]}
                    onConfirm={submitEditing}
                  />
                ) : editingActiveType === "phone" ? (
                  <MobileNumberQuestion onConfirm={submitEditing} initialValue={editingText} />
                ) : editingActiveType === "profile" ? (
                  <div className="shrink-0 px-4 pb-4">
                    <ProfileForm
                      key={editingMessageId}
                      initialValues={(() => {
                        const [name = "", email = "", phone = "", location = ""] = editingText.split(" · ");
                        return { name, email, phone, location };
                      })()}
                      onSubmit={d => submitEditing(`${d.name} · ${d.email} · ${d.phone} · ${d.location}`)}
                    />
                  </div>
                ) : (
                  <ReplyBar
                    key={editingMessageId}
                    onSend={submitEditing}
                    initialText={editingText}
                    onTextChange={t => { setEditingText(t); setCancelPending(false); }}
                  />
                )}
              </div>
            ) : (
              <>
                {inputReady && activeType === "next" && (
                  <div className="animate-fade-up shrink-0 px-4 pb-4 pt-2">
                    <button
                      onClick={() => advance("__next__")}
                      className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-black transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
                    >
                      Next
                    </button>
                  </div>
                )}
                {inputReady && activeType === "profile" && (
                  <div className="animate-fade-up shrink-0 px-4 pb-4">
                    <ProfileForm
                      onSubmit={d => advance(`${d.name} · ${d.email} · ${d.phone} · ${d.location}`)}
                    />
                  </div>
                )}
                {inputReady && activeType === "mcq" && (
                  <div className="animate-fade-up shrink-0 px-4 pb-4">
                    <MCQQuestion
                      question={currentStep.messages[currentStep.messages.length - 1]}
                      options={activeOptions.length ? activeOptions : ["Option A", "Option B", "Option C", "Option D"]}
                      onSelect={advance}
                    />
                  </div>
                )}
                {inputReady && activeType === "dropdown" && (
                  <div className="animate-fade-up">
                    <DropdownQuestion
                      key={`${currentStep.id}-${activeType}`}
                      options={activeOptions.length ? activeOptions : ["Choice 1", "Choice 2", "Choice 3"]}
                      onConfirm={advance}
                    />
                  </div>
                )}
                {inputReady && activeType === "text" && (
                  <ReplyBar onSend={advance} />
                )}
                {inputReady && activeType === "phone" && (
                  <div className="animate-fade-up">
                    <MobileNumberQuestion onConfirm={advance} />
                  </div>
                )}
                {complete && !isStreaming && !submitted && (
                  <div className="animate-fade-up shrink-0 px-4 pb-4 pt-2">
                    <button
                      onClick={() => {
                        setSubmitted(true);
                        setMessages(prev => [...prev, { id: newId(), role: "candidate" as const, content: "Submit interview" }]);
                      }}
                      className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-black transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
                    >
                      Submit interview
                    </button>
                  </div>
                )}
                {submitted && (
                  <div className="animate-fade-up shrink-0 px-4 pb-4 pt-2">
                    <button
                      onClick={onComplete}
                      className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-black transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
                    >
                      View your insights report
                    </button>
                  </div>
                )}
              </>
            )}
            </div>{/* end sticky inputs wrapper */}
          </div>
        </main>

        {showRoleDescription && (
          <aside className="hidden lg:flex w-[360px] xl:w-[420px] shrink-0 flex-col">
            <RoleDescriptionPanel onClose={() => setShowRoleDescription(false)} />
          </aside>
        )}
      </div>
    </div>
  );
}
