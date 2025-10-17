'use client';

import { useMemo } from "react";
import type { ReactNode, RefObject } from "react";
import type { SimulationInput } from "@/lib/calc";
import type { DashboardState } from "@/lib/simulationState";
import Input from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Badge from "./ui/badge";
import Separator from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface HintButtonProps {
  label: string;
  children: ReactNode;
}

function HintButton({ label, children }: HintButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="grid h-6 w-6 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] text-[10px] font-semibold text-[var(--color-text-secondary)] transition hover:bg-[color-mix(in_oklab,var(--color-border)_25%,transparent)]"
          aria-label={`${label}の説明`}
        >
          ？
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left text-sm leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

const hintButtonWide = "grid h-7 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] px-3 text-xs text-[var(--color-text-secondary)] transition hover:bg-[color-mix(in_oklab,var(--color-border)_25%,transparent)]";

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

const numberFormatter = new Intl.NumberFormat("ja-JP");

function parseNumberInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export interface IncomeFormFieldsProps {
  value: DashboardState;
  onChange: (value: DashboardState) => void;
  professional: boolean;
  onProfessionalToggle: (next: boolean) => void;
  focusRef?: RefObject<HTMLInputElement>;
}

export default function IncomeFormFields({
  value,
  onChange,
  professional,
  onProfessionalToggle,
  focusRef
}: IncomeFormFieldsProps) {
  const monthlyDisplay = useMemo(
    () => numberFormatter.format(value.monthlyIncome || 0),
    [value.monthlyIncome]
  );
  const annualAmount = useMemo(
    () => Math.max(0, Math.round(value.monthlyIncome * value.months)),
    [value.monthlyIncome, value.months]
  );
  const annualDisplay = useMemo(() => numberFormatter.format(annualAmount || 0), [annualAmount]);
  const currentYearDisplay = useMemo(
    () => numberFormatter.format(value.currentYearIncome || 0),
    [value.currentYearIncome]
  );
  const monthsElapsed = useMemo(() => {
    const now = new Date();
    return Math.max(1, now.getMonth() + 1);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6" aria-describedby="input-guidance">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="edit-inputs-heading"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              条件を編集
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]" id="input-guidance">
              かんたん入力から始めて、必要に応じてプロ向けオプションを開いてください。
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Badge tone="muted" aria-live="polite">
              モード: {professional ? "プロ" : "かんたん"}
            </Badge>
            <span className="sr-only">かんたん / プロ モード切り替え</span>
            <div className="flex items-center gap-2">
              <span aria-hidden="true">かんたん</span>
              <Switch
                checked={professional}
                onCheckedChange={(checked) => onProfessionalToggle(Boolean(checked))}
                aria-label={professional ? "かんたんモードに戻す" : "プロモードに切り替える"}
              />
              <span aria-hidden="true">プロ</span>
            </div>
          </div>
        </header>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="currentYearIncome">今年ここまでの収入</Label>
              <HintButton label="今年ここまでの収入">
                1 月から現在までに受け取った給与・報酬の合計です。概算が必要な場合は「月収から概算」を利用してください。
              </HintButton>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="currentYearIncome"
                inputMode="numeric"
                value={currentYearDisplay}
                onChange={(event) =>
                  onChange({
                    ...value,
                    currentYearIncome: parseNumberInput(event.target.value)
                  })
                }
                aria-describedby="currentYearIncomeHint"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onChange({
                    ...value,
                    currentYearIncome: parseNumberInput(
                      String(value.monthlyIncome * Math.min(monthsElapsed, value.months))
                    )
                  })
                }
              >
                月収から概算
              </Button>
            </div>
            <p id="currentYearIncomeHint" className="text-xs text-[var(--color-text-muted)]">
              月収 × {monthsElapsed} ヶ月で概算できます。正式な値は給与明細や源泉徴収票でご確認ください。
            </p>
          </div>

          <div className="space-y-3">
            <Tabs
              value={value.incomeEntry}
              onValueChange={(mode) =>
                onChange({
                  ...value,
                  incomeEntry: mode as DashboardState["incomeEntry"]
                })
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">月収で入力</TabsTrigger>
                <TabsTrigger value="annual">年収で入力</TabsTrigger>
              </TabsList>
              <TabsContent value="monthly" className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthlyIncome">月収（額面）</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={hintButtonWide}
                        aria-label="月収入力のヒント"
                      >
                        入力ヒント
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-left text-sm leading-relaxed">
                      半角数字で入力してください。賞与を含める場合は月平均に換算します。
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="monthlyIncome"
                  inputMode="numeric"
                  value={monthlyDisplay}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      monthlyIncome: parseNumberInput(event.target.value),
                      incomeEntry: "monthly"
                    })
                  }
                  aria-describedby="monthlyIncomeHint"
                  ref={focusRef}
                />
                <p id="monthlyIncomeHint" className="text-xs text-[var(--color-text-muted)]">
                  例: 140000（半角数字のみ）
                </p>
              </TabsContent>
              <TabsContent value="annual" className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="annualIncome">年収（概算）</Label>
                  <HintButton label="年収の入力">
                    年収を入力すると想定月数に応じて月収へ換算します。
                  </HintButton>
                </div>
                <Input
                  id="annualIncome"
                  inputMode="numeric"
                  value={annualDisplay}
                  onChange={(event) => {
                    const annual = parseNumberInput(event.target.value);
                    const nextMonthly = Math.max(
                      0,
                      Math.round(annual / Math.max(1, value.months))
                    );
                    onChange({
                      ...value,
                      monthlyIncome: nextMonthly,
                      incomeEntry: "annual"
                    });
                  }}
                  aria-describedby="annualIncomeHint"
                />
                <p id="annualIncomeHint" className="text-xs text-[var(--color-text-muted)]">
                  想定月数に応じて自動的に月収へ換算します。
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="months">想定継続月数</Label>
                <HintButton label="想定継続月数">
                  今年働く予定の月数です。短期契約や休業期間がある場合はその期間を入力してください。
                </HintButton>
              </div>
              <Input
                id="months"
                inputMode="numeric"
                min={1}
                max={12}
                value={value.months}
                onChange={(event) =>
                  onChange({
                    ...value,
                    months: Math.min(12, Math.max(1, Number(event.target.value) || 1))
                  })
                }
              />
              <p className="text-xs text-[var(--color-text-muted)]">1〜12ヶ月で指定できます。</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly">週あたり労働時間</Label>
                <HintButton label="週あたり労働時間">
                  平均的な週の勤務時間です。20 時間以上で社会保険加入の条件に該当する場合があります。
                </HintButton>
              </div>
              <Select
                value={value.weekly}
                onValueChange={(selected) =>
                  onChange({ ...value, weekly: selected as SimulationInput["weekly"] })
                }
              >
                <SelectTrigger id="weekly">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="firmSize">従業員規模</Label>
                <HintButton label="従業員規模">
                  勤務先の従業員数です。51 名以上の企業では 106 万円の壁が適用されやすくなります。
                </HintButton>
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
                <SelectTrigger id="firmSize">
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
                <Label htmlFor="dependent">扶養関係</Label>
                <HintButton label="扶養関係">
                  配偶者や親など、どの扶養区分に当てはまるかを選択します。
                </HintButton>
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
                <SelectTrigger id="dependent">
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

          {professional ? (
            <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-panel)_92%,transparent)] p-5">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">プロ向けヒント</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                自治体や制度により閾値が異なる場合があります。最新の法令を確認して調整してください。
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    自治体の注記を確認
                  </Button>
                </DialogTrigger>
                <DialogContent className="gap-4">
                  <DialogTitle>自治体の住民税ルール</DialogTitle>
                  <DialogDescription className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    <p>
                      多くの自治体では 110 万円を閾値としていますが、一部地域では非課税枠が異なります。
                    </p>
                    <p>公式サイトや窓口で最新情報をご確認ください。</p>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
              <Separator />
              <p className="text-xs text-[var(--color-text-muted)]">
                交通費や賞与を調整したい場合は月収欄を修正して複数パターンを比較しましょう。
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
}
