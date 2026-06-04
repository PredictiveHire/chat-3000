"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DropdownQuestion } from "@/components/DropdownQuestion";
import { MCQQuestion } from "@/components/MCQQuestion";
import { MultiSelectQuestion } from "@/components/MultiSelectQuestion";
import { MobileNumberQuestion } from "@/components/MobileNumberQuestion";
import { ProfileForm } from "@/components/ProfileForm";
import { ReplyBar } from "@/components/ReplyBar";
import { getMockInterview } from "@/lib/mockData";
import type { ChatMessage, MessageWidget, QuestionType, TextLayout } from "@/lib/types";
import { useBrand } from "@/lib/BrandContext";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui/cta-button";
import { Accessibility, Check, Link, Pencil, RotateCcw } from "lucide-react";
import { QuestionFormatWidget } from "@/components/QuestionFormatWidget";
import { TextQuestionHeader } from "@/components/TextQuestionHeader";
import { CameraSetupModal } from "@/components/CameraSetupModal";
import { VideoQuestionModal } from "@/components/VideoQuestionModal";
import { CompanyIntroVideo } from "@/components/CompanyIntroVideo";
import { VideoSetupTipsWidget } from "@/components/VideoSetupTipsWidget";
import { DemographicForm } from "@/components/DemographicForm";
import { FeedbackWidget } from "@/components/FeedbackWidget";

const STREAM_WORD_MS = 80;
const PRE_STREAM_DELAY_MS = 900;
const INTER_PARAGRAPH_PAUSE_MS = 620;

const interviewQuestionTypes: QuestionType[] = ["text", "mcq", "multi-select", "dropdown", "video"];

function isInterviewQuestionStep(step: { type: QuestionType; widget?: MessageWidget }) {
  return interviewQuestionTypes.includes(step.type) || step.widget === "text-question" || step.widget === "video-question";
}

function shouldShowQuestionOnly(widget?: MessageWidget, stepType?: QuestionType | null) {
  return widget === "text-question"
    || widget === "video-question"
    || stepType === "text"
    || stepType === "video"
    || stepType === "mcq"
    || stepType === "multi-select"
    || stepType === "dropdown";
}

function AnimatedTextContent({ text, cursor }: { text: string; cursor?: boolean }) {
  const cursorEl = cursor ? (
    <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[1px] animate-pulse bg-foreground/60 align-middle" />
  ) : null;

  if (!cursor) return <>{text}</>;

  const lastSpaceIdx = text.lastIndexOf(' ');
  if (lastSpaceIdx < 0) {
    const wordCount = text.trim() ? 1 : 0;
    return <><span key={wordCount} className="animate-word-in">{text}</span>{cursorEl}</>;
  }
  const stableText = text.slice(0, lastSpaceIdx + 1);
  const lastWord = text.slice(lastSpaceIdx + 1);
  const wordCount = text.split(' ').filter(Boolean).length;
  return (
    <>
      {stableText}
      <span key={wordCount} className="animate-word-in">{lastWord}</span>
      {cursorEl}
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
            <AnimatedTextContent text={p} cursor={cursor && isLast} />
          </p>
        ) : (
          <p key={i} className="whitespace-pre-wrap text-base leading-relaxed text-foreground/60">
            <AnimatedTextContent text={p} cursor={cursor && isLast} />
          </p>
        );
      })}
    </div>
  );
}

const LINE_HEIGHT_PX = 20; // text-sm leading-relaxed ≈ 20 px
const MAX_LINES = 8;
const MAX_HEIGHT_PX = LINE_HEIGHT_PX * MAX_LINES;

function CandidateTextBubble({ content, isNextVariant }: { content: string; isNextVariant: boolean }) {
  const { accentLight } = useBrand();
  const [isMultiline, setIsMultiline] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = bubbleRef.current;
    const txt = textRef.current;
    if (!el || !txt) return;
    const observer = new ResizeObserver(() => {
      setIsMultiline(el.getBoundingClientRect().height > 24);
      setOverflows(txt.scrollHeight > MAX_HEIGHT_PX);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [content]);

  const collapsed = overflows && !expanded;

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "px-4 py-2.5 text-sm leading-relaxed break-words antialiased",
        isMultiline ? "rounded-[20px] rounded-tr-md" : "rounded-full rounded-tr-lg",
        !isNextVariant && "bg-[#F4F4F4] text-black",
      )}
      style={isNextVariant ? { backgroundColor: accentLight, color: "#1a1a1a" } : undefined}
    >
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: collapsed ? MAX_HEIGHT_PX : (textRef.current?.scrollHeight ?? 9999) }}
      >
        <p ref={textRef} className="whitespace-pre-wrap">{content}</p>
        {collapsed && (
          <div
            className="absolute bottom-0 inset-x-0 h-8 pointer-events-none"
            style={{ backgroundImage: `linear-gradient(to top, ${isNextVariant ? accentLight : "#F4F4F4"}, transparent)` }}
          />
        )}
      </div>
      {overflows && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-1.5 text-xs font-medium text-foreground/50 hover:text-foreground/80 transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function ResumeLinkAction({ onCopyLink, copied }: { onCopyLink: () => void; copied: boolean }) {
  const { accent } = useBrand();
  return (
    <button
      type="button"
      onClick={onCopyLink}
      className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors"
      style={{ color: accent }}
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

export function InterviewChat({ started = true }: { started?: boolean }) {
  const brand = useBrand();
  const mockInterview = getMockInterview(brand.id);
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
  const [postPhase, setPostPhase] = useState<"idle" | "demographic" | "feedback" | "done">("idle");

  // Streaming
  const [streamingText, setStreamingText] = useState("");
  const [streamingLayout, setStreamingLayout] = useState<TextLayout>("heading-last");
  const [streamingStepType, setStreamingStepType] = useState<QuestionType | null>(null);
  const [streamingWidget, setStreamingWidget] = useState<MessageWidget | undefined>(undefined);
  const [streamingWidgetMeta, setStreamingWidgetMeta] = useState<Record<string, number | string> | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreStreaming, setIsPreStreaming] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [exchangeMinHeight, setExchangeMinHeight] = useState<number | null>(null);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const preStreamTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const msgListRef = useRef<HTMLDivElement>(null);
  const outerScrollRef = useRef<HTMLDivElement>(null);

  // Returns the visible height of the scrollable chat region.
  const getScrollContainerHeight = useCallback((): number => {
    const msgList = msgListRef.current;
    const outer = outerScrollRef.current;
    if (msgList && getComputedStyle(msgList).overflowY === "auto") {
      return msgList.clientHeight;
    }
    return outer ? outer.clientHeight : window.innerHeight;
  }, []);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, []);

  // Stream paragraph-by-paragraph: fast within each paragraph, pause between them
  const streamMessage = useCallback((text: string, onDone?: () => void, widget?: MessageWidget, textLayout?: TextLayout, widgetMeta?: Record<string, number | string>, stepType?: QuestionType) => {
    if (streamRef.current) clearInterval(streamRef.current);
    preStreamTimersRef.current.forEach(clearTimeout);
    preStreamTimersRef.current = [];

    setIsStreaming(true);
    setIsPreStreaming(true);
    setStreamingText("");
    setStreamingLayout(textLayout ?? "heading-last");
    setStreamingStepType(stepType ?? null);
    setStreamingWidget(widget);
    setStreamingWidgetMeta(widgetMeta);

    const displayText = shouldShowQuestionOnly(widget, stepType) ? (text.split("\n\n").at(-1) ?? text) : text;
    const paragraphs = displayText.split("\n\n");

    const streamParagraph = (paraIndex: number, alreadyStreamed: string) => {
      const para = paragraphs[paraIndex];
      const prefix = alreadyStreamed ? alreadyStreamed + "\n\n" : "";
      const words = para.split(' ');
      let wordIdx = 0;
      let currentText = "";
      streamRef.current = setInterval(() => {
        currentText += (wordIdx > 0 ? ' ' : '') + (words[wordIdx] ?? '');
        wordIdx++;
        setStreamingText(prefix + currentText);
        if (wordIdx >= words.length) {
          clearInterval(streamRef.current!);
          streamRef.current = null;
          const streamed = prefix + para;
          const isLast = paraIndex === paragraphs.length - 1;
          if (isLast) {
            const msg: ChatMessage = { id: newId(), role: "interviewer", content: displayText };
            if (widget) msg.widget = widget;
            if (textLayout) msg.textLayout = textLayout;
            if (widgetMeta) msg.widgetMeta = widgetMeta;
            if (stepType) msg.stepType = stepType;
            setMessages(prev => [...prev, msg]);
            setStreamingText("");
            setIsStreaming(false);
            onDone?.();
          } else {
            const t = setTimeout(() => streamParagraph(paraIndex + 1, streamed), INTER_PARAGRAPH_PAUSE_MS);
            preStreamTimersRef.current.push(t);
          }
        }
      }, STREAM_WORD_MS);
    };

    const startStreaming = setTimeout(() => {
      setIsPreStreaming(false);
      streamParagraph(0, "");
    }, PRE_STREAM_DELAY_MS);
    preStreamTimersRef.current.push(startStreaming);
  }, []);

  // Seed first question once the loading screen has fully exited — cleanup handles StrictMode double-invoke
  useEffect(() => {
    if (!started) return;
    const first = mockInterview[0];
    streamMessage(first.messages.join("\n\n"), undefined, first.widget, first.textLayout, undefined, first.type);

    return () => {
      preStreamTimersRef.current.forEach(clearTimeout);
      preStreamTimersRef.current = [];
      if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);


  // When pre-streaming starts: if there is at least one candidate bubble (not the very
  // first AI message), lock in a min-height equal to the visible chat area so that after
  // streaming ends a short response stays anchored at the top rather than being pushed
  // down by scroll clamping. We never explicitly clear exchangeMinHeight — the empty
  // streaming zone keeps its height between exchanges, and the value is overwritten at the
  // start of the next exchange.
  useEffect(() => {
    if (!isPreStreaming) return;
    const msgList = msgListRef.current;
    const candidates = msgList?.querySelectorAll('[data-role="candidate"]');
    if (!candidates?.length) return; // first AI message — no candidate to anchor yet
    setExchangeMinHeight(getScrollContainerHeight());
    const t = setTimeout(() => {
      const last = candidates[candidates.length - 1] as HTMLElement;
      last.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [isPreStreaming, getScrollContainerHeight]);

  // Delay showing inputs until after streaming + any widget animations finish
  useEffect(() => {
    if (isStreaming || isPreStreaming) {
      setInputVisible(false);
      return;
    }
    const lastMsg = messages[messages.length - 1];
    const delay = lastMsg?.widget ? 1050 : 400;
    const t = setTimeout(() => setInputVisible(true), delay);
    return () => clearTimeout(t);
  }, [isStreaming, isPreStreaming, messages]);

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
  const inputReady = !isStreaming && !isPreStreaming && !complete;
  const inputShown = inputReady && inputVisible;

  const questionStepIndices = useMemo(() => mockInterview
    .map((s, i) => (isInterviewQuestionStep(s) ? i : -1))
    .filter(i => i !== -1), [mockInterview]);
  const totalInterviewQuestions = questionStepIndices.length;
  const getQuestionMeta = useCallback((stepIdx: number) => {
    const pos = questionStepIndices.indexOf(stepIdx);
    if (pos === -1) return undefined;
    return { currentIndex: pos + 1, total: totalInterviewQuestions };
  }, [questionStepIndices, totalInterviewQuestions]);

  const advance = useCallback((answer: string, videoUrl?: string) => {
    const isNext = answer === "__next__";
    const isCameraReady = answer === "__camera_ready__";

    const id = newId();
    setMessages(prev => [
      ...prev,
      {
        id,
        role: "candidate" as const,
        content: isCameraReady ? "I'm ready" : isNext ? "Continue" : answer,
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
      }, nextStep.widget, nextStep.textLayout, getQuestionMeta(nextIdx), nextStep.type);
    } else {
      streamMessage(
        "That's everything — thank you so much for your time! Review your answers below and hit submit when you're ready.",
        () => setComplete(true),
      );
    }
  }, [getQuestionMeta, mockInterview, stepIndex, streamMessage]);

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
      (submitted && !isStreaming && postPhase !== "done"));

  const floatingInputPad = (() => {
    const isGenerating = isStreaming || isPreStreaming;
    if (!hasFloatingInput && !isGenerating) return "";
    if (submitted && postPhase === "demographic") return "pb-[36rem]";
    if (submitted && postPhase === "feedback") return "pb-[28rem]";
    // During streaming stepIndex hasn't advanced yet, so peek at the next step's input type.
    const type = editingMessageId
      ? editingActiveType
      : isGenerating
        ? (mockInterview[stepIndex + 1]?.type ?? activeType)
        : activeType;
    if (type === "profile") return "pb-[26rem]";
    if (type === "mcq" || type === "dropdown") return "pb-72";
    if (type === "multi-select") return "pb-[26rem]";
    if (type === "text" || type === "phone") return "pb-44";
    return "pb-28";
  })();

  const isProfileInput =
    (editingMessageId != null && editingActiveType === "profile") ||
    (inputReady && activeType === "profile");

  return (
    <div ref={outerScrollRef} className="flex h-dvh flex-col overflow-y-auto bg-white sm:h-full">

      {/* Mobile header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: started ? 1 : 0, y: started ? 0 : -16 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 flex shrink-0 flex-col items-start border-b border-[#e5e5e5] bg-white/80 px-5 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.018)] backdrop-blur-lg sm:hidden"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <p className="text-base font-bold tracking-tight text-foreground">{brand.headerTitle}</p>
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
            {linkCopied ? <Check className="size-3" style={{ color: brand.accent }} /> : <Link className="size-3" />}
            {linkCopied ? "Copied link" : "Copy link"}
          </button>
        </div>
      </motion.div>

      {/* Desktop header */}
      <motion.div
        ref={helpRef}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: started ? 1 : 0, y: started ? 0 : -8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 hidden shrink-0 justify-center border-b border-[#e5e5e5] bg-white/90 px-8 py-3.5 shadow-[0_3px_12px_rgba(15,23,42,0.025)] backdrop-blur-lg sm:flex"
      >
        <div className="relative flex w-full max-w-4xl items-center px-14">
          <div className="flex min-w-0 flex-col items-start gap-1 text-left">
            <p className="text-[15px] font-semibold leading-snug text-black">{brand.headerTitle}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] text-[#858585]">You can pause and come back later with this link</p>
              <button
                onClick={copyLink}
                className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-[#858585] transition-colors hover:text-foreground"
              >
                {linkCopied ? <Check className="size-3" style={{ color: brand.accent }} /> : <Link className="size-3" />}
                {linkCopied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
          <button
            onClick={() => setHelpOpen(v => !v)}
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full text-[#858585] transition-colors hover:bg-black/5 hover:text-foreground"
            aria-label="Accessibility"
          >
            <Accessibility className="size-3.5" />
          </button>
        </div>
      </motion.div>

      <div className="mx-auto flex w-full max-w-4xl gap-4 bg-white sm:min-h-0 sm:flex-1 sm:px-8 sm:pb-8">
        <main className="relative flex min-w-0 flex-col bg-white sm:flex-1">

          <div className="relative flex min-h-[calc(100dvh-5rem)] flex-col bg-white sm:min-h-0 sm:flex-1">

            {/* Message list */}
            <div
              ref={msgListRef}
              className={cn(
                "flex-1 space-y-10 px-5 py-8 sm:min-h-0 sm:overflow-y-auto sm:px-6 sm:py-8",
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
                        const question = parts.at(-1) ?? m.content;
                        return (
                          <div>
                            <TextQuestionHeader
                              question={question}
                              currentIndex={m.widgetMeta?.currentIndex as number | undefined}
                              total={m.widgetMeta?.total as number | undefined}
                            />
                          </div>
                        );
                      })() : (m.stepType === "mcq" || m.stepType === "multi-select" || m.stepType === "dropdown") ? (() => {
                        const parts = m.content.split("\n\n");
                        const question = parts.at(-1) ?? m.content;
                        return (
                          <div>
                            <TextQuestionHeader
                              question={question}
                              currentIndex={m.widgetMeta?.currentIndex as number | undefined}
                              total={m.widgetMeta?.total as number | undefined}
                            />
                          </div>
                        );
                      })() : m.widget === "video-question" ? null : (
                        <>
                          {m.widget === "company-intro-video" && brand.logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={brand.logo} alt={`${brand.name} logo`} className="mb-3 h-8 w-auto object-contain" />
                          )}
                          <InterviewerText content={m.content} textLayout={m.textLayout} />
                        </>
                      )}
                      {m.widget === "question-format" && (
                        <QuestionFormatWidget interview={mockInterview} />
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
                        const question = parts.at(-1) ?? m.content;
                        return (
                          <TextQuestionHeader
                            question={question}
                            currentIndex={m.widgetMeta?.currentIndex as number | undefined}
                            total={m.widgetMeta?.total as number | undefined}
                          />
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
                    data-role="candidate"
                    initial={{ y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 480, damping: 30, mass: 0.8 }}
                    className="group flex flex-col items-end scroll-mt-20"
                  >
                    <div className="flex flex-col items-end gap-1">
                      {m.videoUrl ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="overflow-hidden rounded-[16px] rounded-tr-sm border border-[#e5e5e5] bg-black w-[260px] sm:w-full">
                            <video
                              src={m.videoUrl}
                              controls
                              playsInline
                              className="w-full object-cover aspect-[3/4] sm:aspect-video"
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
                      ) : m.id === profileAcceptedMessageId ? (
                        <div>
                          <CandidateTextBubble content={m.content} isNextVariant={false} />
                        </div>
                      ) : (
                        <div>
                          <CandidateTextBubble content={m.content} isNextVariant={isNextVariant} />
                        </div>
                      )}
                      {!submitted && !editingMessageId && !isNextVariant && m.id !== profileAcceptedMessageId && !m.videoUrl && (
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

              <div style={{ minHeight: exchangeMinHeight ?? undefined }}>
              <AnimatePresence mode="wait">
                {/* Pre-stream loading indicator */}
                {isPreStreaming ? (
                  <motion.div
                    key="pre-stream-loading"
                    className="flex flex-col items-start"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <motion.span
                      key="dots"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex gap-[4px] translate-y-[2px] py-2"
                    >
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="inline-block size-[6px] rounded-full bg-foreground/40"
                          style={{ animation: `pulse 1.1s ease-in-out ${i * 0.18}s infinite` }}
                        />
                      ))}
                    </motion.span>
                  </motion.div>
                ) : streamingText ? (
                  <motion.div
                    key="streaming-text"
                    data-streaming="true"
                    className="flex flex-col items-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {(streamingWidget === "text-question" || streamingWidget === "video-question" || streamingStepType === "mcq" || streamingStepType === "multi-select" || streamingStepType === "dropdown") ? (() => {
                      const parts = streamingText.split("\n\n");
                      const question = parts.at(-1) ?? streamingText;
                      return (
                        <TextQuestionHeader
                          question={question}
                          currentIndex={streamingWidgetMeta?.currentIndex as number | undefined}
                          total={streamingWidgetMeta?.total as number | undefined}
                        >
                          <AnimatedTextContent text={question} cursor />
                        </TextQuestionHeader>
                      );
                    })() : (
                      <>
                        {streamingWidget === "company-intro-video" && brand.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={brand.logo} alt={`${brand.name} logo`} className="mb-3 h-8 w-auto object-contain" />
                        )}
                        <InterviewerText content={streamingText} cursor textLayout={streamingLayout} />
                      </>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              </div>

              <div ref={bottomRef} />
            </div>

            {/* Inputs — white bottom panel keeps scrolled content from showing behind the controls */}
            {hasFloatingInput && (
            <div
              className={cn(
                "pointer-events-none fixed inset-x-0 bottom-0 z-[70] bg-white pb-[max(1rem,env(safe-area-inset-bottom))] sm:absolute",
                isProfileInput ? "px-4 sm:px-5 sm:pb-4" : "px-5 sm:px-6",
              )}
            >
            <div className="pointer-events-auto">
            {editingMessageId ? (
              <div className="animate-fade-up flex flex-col">
                {editingActiveType !== "mcq" && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
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
                ) : editingActiveType === "multi-select" ? (
                  <MultiSelectQuestion
                    key={`${editingMessageId}-multi-select`}
                    options={editingActiveOptions.length ? editingActiveOptions : ["Option A", "Option B", "Option C"]}
                    initialValues={editingText.split(", ").filter(Boolean)}
                    onConfirm={(values) => submitEditing(values.join(", "))}
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
                {inputShown && activeType === "next" && (
                  <div className="animate-fade-up shrink-0">
                    <CTAButton onClick={() => advance("__next__")}>Continue</CTAButton>
                  </div>
                )}
                {inputShown && activeType === "profile" && (
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
                          }, nextStep.widget, nextStep.textLayout, getQuestionMeta(nextIdx), nextStep.type);
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
                {inputShown && activeType === "mcq" && (
                  <div className="animate-fade-up shrink-0">
                    <MCQQuestion
                      question={currentStep.messages[currentStep.messages.length - 1]}
                      options={activeOptions.length ? activeOptions : ["Option A", "Option B", "Option C", "Option D"]}
                      onSelect={advance}
                    />
                  </div>
                )}
                {inputShown && activeType === "multi-select" && (
                  <div className="animate-fade-up shrink-0">
                    <MultiSelectQuestion
                      options={activeOptions.length ? activeOptions : ["Option A", "Option B", "Option C"]}
                      onConfirm={(values) => advance(values.join(", "))}
                    />
                  </div>
                )}
                {inputShown && activeType === "dropdown" && (
                  <div className="animate-fade-up">
                    <DropdownQuestion
                      key={`${currentStep.id}-${activeType}`}
                      options={activeOptions.length ? activeOptions : ["Choice 1", "Choice 2", "Choice 3"]}
                      onConfirm={advance}
                    />
                  </div>
                )}
                {inputShown && activeType === "text" && (
                  <ReplyBar onSend={advance} />
                )}
                {inputShown && activeType === "phone" && (
                  <div className="animate-fade-up">
                    <MobileNumberQuestion onConfirm={advance} />
                  </div>
                )}
                {inputShown && activeType === "video-setup" && (
                  <div className="animate-fade-up shrink-0 flex flex-col gap-2">
                    <CTAButton onClick={() => setCameraModalOpen(true)}>
                      Test microphone and camera
                    </CTAButton>
                    <CTAButton variant="secondary" onClick={() => advance("__next__")}>
                      Continue
                    </CTAButton>
                  </div>
                )}
                {inputShown && activeType === "video" && (
                  <div className="animate-fade-up shrink-0">
                    <CTAButton onClick={() => setVideoModalOpen(true)}>Record your answer</CTAButton>
                  </div>
                )}
                {complete && !isStreaming && inputVisible && !submitted && !reviewDone && (
                  <div className="animate-fade-up shrink-0">
                    <CTAButton onClick={() => setReviewMode(true)}>Review responses</CTAButton>
                  </div>
                )}
                {complete && !isStreaming && inputVisible && !submitted && reviewDone && (
                  <div className="animate-fade-up shrink-0 flex flex-col gap-2">
                    <CTAButton variant="secondary" onClick={() => setReviewMode(true)}>Review responses</CTAButton>
                    <CTAButton onClick={() => {
                      setSubmitted(true);
                      setMessages(prev => [...prev, { id: newId(), role: "candidate" as const, content: "Submit interview" }]);
                      streamMessage(
                        "Thank you! Your interview has been successfully submitted.\n\nBefore you go, we have a couple of optional questions to help us with diversity and inclusion. All answers are voluntary.",
                        () => setPostPhase("demographic"),
                      );
                    }}>
                      Submit interview
                    </CTAButton>
                  </div>
                )}
                {submitted && !isStreaming && inputVisible && postPhase === "demographic" && (
                  <div className="animate-fade-up shrink-0">
                    <DemographicForm onSubmit={(answers) => {
                      const filled = Object.values(answers).filter(Boolean);
                      setMessages(prev => [...prev, {
                        id: newId(),
                        role: "candidate" as const,
                        content: filled.length ? filled.join(" · ") : "Skipped",
                      }]);
                      streamMessage(
                        "Thank you! Last thing — how was your experience with this interview today?",
                        () => setPostPhase("feedback"),
                      );
                    }} />
                  </div>
                )}
                {submitted && !isStreaming && inputVisible && postPhase === "feedback" && (
                  <div className="animate-fade-up shrink-0">
                    <FeedbackWidget
                      onSubmit={(rating, comment) => {
                        const content = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}${comment ? ` — ${comment}` : ""}`;
                        setMessages(prev => [...prev, { id: newId(), role: "candidate" as const, content }]);
                        streamMessage(
                          "Thank you! You're all set.",
                          () => setPostPhase("done"),
                        );
                      }}
                      onSkip={() => {
                        streamMessage(
                          "Thank you! You're all set.",
                          () => setPostPhase("done"),
                        );
                      }}
                    />
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
                      className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[28px] bg-white mx-3 mb-3 sm:mx-0 sm:mb-0 sm:max-h-[80vh] sm:max-w-4xl"
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
                            if (m.role === "candidate" && m.variant !== "next" && m.id !== profileAcceptedMessageId) {
                              let question = "";
                              for (let j = i - 1; j >= 0; j--) {
                                if (messages[j].role === "interviewer") { question = messages[j].content; break; }
                              }
                              const step = mockInterview[cCount];
                              pairs.push({ question, answer: m, stepType: step?.type });
                              cCount++;
                            } else if (m.role === "candidate" && (m.variant === "next" || m.id === profileAcceptedMessageId)) {
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
                                    <div className="flex items-center gap-1.5">
                                      {isProfileAnswer && (
                                        <img src="/details-icon.png" alt="" className="size-4 rounded-full" />
                                      )}
                                      <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/25">
                                        {isProfileAnswer ? "Your details" : `Question ${idx + 1}`}
                                      </p>
                                    </div>
                                    <div className="border-l-2 pl-3" style={{ borderColor: brand.accent }}>
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
                        <CTAButton onClick={() => { setReviewMode(false); setReviewDone(true); }}>Submit</CTAButton>
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
              }, nextStep.widget, nextStep.textLayout, getQuestionMeta(nextIdx), nextStep.type);
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
