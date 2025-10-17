import { clsx } from "clsx";
import { Card } from "./ui/card";

type Tone = "default" | "income" | "expense";

export interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}

const toneText: Record<Tone, string> = {
  default: "text-[var(--color-text-primary)]",
  income: "text-[var(--color-income)]",
  expense: "text-[var(--color-expense)]"
};

export default function KpiCard({ label, value, hint, tone = "default" }: KpiCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <span
        className={clsx("text-3xl font-semibold tracking-tight", toneText[tone])}
        aria-live="polite"
      >
        {value}
      </span>
      {hint ? (
        <span className="text-sm text-[var(--color-text-secondary)]">{hint}</span>
      ) : null}
    </Card>
  );
}
