import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from "recharts";
import { colors } from "mirai-theme";

export interface IncomeAreaProps {
  data: Array<{ month: number; cumulative: number }>;
}

const THRESHOLDS: Array<{ id: string; value: number; label: string }> = [
  { id: "RESIDENT_110", value: 1_100_000, label: "住民税 110万円" },
  { id: "TAX_FUYOU_123", value: 1_230_000, label: "扶養控除 123万円" },
  { id: "SOCIAL_130", value: 1_300_000, label: "社保 130万円" },
  { id: "SPOUSE_150", value: 1_500_000, label: "配偶者控除 150万円" },
  { id: "TAX_160", value: 1_600_000, label: "所得税 160万円" },
  { id: "STUDENT_188", value: 1_880_000, label: "学生特例 188万円" },
  { id: "SPOUSE_2016", value: 2_016_000, label: "配偶者特例 201.6万円" }
];

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

const tooltipRenderer = ({
  active,
  payload,
  label
}: TooltipProps<number, number>) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 shadow-[var(--shadow-md)] text-sm text-[var(--color-text-primary)]">
      <div className="font-semibold">月 {label}</div>
      <div className="text-[var(--color-income)]">{currencyFormatter.format(value)}</div>
    </div>
  );
};

export default function IncomeArea({ data }: IncomeAreaProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-panel)] text-sm text-[var(--color-text-secondary)]">
        データがありません
      </div>
    );
  }

  return (
    <div className="h-[400px] md:h-[480px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 24, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary[400]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.primary[400]} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            stroke="var(--color-text-muted)"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            tickFormatter={(value: number | string) => `${Math.round(Number(value) / 10000)}万`}
            width={72}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={tooltipRenderer} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={colors.primary[500]}
            strokeWidth={2}
            fill="url(#incomeGradient)"
            activeDot={{ r: 5 }}
          />
          {THRESHOLDS.map((threshold) => (
            <ReferenceLine
              key={threshold.id}
              y={threshold.value}
              stroke={colors.sankey.text}
              strokeDasharray="3 3"
              label={{
                value: threshold.label,
                position: "right",
                fill: colors.sankey.text,
                fontSize: 12
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
