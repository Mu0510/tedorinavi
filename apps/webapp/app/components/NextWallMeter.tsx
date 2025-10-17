import { clsx } from "clsx";
import { formatCurrencyJPY } from "@/lib/format";
import Progress from "./ui/progress";

export interface NextWallMeterProps {
  next?: {
    id: string;
    label: string;
    amount: number;
  };
  projectedAnnual: number;
  threshold: number | null;
  actualYearIncome: number;
  remainingHeadroom: number;
  progressPercent: number | null;
  className?: string;
}

export default function NextWallMeter({
  next,
  projectedAnnual,
  threshold,
  actualYearIncome,
  remainingHeadroom,
  progressPercent,
  className
}: NextWallMeterProps) {
  if (threshold === null || !next) {
    return (
      <div
        className={clsx(
          "space-y-3 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_92%,transparent)] p-6 shadow-none",
          className
        )}
      >
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">すべての壁を超えています</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          これ以上の壁はありません。社会保険や税務の負担を把握しながら、新しい目標を検討しましょう。
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          推定年収 {formatCurrencyJPY(projectedAnnual)} / 今年の累計 {formatCurrencyJPY(actualYearIncome)}
        </p>
      </div>
    );
  }

  const remaining = Math.max(0, remainingHeadroom);
  const planBuffer = Math.max(0, next.amount);
  const overThreshold = remaining === 0;
  const progressValue = progressPercent === null ? 0 : progressPercent;

  return (
    <div
      className={clsx(
        "space-y-4 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_92%,transparent)] p-6 shadow-none",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          次の壁: {next.label}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          閾値は {formatCurrencyJPY(threshold)}。今年のこれまでの収入は{" "}
          {formatCurrencyJPY(actualYearIncome)} です。
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {overThreshold
            ? "すでに閾値を超えています。社会保険や税の手続きが必要か確認しましょう。"
            : `あと ${formatCurrencyJPY(remaining)} までは手取りの急減を避けられます。`}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>現在 {formatCurrencyJPY(actualYearIncome)}</span>
          <span>閾値 {formatCurrencyJPY(threshold)}</span>
        </div>
        <Progress value={progressValue} />
      </div>

      <div className="text-xs text-[var(--color-text-muted)]">
        <p>推定年収 {formatCurrencyJPY(projectedAnnual)}</p>
        <p>
          プラン上の余白 {formatCurrencyJPY(planBuffer)} / 実績ベースの余白{" "}
          {formatCurrencyJPY(remaining)}
        </p>
      </div>
    </div>
  );
}
