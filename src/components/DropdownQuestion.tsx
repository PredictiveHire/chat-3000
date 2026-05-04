"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DropdownQuestionProps = {
  options: string[];
  onConfirm: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function DropdownQuestion({
  options,
  onConfirm,
  disabled,
  placeholder = "Type to search…",
}: DropdownQuestionProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const MAX_TEXTAREA_HEIGHT = 340;

  useEffect(() => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  // Open list whenever there are filtered results
  useEffect(() => {
    setOpen(filtered.length > 0);
    setHighlightIdx(0);
  }, [filtered]);

  // Scroll highlighted item into view
  useEffect(() => {
    const el = listRef.current?.children[highlightIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-resize logic identical to ReplyBar
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    
    // Reset to 0 temporarily so scrollHeight can shrink if text is deleted
    el.style.height = "0px";
    const scrollHeight = el.scrollHeight;
    
    const isMobile = viewport.width > 0 && viewport.width < 640;
    const maxH = isMobile ? viewport.height * 0.2 : MAX_TEXTAREA_HEIGHT;
    
    el.style.height = `${Math.min(scrollHeight, maxH)}px`;
    el.style.overflowY = scrollHeight > maxH ? "auto" : "hidden";
  }, [query, viewport]);

  const pick = (opt: string) => {
    if (disabled || selected) return;
    setSelected(opt);
    setQuery(opt);
    setOpen(false);
    onConfirm(opt);
  };

  const submit = () => {
    if (selected) return;
    const exact = options.find((o) => o.toLowerCase() === query.trim().toLowerCase());
    if (exact) pick(exact);
    else if (filtered.length === 1) pick(filtered[0]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (open && filtered[highlightIdx]) {
        pick(filtered[highlightIdx]);
      } else {
        submit();
      }
      return;
    }

    if (!open) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const locked = Boolean(disabled || selected);

  return (
    <div ref={rootRef} className="relative flex flex-col px-3 pb-3 pt-0">
      {/* Floating results list — anchored above the input */}
      {open && (
        <div className="animate-fade-up absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-border)] z-50">
          <div
            ref={listRef}
            className="flex flex-col divide-y divide-border overflow-y-auto"
            style={{ maxHeight: 400 }}
          >
            {filtered.map((opt, i) => {
              const isHighlighted = i === highlightIdx;
              return (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); pick(opt); }}
                  onMouseEnter={() => setHighlightIdx(i)}
                  className={cn(
                    "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors duration-100",
                    isHighlighted
                      ? "bg-chat-primary/10 text-foreground"
                      : "text-foreground",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Textarea — auto-expanding like ReplyBar */}
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col">
        <div className="w-full rounded-[20px] bg-[#F4F4F4] shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <div className="relative flex flex-row items-end sm:flex-col sm:items-stretch rounded-[16px] border border-[#e5e5e5] bg-white">
            <textarea
              ref={textareaRef}
              rows={1}
              value={query}
              onChange={(e) => { if (!locked) { setQuery(e.target.value); } }}
              onKeyDown={onKeyDown}
              onFocus={() => filtered.length > 0 && setOpen(true)}
              disabled={locked}
              placeholder={selected ? selected : placeholder}
              autoFocus
              className="w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-h-10 py-2.5 pl-4 pr-10 sm:px-4 sm:py-2.5 sm:pr-4 text-sm leading-relaxed"
              style={{ overflowY: "hidden" }}
              aria-autocomplete="list"
              aria-expanded={open}
            />
            <div className="flex items-center pb-1 pl-2 pr-1 sm:justify-end sm:px-3 sm:pb-1 sm:pt-0">
              <Button
                type="submit"
                disabled={locked || (!selected && filtered.length === 0 && !options.find((o) => o.toLowerCase() === query.trim().toLowerCase()))}
                size="icon"
                className="mb-0.5 sm:mb-0 size-8 shrink-0 rounded-full bg-chat-primary text-chat-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-chat-primary/90 active:not-disabled:scale-[0.96]"
                aria-label="Confirm selection"
              >
                <SendHorizontal className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Mobile hint text (outside container) */}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        We encourage you to share more about your experiences to get better evaluation
      </p>
    </div>
  );
}
