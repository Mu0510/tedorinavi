import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
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
  annualTotal: number;
  takeHomeTotal: number;
  reachedThresholds?: string[];
  actualMonths?: number;
}

const THRESHOLDS: Array<{ id: string; value: number; label: string }> = [
  { id: "SOCIAL_106", value: 1_060_000, label: "社保加入（特定適用）106万円" },
  { id: "RESIDENT_110", value: 1_100_000, label: "住民税 110万円" },
  { id: "TAX_FUYOU_123", value: 1_230_000, label: "扶養控除 123万円" },
  { id: "SOCIAL_130", value: 1_300_000, label: "社会保険 130万円" },
  { id: "SPOUSE_150", value: 1_500_000, label: "配偶者控除 150万円" },
  { id: "TAX_160", value: 1_600_000, label: "所得税 160万円" },
  { id: "STUDENT_188", value: 1_880_000, label: "学生特例 188万円" },
  { id: "SPOUSE_2016", value: 2_016_000, label: "配偶者特別控除 201.6万円" }
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

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 shadow-[var(--shadow-md)] text-sm text-[var(--color-text-primary)]">
      <div className="font-semibold">月 {label}</div>
      <ul className="mt-2 space-y-1">
        {payload.filter((entry) => entry.value != null).map((entry) => (
          <li key={entry.dataKey as string} className="flex items-center justify-between gap-6">
            <span className="text-xs text-[var(--color-text-secondary)]">{entry.name}</span>
            <span className="font-medium text-[var(--color-text-primary)]">
              {currencyFormatter.format(entry.value ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

function interpolateMonth(data: Array<{ month: number; cumulative: number }>, value: number) {
  if (!data.length) return null;
  for (let index = 0; index < data.length; index += 1) {
    const point = data[index];
    if (point.cumulative >= value) {
      if (index === 0) return point.month;
      const previous = data[index - 1];
      const span = point.cumulative - previous.cumulative;
      if (span <= 0) return point.month;
      const ratio = (value - previous.cumulative) / span;
      return previous.month + ratio;
    }
  }
  return null;
}

export default function IncomeArea({
  data,
  annualTotal,
  takeHomeTotal,
  reachedThresholds = [],
  actualMonths
}: IncomeAreaProps) {
  const isEmpty = data.length === 0;

  const verticalMarkers = THRESHOLDS.map((threshold) => ({
    ...threshold,
    month: interpolateMonth(data, threshold.value)
  })).filter((marker) => marker.month !== null) as Array<
    { id: string; label: string; value: number; month: number }
  >;
  type Marker = (typeof verticalMarkers)[number];
  const markerElements = useMemo<JSX.Element[]>(() => {
    if (!verticalMarkers.length) return [];
    const clusterThreshold = 60_000;
    const clusters: Marker[][] = [];
    let currentCluster: Marker[] = [verticalMarkers[0]];

    for (let index = 1; index < verticalMarkers.length; index += 1) {
      const marker = verticalMarkers[index];
      const previous = currentCluster[currentCluster.length - 1];
      if (Math.abs(marker.value - previous.value) <= clusterThreshold) {
        currentCluster.push(marker);
      } else {
        clusters.push(currentCluster);
        currentCluster = [marker];
      }
    }

    clusters.push(currentCluster);

    const offsetStep = 28;
    const markersWithOffset: Array<Marker & { labelOffset: number }> = [];
    clusters.forEach((cluster) => {
      if (cluster.length === 1) {
        markersWithOffset.push({ ...cluster[0], labelOffset: 0 });
        return;
      }
      const start = -((cluster.length - 1) / 2) * offsetStep;
      cluster.forEach((marker, clusterIndex) => {
        markersWithOffset.push({ ...marker, labelOffset: start + clusterIndex * offsetStep });
      });
    });

    return markersWithOffset.map((marker) => (
      <ReferenceLine
        key={marker.id}
        y={marker.value}
        stroke={colors.sankey.text}
        strokeDasharray="6 6"
      >
        <Label
          value={marker.label}
          fill={colors.sankey.text}
          fontSize={12}
          position="right"
          dx={8}
          dy={marker.labelOffset}
          className="chart-threshold-label"
        />
      </ReferenceLine>
    ));
  }, [verticalMarkers]);

  if (isEmpty) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-panel)] text-sm text-[var(--color-text-secondary)]">
        データがありません
      </div>
    );
  }

  const totalDeduction = Math.max(0, annualTotal - takeHomeTotal);
  const reachedMarkers = verticalMarkers.filter((marker) => reachedThresholds.includes(marker.id));
  const deductionPerWall = reachedMarkers.length > 0 ? totalDeduction / reachedMarkers.length : 0;
  const dropSchedule = reachedMarkers
    .map((marker) => ({ month: Math.max(1, Math.ceil(marker.month)), amount: deductionPerWall }))
    .sort((a, b) => a.month - b.month);

  let dropAccumulator = 0;
  let scheduleIndex = 0;
  const combinedData = data.map((point) => {
    while (scheduleIndex < dropSchedule.length && point.month >= dropSchedule[scheduleIndex].month) {
      dropAccumulator += dropSchedule[scheduleIndex].amount;
      scheduleIndex += 1;
    }
    const net = Math.max(0, Math.round(point.cumulative - dropAccumulator));
    return { ...point, net };
  });

  const clampedActualMonths = Math.max(
    0,
    Math.min(actualMonths ?? combinedData.length, combinedData.length)
  );
  const futureStartMonth =
    clampedActualMonths >= combinedData.length
      ? combinedData.length + 1
      : Math.max(1, clampedActualMonths + 1);

  const chartData = combinedData.map((point) => {
    const isActual = clampedActualMonths > 0 && point.month <= clampedActualMonths;
    const includeBoundary =
      clampedActualMonths > 0 && clampedActualMonths < combinedData.length && point.month === clampedActualMonths;
    const isFuture = point.month >= futureStartMonth;
    return {
      ...point,
      cumulativeActual: isActual ? point.cumulative : null,
      netActual: isActual ? point.net : null,
      cumulativeProjected: isFuture || includeBoundary ? point.cumulative : null,
      netProjected: isFuture || includeBoundary ? point.net : null
    };
  });
  const hasProjectedGross = chartData.some((point) => point.cumulativeProjected !== null);
  const hasProjectedNet = chartData.some((point) => point.netProjected !== null);

  return (
    <div className="income-area-chart h-[400px] md:h-[650px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 40, right: 128, left: 16, bottom: 24 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary[400]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.primary[400]} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="takeHomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.dark.accent} stopOpacity={0.6} />
              <stop offset="95%" stopColor={colors.dark.accent} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="incomeGradientProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary[400]} stopOpacity={0.35} />
              <stop offset="95%" stopColor={colors.primary[400]} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="takeHomeGradientProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.dark.accent} stopOpacity={0.25} />
              <stop offset="95%" stopColor={colors.dark.accent} stopOpacity={0.03} />
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
            type="linear"
            dataKey="cumulativeActual"
            name="累積額（額面）"
            stroke={colors.primary[500]}
            strokeWidth={2}
            fill="url(#incomeGradient)"
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
          {hasProjectedGross && (
            <Area
              type="linear"
              dataKey="cumulativeProjected"
              name="累積額（額面・予測）"
              stroke={colors.primary[500]}
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              fill="url(#incomeGradientProjected)"
              isAnimationActive={false}
              connectNulls
            />
          )}
          <Area
            type="linear"
            dataKey="netActual"
            name="累積額（手取り）"
            stroke={colors.dark.accent}
            strokeWidth={2}
            fill="url(#takeHomeGradient)"
            isAnimationActive={false}
          />
          {hasProjectedNet && (
            <Area
              type="linear"
              dataKey="netProjected"
              name="累積額（手取り・予測）"
              stroke={colors.dark.accent}
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              fill="url(#takeHomeGradientProjected)"
              isAnimationActive={false}
              connectNulls
            />
          )}
          {markerElements}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
