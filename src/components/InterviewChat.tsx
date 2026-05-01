"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DropdownQuestion } from "@/components/DropdownQuestion";
import { MCQQuestion } from "@/components/MCQQuestion";
import { MobileNumberQuestion } from "@/components/MobileNumberQuestion";
import { MessageBubble } from "@/components/MessageBubble";
import { ProgressBar } from "@/components/ProgressBar";
import { ReplyBar } from "@/components/ReplyBar";
import { TypingIndicator } from "@/components/TypingIndicator";
import { mockInterview } from "@/lib/mockData";
import type { ChatMessage, QuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Link, Pencil } from "lucide-react";
import { RoleDescriptionPanel } from "@/components/RoleDescriptionPanel";

const TYPING_DELAY_MS = 3000;

type MessageRowProps = {
  message: ChatMessage;
  isPinned: boolean;
  pinnedIdRef: React.RefObject<string | null>;
  onEdit?: () => void;
};

function MessageRow({ message: m, isPinned, pinnedIdRef, onEdit }: MessageRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  // On mount, if this is the newly-sent candidate message, scroll its top
  // edge to the top of the scroll container (block: 'start').
  useEffect(() => {
    if (m.id !== pinnedIdRef.current) return;
    rowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rowRef}
      className={cn(
        isPinned && "sticky top-0 z-10",
        "flex flex-col group",
        m.role === "candidate" ? "items-end" : "items-start"
      )}
    >
      <div className={cn("flex items-center gap-2", m.role === "candidate" && "flex-row-reverse")}>
        <MessageBubble role={m.role}>
          <p className="whitespace-pre-wrap">{m.content}</p>
        </MessageBubble>
        
        {m.role === "candidate" && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center justify-center size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 active:scale-[0.96] transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Edit response"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function newId() {
  return crypto.randomUUID();
}

export function InterviewChat({ onComplete }: { onComplete: () => void }) {
  const total = mockInterview.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, []);
  const [showRoleDescription, setShowRoleDescription] = useState(false);
  const [complete, setComplete] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputTypeOverride, setInputTypeOverride] = useState<QuestionType | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingOriginalText, setEditingOriginalText] = useState("");
  const [cancelPending, setCancelPending] = useState(false);
  // ID of the candidate message currently pinned to the top while AI is typing
  const pinnedIdRef = useRef<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  // Queue up interviewer messages one by one with a typing delay between each
  const enqueueInterviewerMessages = useCallback(
    (bubbles: string[], onDone?: () => void) => {
      let i = 0;

      const scheduleNext = () => {
        if (i >= bubbles.length) {
          setIsTyping(false);
          onDone?.();
          return;
        }

        setIsTyping(true);

        const currentBubble = bubbles[i];
        i++;

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: newId(), role: "interviewer", content: currentBubble },
          ]);
          scheduleNext();
        }, TYPING_DELAY_MS);
      };

      scheduleNext();
    },
    [],
  );

  // Seed the first step on mount — guard against StrictMode double-invoke
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    enqueueInterviewerMessages(mockInterview[0].messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When AI finishes typing, unpin the candidate message
  useEffect(() => {
    if (!isTyping) {
      setPinnedId(null);
      pinnedIdRef.current = null;
    }
  }, [isTyping]);

  // Scroll to the bottom whenever a new message lands or the typing indicator
  // appears — but only when there is no pinned message holding the viewport.
  useEffect(() => {
    if (pinnedIdRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const currentStep = mockInterview[stepIndex];
  const activeType = inputTypeOverride ?? currentStep.type;
  const activeOptions = currentStep.options ?? [];

  const advance = useCallback(
    (answer: string) => {
      const id = newId();
      pinnedIdRef.current = id;
      setPinnedId(id);
      setMessages((prev) => [...prev, { id, role: "candidate" as const, content: answer }]);

      // keyword override applies only to the *current* waiting step;
      // it is cleared when the step advances in the onDone callbacks below.
      const keyword = answer.trim().toLowerCase();
      if (keyword === "submit") {
        enqueueInterviewerMessages(
          ["That's everything — thank you so much for your time! Review your answers below and hit submit when you're ready."],
          () => setComplete(true),
        );
        return;
      }
      if (keyword === "mcq") setInputTypeOverride("mcq");
      else if (keyword === "dropdown") setInputTypeOverride("dropdown");
      else setInputTypeOverride(null);

      const nextIdx = stepIndex + 1;

      if (nextIdx < mockInterview.length) {
        enqueueInterviewerMessages(mockInterview[nextIdx].messages, () => {
          setInputTypeOverride(null);
          setStepIndex(nextIdx);
        });
      } else {
        enqueueInterviewerMessages(
          ["That's everything — thank you so much for your time! Review your answers below and hit submit when you're ready."],
          () => setComplete(true),
        );
      }
    },
    [stepIndex, enqueueInterviewerMessages],
  );

  const startEditing = useCallback((messageId: string, messageContent: string) => {
    setEditingMessageId(messageId);
    setEditingText(messageContent);
    setEditingOriginalText(messageContent);
    setCancelPending(false);
  }, []);

  const handleCancelClick = useCallback((hasChanges: boolean) => {
    if (hasChanges && !cancelPending) {
      // First click on Cancel with unsaved changes — ask for confirmation
      setCancelPending(true);
    } else {
      // No changes, or user confirmed discard
      setEditingMessageId(null);
      setEditingText("");
      setEditingOriginalText("");
      setCancelPending(false);
    }
  }, [cancelPending]);

  const submitEditing = useCallback((updatedAnswer: string) => {
    if (!editingMessageId) return;

    setMessages((prev) =>
      prev.map((msg) => (msg.id === editingMessageId ? { ...msg, content: updatedAnswer } : msg))
    );
    setEditingMessageId(null);
    setEditingText("");
    setEditingOriginalText("");
    setCancelPending(false);
  }, [editingMessageId]);

  const progressCurrent = complete ? total : stepIndex + 1;

  // The input is ready only when all bubbles for the current main-interview step have landed
  const inputReady = !isTyping && !complete;

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
          if (step) {
            editingActiveType = step.type;
            editingActiveOptions = step.options ?? [];
          }
          // Walk backwards to find the last interviewer message before this one
          for (let j = i - 1; j >= 0; j--) {
            if (messages[j].role === "interviewer") {
              editingQuestion = messages[j].content;
              break;
            }
          }
          break;
        }
        cCount++;
      }
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Mobile header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 sm:hidden">
        <div>
          <p className="text-sm font-semibold text-foreground">Staff Engineer · Sapia.ai</p>
          <p className="text-xs text-muted-foreground">Chat Interview</p>
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          {linkCopied ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <Link className="size-3" />
          )}
          {linkCopied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <div className={cn(
        "mx-auto flex min-h-0 w-full flex-1 gap-4 sm:px-4 sm:pb-6 sm:pt-8",
        showRoleDescription ? "max-w-[1200px]" : "max-w-3xl"
      )}>
        <main className="relative flex min-w-0 flex-1 flex-col">
          <div className="mb-4 hidden shrink-0 items-center justify-between sm:flex">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Applying for Staff Engineer at Sapia.ai
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                You can pause and come back to this interview later.
              </p>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {linkCopied ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Link className="size-3" />
                )}
                {linkCopied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowRoleDescription((v) => !v)}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {showRoleDescription ? "Hide role description" : "View role description"}
          </button>
          </div>
          <ProgressBar current={progressCurrent} total={total} />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-2xl sm:bg-card sm:shadow-[var(--shadow-border)]">
          <div ref={scrollContainerRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, index) => {
              const isActiveMcqQuestion =
                inputReady &&
                activeType === "mcq" &&
                !editingMessageId &&
                index === messages.length - 1 &&
                m.role === "interviewer";

              if (isActiveMcqQuestion) return null;

              return (
                <MessageRow
                  key={m.id}
                  message={m}
                  isPinned={m.id === pinnedId}
                  pinnedIdRef={pinnedIdRef}
                  onEdit={
                    m.role === "candidate"
                      ? () => startEditing(m.id, m.content)
                      : undefined
                  }
                />
              );
            })}

            {isTyping && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>

          {editingMessageId ? (
            <div className="animate-fade-up flex flex-col bg-background/95 backdrop-blur-sm">
              {editingActiveType !== "mcq" && (
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
                  <p className="flex-1 text-xs text-muted-foreground leading-snug line-clamp-2">
                    <span className="font-medium text-foreground">Editing: </span>
                    {editingQuestion}
                  </p>
                  <button
                    onClick={() => handleCancelClick(editingText !== editingOriginalText)}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                      cancelPending
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    )}
                  >
                    {cancelPending ? "Confirm" : "Cancel"}
                  </button>
                </div>
              )}
              {editingActiveType === "mcq" ? (
                <div className="shrink-0 px-3 pb-3 pt-3 relative">
                  <button
                    onClick={() => handleCancelClick(editingText !== editingOriginalText)}
                    className={cn(
                      "absolute right-6 top-6 z-10 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                      cancelPending
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-muted text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    )}
                  >
                    {cancelPending ? "Confirm" : "Cancel"}
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
              ) : (
                <ReplyBar
                  key={editingMessageId}
                  onSend={submitEditing}
                  initialText={editingText}
                  onTextChange={(t) => { setEditingText(t); setCancelPending(false); }}
                />
              )}
            </div>
          ) : (
            <>
              {/* Floating overlay for MCQ — now in-flow so it doesn't block the last message */}
              {inputReady && activeType === "mcq" && (
                <div className="animate-fade-up shrink-0 px-3 pb-3">
                  <MCQQuestion
                    question={currentStep.messages[currentStep.messages.length - 1]}
                    options={activeOptions.length ? activeOptions : ["Option A", "Option B", "Option C", "Option D"]}
                    onSelect={advance}
                  />
                </div>
              )}

              {/* Dropdown — in-flow at the bottom, list floats upward */}
              {inputReady && activeType === "dropdown" && (
                <div className="animate-fade-up">
                  <DropdownQuestion
                    key={`${currentStep.id}-${activeType}`}
                    options={activeOptions.length ? activeOptions : ["Choice 1", "Choice 2", "Choice 3"]}
                    onConfirm={advance}
                  />
                </div>
              )}

              {/* Text reply bar */}
              {inputReady && activeType === "text" && (
                <ReplyBar onSend={advance} />
              )}

              {/* Phone number input */}
              {inputReady && activeType === "phone" && (
                <div className="animate-fade-up">
                  <MobileNumberQuestion onConfirm={advance} />
                </div>
              )}

              {/* Submit CTA — shown after interview is complete */}
              {complete && !isTyping && !submitted && (
                <div className="animate-fade-up shrink-0 px-4 pb-4 pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(true);
                      setMessages((prev) => [...prev, { id: newId(), role: "candidate" as const, content: "Submit interview" }]);
                    }}
                    className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    Submit interview
                  </button>
                </div>
              )}

              {/* Post-submit CTA */}
              {submitted && (
                <div className="animate-fade-up shrink-0 px-4 pb-4 pt-2">
                  <button
                    onClick={onComplete}
                    className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    View your insights report
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </main>

        {/* Role description panel — flex sibling, no absolute positioning */}
        {showRoleDescription && (
          <aside className="hidden lg:flex w-[360px] xl:w-[420px] shrink-0 flex-col">
            <RoleDescriptionPanel onClose={() => setShowRoleDescription(false)} />
          </aside>
        )}
      </div>
    </div>
  );
}
