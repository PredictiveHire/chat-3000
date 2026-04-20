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
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightIdx]) pick(filtered[highlightIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const locked = Boolean(disabled || selected);

  return (
    <div ref={rootRef} className="relative flex flex-col px-3 pb-3 pt-0">
      {/* Floating results list — anchored above the input */}
      {open && (
        <div className="animate-fade-up absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-border)]">
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

      {/* Text input — same style as ReplyBar */}
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="flex flex-col rounded-2xl border border-input bg-white focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { if (!locked) { setQuery(e.target.value); } }}
            onKeyDown={onKeyDown}
            onFocus={() => filtered.length > 0 && setOpen(true)}
            disabled={locked}
            placeholder={selected ? selected : placeholder}
            autoFocus
            className="min-h-8 flex-1 bg-transparent px-4 pt-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-autocomplete="list"
            aria-expanded={open}
          />
          <div className="flex items-center justify-end px-2 pb-2">
            <Button
              type="submit"
              disabled={locked || (!selected && filtered.length === 0 && !options.find((o) => o.toLowerCase() === query.trim().toLowerCase()))}
              size="icon"
              className="size-8 shrink-0 rounded-full bg-chat-primary text-chat-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-chat-primary/90 active:not-disabled:scale-[0.96]"
              aria-label="Confirm selection"
            >
              <SendHorizontal className="size-3.5" />
            </Button>
          </div>
        </div>
      </form>
      <p className="mt-2 text-left text-xs text-muted-foreground">
        We encourage you to share more about your experiences to get better evaluation
      </p>
    </div>
  );
}
