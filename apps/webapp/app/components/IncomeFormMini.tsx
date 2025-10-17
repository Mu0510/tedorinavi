'use client';

import { useMemo, useState } from "react";
import type { DashboardState } from "@/lib/simulationState";
import type { SimulationInput } from "@/lib/calc";
import { simulate } from "@/lib/calc";
import { formatCurrencyJPY } from "@/lib/format";
import Input from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Badge from "./ui/badge";

export interface IncomeFormMiniProps {
  value: DashboardState;
  onChange: (next: DashboardState) => void;
  onStart: () => void;
}

const numberFormatter = new Intl.NumberFormat("ja-JP");

const MIN_INCOME = 0;
const MAX_INCOME = 300_000;
const STEP = 5_000;

const firmOptions: Array<{ value: SimulationInput["firmSize"]; label: string }> = [
  { value: "<=50", label: "従業員50人以下" },
  { value: ">=51", label: "従業員51人以上" }
];

const weeklyOptions: Array<{ value: SimulationInput["weekly"]; label: string }> = [
  { value: "<20", label: "週20時間未満" },
  { value: ">=20", label: "週20時間以上" }
];

const dependentOptions: Array<{ value: SimulationInput["dependent"]; label: string }> = [
  { value: "none", label: "扶養なし" },
  { value: "spouse", label: "配偶者に扶養" },
  { value: "parent", label: "親に扶養" }
];

function parseNumeric(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export default function IncomeFormMini({ value, onChange, onStart }: IncomeFormMiniProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const preview = useMemo(() => simulate(value), [value]);
  const nextWallText = preview.next
    ? `次の壁まであと ${formatCurrencyJPY(preview.next.amount)}`
    : "すべての壁を超えています";

  const annualIncome = useMemo(
    () => Math.max(0, Math.round(value.monthlyIncome * value.months)),
    [value.monthlyIncome, value.months]
  );
  const monthsElapsed = useMemo(() => {
    const now = new Date();
    return Math.max(1, now.getMonth() + 1);
  }, []);

  const sliderConfig =
    value.incomeEntry === "annual"
      ? { min: 0, max: 4_500_000, step: 50_000, value: annualIncome }
      : { min: MIN_INCOME, max: MAX_INCOME, step: STEP, value: value.monthlyIncome };

  return (
    <TooltipProvider delayDuration={0}>
      <section
        aria-labelledby="teaser-heading"
        className="flex flex-col gap-6 rounded-[var(--radius-2xl)] border border-[color-mix(in_oklab,var(--color-border)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_88%,transparent)] p-6 md:p-8"
      >
      <header className="space-y-2">
        <h3 id="teaser-heading" className="text-lg font-semibold text-[var(--color-text-primary)]">
          今の条件からシミュレーション
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          月収・年収どちらからでも入力できます。詳細条件を開くと、勤務時間や扶養区分も設定できます。
        </p>
      </header>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-text-primary)]" htmlFor="mini-ytd">
            今年ここまでの収入
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] text-xs font-semibold text-[var(--color-text-secondary)] transition hover:bg-[color-mix(in_oklab,var(--color-border)_25%,transparent)]"
                aria-label="今年ここまでの収入の説明"
              >
                ？
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-left text-sm leading-relaxed">
              1 月から現在までに受け取った給与・報酬の合計です。概算が必要な場合は「月収から概算」を利用してください。
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="mini-ytd"
            inputMode="numeric"
            value={numberFormatter.format(value.currentYearIncome)}
            placeholder="900000"
            onChange={(event) =>
              onChange({
                ...value,
                currentYearIncome: parseNumeric(event.target.value)
              })
            }
          />
          <Button
            type="button"
            variant="outline"
            className="sm:w-auto"
            onClick={() =>
              onChange({
                ...value,
                currentYearIncome: parseNumeric(
                  String(value.monthlyIncome * Math.min(monthsElapsed, value.months))
                )
              })
            }
          >
            月収から概算
          </Button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          当年 1 月からの給与・報酬の合計を入力します。概算ボタンは月収 × {monthsElapsed} ヶ月で試算します。
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">収入の入力方法</p>
        <Tabs
          value={value.incomeEntry}
          onValueChange={(mode) => {
            const nextMode = mode as DashboardState["incomeEntry"];
            onChange({
              ...value,
              incomeEntry: nextMode
            });
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">月収で入力</TabsTrigger>
            <TabsTrigger value="annual">年収で入力</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="mt-4 space-y-2">
            <Input
              id="mini-monthly"
              inputMode="numeric"
              value={numberFormatter.format(value.monthlyIncome)}
              placeholder="140000"
              onChange={(event) =>
                onChange({
                  ...value,
                  monthlyIncome: parseNumeric(event.target.value),
                  incomeEntry: "monthly"
                })
              }
            />
            <p className="text-xs text-[var(--color-text-muted)]">賞与は月平均に換算して入力してください。</p>
          </TabsContent>
          <TabsContent value="annual" className="mt-4 space-y-2">
            <Input
              id="mini-annual"
              inputMode="numeric"
              value={numberFormatter.format(annualIncome)}
              placeholder="1680000"
              onChange={(event) => {
                const nextAnnual = parseNumeric(event.target.value);
                const nextMonthly = Math.max(
                  0,
                  Math.round(nextAnnual / Math.max(1, value.months))
                );
                onChange({
                  ...value,
                  monthlyIncome: nextMonthly,
                  incomeEntry: "annual"
                });
              }}
            />
            <p className="text-xs text-[var(--color-text-muted)]">年収を入力すると月収に換算されます。</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            スライダーで調整
          </span>
          <span className="rounded-full bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
            現在値{" "}
            {value.incomeEntry === "annual"
              ? formatCurrencyJPY(annualIncome)
              : formatCurrencyJPY(value.monthlyIncome)}
            {value.incomeEntry === "monthly" ? " / 月" : " / 年"}
          </span>
        </div>
        <input
          type="range"
          min={sliderConfig.min}
          max={sliderConfig.max}
          step={sliderConfig.step}
          value={sliderConfig.value}
          onChange={(event) =>
            onChange(
              value.incomeEntry === "annual"
                ? {
                    ...value,
                    monthlyIncome: Math.max(
                      0,
                      Math.round(Number(event.target.value) / Math.max(1, value.months))
                    ),
                    incomeEntry: "annual"
                  }
                : {
                    ...value,
                    monthlyIncome: Number(event.target.value),
                    incomeEntry: "monthly"
                  }
            )
          }
          className="w-full accent-[var(--color-primary-500)]"
          aria-label={value.incomeEntry === "annual" ? "年収スライダー" : "月収スライダー"}
        />
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>
            {formatCurrencyJPY(
              value.incomeEntry === "annual" ? sliderConfig.min : sliderConfig.min
            )}
          </span>
          <span>
            {formatCurrencyJPY(
              value.incomeEntry === "annual" ? sliderConfig.max : sliderConfig.max
            )}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-panel)]"
        onClick={() => setAdvancedOpen((prev) => !prev)}
        aria-expanded={advancedOpen}
      >
        詳細設定を{advancedOpen ? "閉じる" : "開く"}
        <ChevronDown className={`h-4 w-4 transition ${advancedOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {advancedOpen ? (
        <div className="grid gap-4 rounded-[var(--radius-xl)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-4 md:grid-cols-2">
          <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]" htmlFor="mini-months">
                  想定継続月数
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="grid h-6 w-6 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] text-[10px] text-[var(--color-text-secondary)]"
                      aria-label="想定継続月数の説明"
                    >
                      ？
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>今年想定している就業月数です。短期契約の場合はその期間を入力します。</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="mini-months"
                inputMode="numeric"
                value={value.months}
                onChange={(event) =>
                  onChange({
                    ...value,
                    months: Math.min(12, Math.max(1, Number(event.target.value) || 1))
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">週あたり労働時間</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="grid h-6 w-6 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] text-[10px] text-[var(--color-text-secondary)]"
                      aria-label="週あたり労働時間の説明"
                    >
                      ？
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>平均的な週の勤務時間を選びます。20 時間以上で社会保険加入の対象になる場合があります。</TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={value.weekly}
                onValueChange={(selected) =>
                  onChange({
                    ...value,
                    weekly: selected as SimulationInput["weekly"]
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weeklyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">従業員規模</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="grid h-6 w-6 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] text-[10px] text-[var(--color-text-secondary)]"
                      aria-label="従業員規模の説明"
                    >
                      ？
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>勤務先の従業員数です。51 名以上で 106 万円の壁が適用されやすくなります。</TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={value.firmSize}
                onValueChange={(selected) =>
                  onChange({
                    ...value,
                    firmSize: selected as SimulationInput["firmSize"]
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {firmOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">扶養関係</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="grid h-6 w-6 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] text-[10px] text-[var(--color-text-secondary)]"
                      aria-label="扶養関係の説明"
                    >
                      ？
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>配偶者や親など、どの扶養区分に当てはまるか選択してください。</TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={value.dependent}
                onValueChange={(selected) =>
                  onChange({
                    ...value,
                    dependent: selected as SimulationInput["dependent"]
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dependentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </div>
      ) : null}

      <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_oklab,var(--color-panel)_96%,transparent)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
        {nextWallText}
      </div>

      <Button type="button" className="self-start" onClick={onStart}>
        開始する
      </Button>
      </section>
    </TooltipProvider>
  );
}
