type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((current / safeTotal) * 100));

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-1.5"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Question ${current} of ${total}`}
    >
      <div className="h-full bg-muted overflow-hidden">
        <div
          className="h-full bg-chat-primary transition-all duration-1000 ease-out-quart"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
