import { clsx } from "clsx";
import { Button } from "./ui/button";
import Progress from "./ui/progress";

export interface NextWallMeterProps {
  next?: {
    id: string;
    label: string;
    amount: number;
  };
  currentAnnual: number;
  onAdjust?: (delta: number) => void;
  className?: string;
}

export default function NextWallMeter({
  next,
  currentAnnual,
  onAdjust,
  className
}: NextWallMeterProps) {
  if (!next) {
    return (
      <div
        className={clsx(
          "space-y-3 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_92%,transparent)] p-6 shadow-none",
          className
        )}
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          すべての壁を越えました
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          追加で到達する壁はありません。条件の見直しや控除を専門家に相談しましょう。
        </p>
      </div>
    );
  }

  const target = currentAnnual + next.amount;
  const progress = target === 0 ? 0 : Math.min(100, (currentAnnual / target) * 100);
  const formattedRemaining = new Intl.NumberFormat("ja-JP").format(next.amount);

  return (
    <div
      className={clsx(
        "space-y-4 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_92%,transparent)] p-6 shadow-none",
        className
      )}
    >
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          次の壁まであと ¥{formattedRemaining}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {next.label} に差し掛かります。必要な手続きや保険料を早めに確認しましょう。
        </p>
      </div>
      <Progress value={progress} />
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span>ワンクリックで試算を更新</span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onAdjust?.(10000)}
        >
          +1万円
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onAdjust?.(50000)}
        >
          +5万円
        </Button>
      </div>
    </div>
  );
}
