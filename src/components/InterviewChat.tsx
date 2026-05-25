"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DropdownQuestion } from "@/components/DropdownQuestion";
import { MCQQuestion } from "@/components/MCQQuestion";
import { MobileNumberQuestion } from "@/components/MobileNumberQuestion";
import { ProfileForm } from "@/components/ProfileForm";
import { ReplyBar } from "@/components/ReplyBar";
import { mockInterview } from "@/lib/mockData";
import type { ChatMessage, MessageWidget, QuestionType, TextLayout } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui/cta-button";
import { Accessibility, Check, HelpCircle, Link, Pencil, RotateCcw } from "lucide-react";
import { QuestionFormatWidget } from "@/components/QuestionFormatWidget";
import { TextQuestionHeader } from "@/components/TextQuestionHeader";
import { CameraSetupModal } from "@/components/CameraSetupModal";
import { VideoQuestionModal } from "@/components/VideoQuestionModal";
import { CompanyIntroVideo } from "@/components/CompanyIntroVideo";
import { VideoSetupTipsWidget } from "@/components/VideoSetupTipsWidget";

const STREAM_CHAR_MS = 22;
const PRE_STREAM_DELAY_MS = 900;
const INTER_PARAGRAPH_PAUSE_MS = 620;

function IntroBrandMedia() {
  return (
    <>
      <div className="mb-4 overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/woolworths-team.png"
          alt="Woolworths team members"
          width={1024}
          height={683}
          className="block h-auto max-w-full"
        />
      </div>
    </>
  );
}

function InterviewerText({ content, cursor, textLayout = "heading-last", plain }: {
  content: string;
  cursor?: boolean;
  textLayout?: TextLayout;
  plain?: boolean;
}) {
  const paragraphs = content.split("\n\n");
  const headingIdx = textLayout === "heading-first" ? 0 : paragraphs.length - 1;
  return (
    <div className="space-y-4 py-2">
      {paragraphs.map((p, i) => {
        const isHeading = !plain && i === headingIdx;
        const isLast = i === paragraphs.length - 1;
        return isHeading ? (
          <p key={i} className="text-xl font-semibold leading-snug text-foreground">
            {p}
            {isLast && cursor && (
              <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[1px] animate-pulse bg-foreground/60 align-middle" />
            )}
          </p>
        ) : (
          <p key={i} className="whitespace-pre-wrap text-base leading-relaxed text-foreground/60">
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
        "px-4 py-2.5 text-sm leading-relaxed break-words",
        isNextVariant
          ? cn("bg-[#d1ead9] text-[#1a4a2e]", isMultiline ? "rounded-[10px] rounded-tr-sm" : "rounded-full rounded-tr-md")
          : cn("bg-[#F4F4F4] text-black ring-1 ring-black/5", isMultiline ? "rounded-[10px] rounded-tr-sm" : "rounded-full rounded-tr-md")
      )}
    >
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function ResumeLinkAction({ onCopyLink, copied }: { onCopyLink: () => void; copied: boolean }) {
  return (
    <button
      type="button"
      onClick={onCopyLink}
      className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-[#30814C] shadow-sm transition-colors hover:border-[#30814C]/30 hover:bg-[#f0f8f3]"
    >
      {copied ? <Check className="size-4" /> : <Link className="size-4" />}
      {copied ? "Copied link" : "Copy link"}
    </button>
  );
}


function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function InterviewChat({ onComplete, started = true }: { onComplete: () => void; started?: boolean }) {
  const total = mockInterview.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  const [complete, setComplete] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputTypeOverride, setInputTypeOverride] = useState<QuestionType | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingOriginalText, setEditingOriginalText] = useState("");
  const [cancelPending, setCancelPending] = useState(false);

  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoTriesUsed, setVideoTriesUsed] = useState(0);
  const [submittedVideoMessageId, setSubmittedVideoMessageId] = useState<string | null>(null);
  const [profileAcceptedMessageId, setProfileAcceptedMessageId] = useState<string | null>(null);

  const [reviewMode, setReviewMode] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [editReturnToReview, setEditReturnToReview] = useState(false);

  // Streaming
  const [streamingText, setStreamingText] = useState("");
  const [streamingLayout, setStreamingLayout] = useState<TextLayout>("heading-last");
  const [streamingStepType, setStreamingStepType] = useState<QuestionType | null>(null);
  const [streamingWidget, setStreamingWidget] = useState<MessageWidget | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreStreaming, setIsPreStreaming] = useState(false);
  // For intro step: image fades in first, then text streams
  const [introImageVisible, setIntroImageVisible] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const preStreamRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, []);

  // Stream paragraph-by-paragraph: fast within each paragraph, pause between them
  const streamMessage = useCallback((text: string, onDone?: () => void, widget?: MessageWidget, textLayout?: TextLayout, widgetMeta?: Record<string, number | string>, stepType?: QuestionType) => {
    if (streamRef.current) clearInterval(streamRef.current);
    if (preStreamRef.current) clearTimeout(preStreamRef.current);
    setIsStreaming(true);
    setIsPreStreaming(true);
    setStreamingText("");
    setStreamingLayout(textLayout ?? "heading-last");
    setStreamingStepType(stepType ?? null);
    setStreamingWidget(widget);

    const isIntro = widget === "company-intro-video";
    // For the intro step, show image first then delay text stream further
    const IMAGE_FADE_MS = 700;
    const preDelay = isIntro ? PRE_STREAM_DELAY_MS + IMAGE_FADE_MS : PRE_STREAM_DELAY_MS;

    if (isIntro) {
      // Delay image until the header has slid in
      setIntroImageVisible(false);
      setTimeout(() => setIntroImageVisible(true), 450);
    }

    const paragraphs = text.split("\n\n");

    const streamParagraph = (paraIndex: number, alreadyStreamed: string) => {
      const para = paragraphs[paraIndex];
      const prefix = alreadyStreamed ? alreadyStreamed + "\n\n" : "";
      let i = 0;
      streamRef.current = setInterval(() => {
        i++;
        setStreamingText(prefix + para.slice(0, i));
        if (i >= para.length) {
          clearInterval(streamRef.current!);
          streamRef.current = null;
          const streamed = prefix + para;
          const isLast = paraIndex === paragraphs.length - 1;
          if (isLast) {
            const msg: ChatMessage = { id: newId(), role: "interviewer", content: text };
            if (widget) msg.widget = widget;
            if (textLayout) msg.textLayout = textLayout;
            if (widgetMeta) msg.widgetMeta = widgetMeta;
            if (stepType) msg.stepType = stepType;
            setMessages(prev => [...prev, msg]);
            setStreamingText("");
            setIsStreaming(false);
            onDone?.();
          } else {
            // Pause before next paragraph
            preStreamRef.current = setTimeout(() => {
              streamParagraph(paraIndex + 1, streamed);
            }, INTER_PARAGRAPH_PAUSE_MS);
          }
        }
      }, STREAM_CHAR_MS);
    };

    preStreamRef.current = setTimeout(() => {
      setIsPreStreaming(false);
      streamParagraph(0, "");
    }, preDelay);
  }, []);

  // Seed first question once the loading screen has fully exited — cleanup handles StrictMode double-invoke
  useEffect(() => {
    if (!started) return;
    const first = mockInterview[0];
    streamMessage(first.messages.join("\n\n"), undefined, first.widget, first.textLayout, undefined, first.type);

    return () => {
      if (preStreamRef.current) { clearTimeout(preStreamRef.current); preStreamRef.current = null; }
      if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Close help dropdown on outside click
  useEffect(() => {
    if (!helpOpen) return;
    const handler = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [helpOpen]);

  const currentStep = mockInterview[stepIndex];
  const activeType = inputTypeOverride ?? currentStep.type;
  const activeOptions = currentStep.options ?? [];
  const inputReady = !isStreaming && !complete;
  const progressCurrent = complete ? total : stepIndex + 1;

  // For text-question widget counter
  const textStepIndices = mockInterview
    .map((s, i) => (s.widget === "text-question" ? i : -1))
    .filter(i => i !== -1);
  const totalTextQuestions = textStepIndices.length;
  const getTextQuestionMeta = (stepIdx: number) => {
    const pos = textStepIndices.indexOf(stepIdx);
    if (pos === -1) return undefined;
    return { currentIndex: pos + 1, total: totalTextQuestions };
  };

  // For video-question widget counter
  const videoStepIndices = mockInterview
    .map((s, i) => (s.widget === "video-question" ? i : -1))
    .filter(i => i !== -1);
  const totalVideoQuestions = videoStepIndices.length;
  const getVideoQuestionMeta = (stepIdx: number) => {
    const pos = videoStepIndices.indexOf(stepIdx);
    if (pos === -1) return undefined;
    return { currentIndex: pos + 1, total: totalVideoQuestions };
  };

  const advance = useCallback((answer: string, videoUrl?: string) => {
    const isNext = answer === "__next__";
    const isCameraReady = answer === "__camera_ready__";

    const id = newId();
    setMessages(prev => [
      ...prev,
      {
        id,
        role: "candidate" as const,
        content: isCameraReady ? "I'm ready" : isNext ? "Next" : answer,
        ...((isNext || isCameraReady) ? { variant: "next" as const } : {}),
        ...(videoUrl ? { videoUrl } : {}),
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
      }, nextStep.widget, nextStep.textLayout, getTextQuestionMeta(nextIdx) ?? getVideoQuestionMeta(nextIdx), nextStep.type);
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
      const returnToReview = editReturnToReview;
      setEditingMessageId(null);
      setEditingText("");
      setEditingOriginalText("");
      setCancelPending(false);
      setEditReturnToReview(false);
      if (returnToReview) setReviewMode(true);
    }
  }, [cancelPending, editReturnToReview]);

  const submitEditing = useCallback((updated: string) => {
    if (!editingMessageId) return;
    setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: updated } : m));
    setEditingMessageId(null);
    setEditingText("");
    setEditingOriginalText("");
    setCancelPending(false);
    if (editReturnToReview) {
      setEditReturnToReview(false);
      setReviewMode(true);
    }
  }, [editingMessageId, editReturnToReview]);

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

  const hasFloatingInput =
    !reviewMode &&
    (editingMessageId != null ||
      inputReady ||
      (complete && !isStreaming && !submitted) ||
      submitted);

  const floatingInputPad = (() => {
    if (!hasFloatingInput) return "";
    const type = editingMessageId ? editingActiveType : activeType;
    if (type === "profile") return "pb-[26rem]";
    if (type === "mcq" || type === "dropdown") return "pb-72";
    if (type === "text" || type === "phone") return "pb-44";
    return "pb-28";
  })();

  const isProfileInput =
    (editingMessageId != null && editingActiveType === "profile") ||
    (inputReady && activeType === "profile");

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white sm:bg-white">

      {/* Mobile header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: started ? 1 : 0, y: started ? 0 : -16 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 flex shrink-0 flex-col items-start border-b border-[#e5e5e5] bg-white/80 px-5 py-4 backdrop-blur-md sm:hidden"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <p className="text-base font-bold tracking-tight text-foreground">Team member role with Woolworths Group</p>
          {/* Accessibility icon — mobile */}
          <button
            onClick={() => setHelpOpen(v => !v)}
            className="shrink-0 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
            aria-label="Accessibility"
          >
            <Accessibility className="size-4" />
          </button>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs font-normal text-muted-foreground">You can pause and come back later with this link</p>
          <button
            onClick={copyLink}
            className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {linkCopied ? <Check className="size-3 text-green-500" /> : <Link className="size-3" />}
            {linkCopied ? "Copied link" : "Copy link"}
          </button>
        </div>
      </motion.div>

      <div className="mx-auto flex w-full max-w-3xl gap-4 sm:min-h-0 sm:flex-1 sm:px-6 sm:pb-8 sm:pt-6">
        <main className="relative flex min-w-0 flex-col sm:flex-1">

          {/* Desktop floating pill header — sits over the chat card */}
          <motion.div
            ref={helpRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: started ? 1 : 0, y: started ? 0 : -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-4 top-2 z-10 hidden sm:flex items-center justify-between rounded-[999px] border border-[#d6d6d6] bg-white/70 backdrop-blur-[8px] px-5 py-2.5"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-[13px] font-semibold leading-snug text-black">Team member role with Woolworths Group</p>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-[#858585]">You can pause and come back later with this link</p>
                <button
                  onClick={copyLink}
                  className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#858585] transition-colors hover:text-foreground"
                >
                  {linkCopied ? <Check className="size-2.5 text-green-500" /> : <Link className="size-2.5" />}
                  {linkCopied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
            <button
              onClick={() => setHelpOpen(v => !v)}
              className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-full text-[#858585] transition-colors hover:bg-black/5 hover:text-foreground"
              aria-label="Accessibility"
            >
              <Accessibility className="size-3.5" />
            </button>
          </motion.div>

          <div className="relative flex flex-col min-h-[calc(100dvh-5rem)] sm:min-h-0 sm:flex-1 sm:overflow-hidden sm:rounded-2xl sm:bg-card sm:shadow-[var(--shadow-border)]">

            {/* Message list */}
            <div
              className={cn(
                "flex-1 space-y-10 px-5 py-8 sm:min-h-0 sm:overflow-y-auto sm:px-6 sm:pt-24",
                floatingInputPad || "sm:pb-6",
              )}
            >

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
                      {m.widget === "text-question" ? (() => {
                        const parts = m.content.split("\n\n");
                        const preamble = parts.slice(0, -1).join("\n\n");
                        const question = parts.at(-1) ?? m.content;
                        return (
                          <>
                            {preamble && <InterviewerText content={preamble} plain />}
                            <div className={preamble ? "mt-6" : ""}>
                            <TextQuestionHeader
                              question={question}
                              currentIndex={m.widgetMeta?.currentIndex as number | undefined}
                              total={m.widgetMeta?.total as number | undefined}
                            />
                            </div>
                          </>
                        );
                      })() : m.stepType === "mcq" ? (() => {
                        const parts = m.content.split("\n\n");
                        const preamble = parts.slice(0, -1).join("\n\n");
                        const question = parts.at(-1) ?? m.content;
                        return (
                          <>
                            {preamble && <InterviewerText content={preamble} plain />}
                            <div className={cn("flex items-stretch gap-3", preamble ? "mt-6" : "")}>
                              <div className="w-[6px] shrink-0 rounded-full bg-[#30814C]" />
                              <div className="flex flex-col gap-1">
                                <p className="text-xs font-medium text-foreground/30">Single choice question</p>
                                <p className="text-lg font-semibold leading-snug text-foreground">
                                  {question}
                                </p>
                              </div>
                            </div>
                          </>
                        );
                      })() : m.widget === "video-question" ? null : (
                        <>
                          {m.widget === "company-intro-video" && (
                            <IntroBrandMedia />
                          )}
                          <InterviewerText content={m.content} textLayout={m.textLayout} />
                        </>
                      )}
                      {m.widget === "question-format" && (
                        <QuestionFormatWidget />
                      )}
                      {m.widget === "video-setup-tips" && (
                        <VideoSetupTipsWidget />
                      )}
                      {m.widget === "resume-link" && (
                        <ResumeLinkAction onCopyLink={copyLink} copied={linkCopied} />
                      )}
                      {m.widget === "company-intro-video" && (
                        <CompanyIntroVideo />
                      )}
                      {m.widget === "video-question" && (() => {
                        const parts = m.content.split("\n\n");
                        const preamble = parts.slice(0, -1).join("\n\n");
                        const question = parts.at(-1) ?? m.content;
                        return (
                          <>
                            {preamble && <InterviewerText content={preamble} plain />}
                            {preamble && <div className="mt-2" />}
                            <div className="flex flex-col gap-3 w-full">
                              {m.widgetMeta?.currentIndex !== undefined && m.widgetMeta?.total !== undefined && (
                                <p className="text-xs font-medium text-foreground/30">
                                  Video question · {m.widgetMeta.currentIndex}/{m.widgetMeta.total}
                                </p>
                              )}
                              <div className="flex items-stretch gap-3">
                                <div className="w-[6px] shrink-0 rounded-full bg-[#30814C]" />
                                <p className="flex-1 text-lg font-semibold leading-snug text-foreground">
                                  {question}
                                </p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
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
                      {m.videoUrl ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="overflow-hidden rounded-[16px] rounded-tr-sm border border-[#e5e5e5] bg-black w-[260px] sm:w-[300px]">
                            <video
                              src={m.videoUrl}
                              controls
                              playsInline
                              className="aspect-video w-full object-cover"
                            />
                          </div>
                          {m.id === submittedVideoMessageId && videoTriesUsed < 5 && (
                            <button
                              onClick={() => setVideoModalOpen(true)}
                              className="flex items-center gap-1.5 mr-1 text-xs font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                            >
                              <RotateCcw className="size-3" />
                              Re-record ({5 - videoTriesUsed} attempt{5 - videoTriesUsed === 1 ? "" : "s"} left)
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <CandidateTextBubble content={m.content} isNextVariant={isNextVariant} />
                        </div>
                      )}
                      {!editingMessageId && !isNextVariant && m.id !== profileAcceptedMessageId && !m.videoUrl && (
                        <button
                          onClick={() => startEditing(m.id, m.content)}
                          className="mr-2 text-xs font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
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

              <AnimatePresence mode="wait">
                {/* Pre-stream typing indicator */}
                {streamingWidget === "company-intro-video" && (isPreStreaming || streamingText) ? (
                  <motion.div
                    key="intro-streaming"
                    className="flex flex-col items-start"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: introImageVisible ? 1 : 0, y: introImageVisible ? 0 : 8 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  >
                    <IntroBrandMedia />
                    {streamingText && (
                      <InterviewerText content={streamingText} cursor textLayout={streamingLayout} />
                    )}
                  </motion.div>
                ) : isPreStreaming ? (
                  <motion.div
                    key="pre-stream-dots"
                    className="flex flex-col items-start"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <span className="inline-flex gap-[4px] translate-y-[2px] py-2">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="inline-block size-[6px] rounded-full bg-foreground/40"
                          style={{ animation: `pulse 1.1s ease-in-out ${i * 0.18}s infinite` }}
                        />
                      ))}
                    </span>
                  </motion.div>
                ) : streamingText ? (
                  <motion.div
                    key="streaming-text"
                    className="flex flex-col items-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {streamingStepType === "mcq" ? (() => {
                      const parts = streamingText.split("\n\n");
                      const preamble = parts.slice(0, -1).join("\n\n");
                      const question = parts.at(-1) ?? streamingText;
                      return (
                        <>
                          {preamble && <InterviewerText content={preamble} plain />}
                          <div className={cn("flex items-stretch gap-3", preamble ? "mt-6" : "")}>
                            <div className="w-[6px] shrink-0 rounded-full bg-[#30814C]" />
                            <div className="flex flex-col gap-1">
                              <p className="text-xs font-medium text-foreground/30">Single choice question</p>
                              <p className="text-lg font-semibold leading-snug text-foreground">
                                {question}
                                <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[1px] animate-pulse bg-foreground/60 align-middle" />
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })() : (
                      <InterviewerText content={streamingText} cursor textLayout={streamingLayout} />
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Inputs — transparent overlay on chat container */}
            {hasFloatingInput && (
            <div
              className={cn(
                "pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:absolute",
                isProfileInput ? "px-0" : "px-5 sm:px-6",
              )}
            >
            <div className="pointer-events-auto">
            {editingMessageId ? (
              <div className="animate-fade-up flex flex-col">
                {editingActiveType !== "mcq" && (
                  <div className="flex items-center gap-2 py-2.5">
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
                      {cancelPending ? "Confirm discard" : editReturnToReview ? "Back to review" : "Cancel"}
                    </button>
                  </div>
                )}
                {editingActiveType === "mcq" ? (
                  <div className="relative shrink-0 pt-3">
                    <button
                      onClick={() => handleCancelClick(editingText !== editingOriginalText)}
                      className={cn(
                        "absolute right-6 top-6 z-10 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                        cancelPending
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-muted text-muted-foreground hover:bg-black/5 hover:text-foreground"
                      )}
                    >
                      {cancelPending ? "Confirm discard" : editReturnToReview ? "Back to review" : "Cancel"}
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
                  <div className="shrink-0">
                    <ProfileForm
                      edgeToEdge
                      key={editingMessageId}
                      initialValues={(() => {
                        const [name = "", email = "", location = "", phone = ""] = editingText.split(" · ");
                        return { name, email, phone, location };
                      })()}
                      onSubmit={d => {
                        const parts = [d.name, d.email, d.location];
                        if (d.phone) parts.push(d.phone);
                        submitEditing(parts.join(" · "));
                      }}
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
                  <div className="animate-fade-up shrink-0">
                    <CTAButton onClick={() => advance("__next__")}>Next</CTAButton>
                  </div>
                )}
                {inputReady && activeType === "profile" && (
                  <div className="animate-fade-up-delayed shrink-0">
                    <ProfileForm
                      edgeToEdge
                      onSubmit={d => {
                        const id = newId();
                        setProfileAcceptedMessageId(id);
                        setMessages(prev => [
                          ...prev,
                          {
                            id,
                            role: "candidate" as const,
                            content: [d.name, d.email, d.location, ...(d.phone ? [d.phone] : [])].join(" · "),
                          },
                        ]);
                        const nextIdx = stepIndex + 1;
                        if (nextIdx < mockInterview.length) {
                          const nextStep = mockInterview[nextIdx];
                          streamMessage(nextStep.messages.join("\n\n"), () => {
                            setInputTypeOverride(null);
                            setStepIndex(nextIdx);
                          }, nextStep.widget, nextStep.textLayout, getTextQuestionMeta(nextIdx) ?? getVideoQuestionMeta(nextIdx), nextStep.type);
                        } else {
                          streamMessage(
                            "That's everything — thank you so much for your time! Review your answers below and hit submit when you're ready.",
                            () => setComplete(true),
                          );
                        }
                      }}
                    />
                  </div>
                )}
                {inputReady && activeType === "mcq" && (
                  <div className="animate-fade-up shrink-0">
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
                {inputReady && activeType === "video-setup" && (
                  <div className="animate-fade-up shrink-0 flex flex-col gap-2">
                    <CTAButton onClick={() => setCameraModalOpen(true)}>
                      Test microphone and camera
                    </CTAButton>
                    <CTAButton variant="secondary" onClick={() => advance("__next__")}>
                      Continue
                    </CTAButton>
                  </div>
                )}
                {inputReady && activeType === "video" && (
                  <div className="animate-fade-up shrink-0">
                    <CTAButton onClick={() => setVideoModalOpen(true)}>Record your answer</CTAButton>
                  </div>
                )}
                {complete && !isStreaming && !submitted && !reviewDone && (
                  <div className="animate-fade-up shrink-0">
                    <CTAButton onClick={() => setReviewMode(true)}>Review responses</CTAButton>
                  </div>
                )}
                {complete && !isStreaming && !submitted && reviewDone && (
                  <div className="animate-fade-up shrink-0 flex flex-col gap-2">
                    <CTAButton variant="secondary" onClick={() => setReviewMode(true)}>Review responses</CTAButton>
                    <CTAButton onClick={() => {
                      setSubmitted(true);
                      setMessages(prev => [...prev, { id: newId(), role: "candidate" as const, content: "Submit interview" }]);
                    }}>
                      Submit interview
                    </CTAButton>
                  </div>
                )}
                {submitted && (
                  <div className="animate-fade-up shrink-0">
                    <CTAButton onClick={onComplete}>View your insights report</CTAButton>
                  </div>
                )}
              </>
            )}
            </div>
            </div>
            )}

            {/* Review overlay */}
            <AnimatePresence>
              {reviewMode && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    key="review-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm"
                    onClick={() => { setReviewMode(false); setReviewDone(true); }}
                  />

                  {/* Modal */}
                  <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
                    <motion.div
                      key="review-overlay"
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 40, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                      className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[28px] bg-white mx-3 mb-3 sm:mx-0 sm:mb-0 sm:max-h-[80vh] sm:max-w-3xl"
                    >
                      {/* Review header */}
                      <div className="shrink-0 flex items-center gap-3 border-b border-[#f0f0f0] bg-[#fafaf8] px-4 py-4 sm:px-6">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base font-semibold text-foreground">Review your responses</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Edit any answer before submitting</p>
                        </div>
                      </div>

                      {/* Review list */}
                      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-3">
                        {(() => {
                          const pairs: { question: string; answer: ChatMessage; stepType?: QuestionType }[] = [];
                          let cCount = 0;
                          for (let i = 0; i < messages.length; i++) {
                            const m = messages[i];
                            if (m.role === "candidate" && m.variant !== "next") {
                              let question = "";
                              for (let j = i - 1; j >= 0; j--) {
                                if (messages[j].role === "interviewer") { question = messages[j].content; break; }
                              }
                              const step = mockInterview[cCount];
                              pairs.push({ question, answer: m, stepType: step?.type });
                              cCount++;
                            } else if (m.role === "candidate" && m.variant === "next") {
                              cCount++;
                            }
                          }
                          return pairs.map(({ question, answer }, idx) => {
                            const questionLabel = question.split("\n\n").at(-1) ?? question;
                            const isProfileAnswer = answer.id === profileAcceptedMessageId;
                            return (
                              <div key={answer.id} className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                                {/* Card header: question */}
                                <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/25">
                                      {isProfileAnswer ? "Your details" : `Question ${idx + 1}`}
                                    </p>
                                    <div className="border-l-2 border-[#30814C] pl-3">
                                      <p className="text-sm font-medium leading-snug text-foreground/70">
                                        {questionLabel}
                                      </p>
                                    </div>
                                  </div>
                                  {!answer.videoUrl && !isProfileAnswer && (
                                    <button
                                      onClick={() => {
                                        setReviewMode(false);
                                        setEditReturnToReview(true);
                                        startEditing(answer.id, answer.content);
                                      }}
                                      className="shrink-0 flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground active:scale-95"
                                    >
                                      <Pencil className="size-3" />
                                      Edit
                                    </button>
                                  )}
                                </div>

                                {/* Card body: answer */}
                                <div className="border-t border-[#f0f0f0] bg-[#fafaf8] px-4 py-3">
                                  {answer.videoUrl ? (
                                    <div className="overflow-hidden rounded-xl bg-black w-full">
                                      <video src={answer.videoUrl} controls playsInline className="aspect-video w-full object-cover" />
                                    </div>
                                  ) : (
                                    <InterviewerText content={isProfileAnswer ? answer.content.replace(/ · /g, "\n\n") : answer.content} plain />
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* Review footer */}
                      <div className="shrink-0 border-t border-border bg-white px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5 sm:pt-4">
                        <CTAButton onClick={() => { setReviewMode(false); setReviewDone(true); }}>Done</CTAButton>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </main>

      </div>

      <CameraSetupModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onReady={() => {
          setCameraModalOpen(false);
          advance("__camera_ready__");
        }}
      />

      <VideoQuestionModal
        open={videoModalOpen}
        question={activeType === "video" ? currentStep.messages[currentStep.messages.length - 1] : ""}
        currentIndex={activeType === "video" ? getVideoQuestionMeta(stepIndex)?.currentIndex : undefined}
        total={activeType === "video" ? getVideoQuestionMeta(stepIndex)?.total : undefined}
        initialTriesUsed={videoTriesUsed}
        onTriesUsedChange={setVideoTriesUsed}
        onClose={() => setVideoModalOpen(false)}
        onSubmit={(val, videoUrl) => {
          setVideoModalOpen(false);
          if (submittedVideoMessageId) {
            // Re-record: replace the videoUrl on the existing message, don't advance
            setMessages(prev => prev.map(m =>
              m.id === submittedVideoMessageId ? { ...m, videoUrl } : m
            ));
          } else {
            // First submit: push candidate message and advance
            const id = newId();
            setSubmittedVideoMessageId(id);
            setMessages(prev => [...prev, {
              id,
              role: "candidate" as const,
              content: val,
              ...(videoUrl ? { videoUrl } : {}),
            }]);
            const nextIdx = stepIndex + 1;
            if (nextIdx < mockInterview.length) {
              const nextStep = mockInterview[nextIdx];
              streamMessage(nextStep.messages.join("\n\n"), () => {
                setInputTypeOverride(null);
                setStepIndex(nextIdx);
              }, nextStep.widget, nextStep.textLayout, getTextQuestionMeta(nextIdx) ?? getVideoQuestionMeta(nextIdx), nextStep.type);
            } else {
              streamMessage(
                "That's everything — thank you so much for your time! Review your answers below and hit submit when you're ready.",
                () => setComplete(true),
              );
            }
          }
        }}
      />
    </div>
  );
}
