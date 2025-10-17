'use client';

import { useMemo } from "react";
import { SimulationInput } from "@/lib/calc";
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

export interface IncomeFormProps {
  value: SimulationInput;
  onChange: (value: SimulationInput) => void;
  professional: boolean;
  onProfessionalToggle: (next: boolean) => void;
}

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

function parseNumberInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

const monthlyFormatter = new Intl.NumberFormat("ja-JP");

export default function IncomeForm({
  value,
  onChange,
  professional,
  onProfessionalToggle
}: IncomeFormProps) {
  const monthlyDisplay = useMemo(
    () => monthlyFormatter.format(value.monthlyIncome || 0),
    [value.monthlyIncome]
  );

  return (
    <form className="space-y-5" aria-describedby="form-guidance">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">条件を入力</h2>
          <p className="text-sm text-[var(--color-text-secondary)]" id="form-guidance">
            かんたん入力から始めて、必要に応じてプロ向け条件を開いてください。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="muted">モード: {professional ? "プロ" : "かんたん"}</Badge>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            かんたん
            <Switch
              checked={professional}
              onCheckedChange={(checked) => onProfessionalToggle(!!checked)}
              aria-label="プロモードに切り替え"
            />
            プロ
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="monthlyIncome">月収（額面）</Label>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" className="h-7 px-2 text-xs">
                    入力ヒント
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  半角数字で入力してください。ボーナスを含める場合は月平均に換算します。
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="monthlyIncome"
            inputMode="numeric"
            value={monthlyDisplay}
            onChange={(event) =>
              onChange({
                ...value,
                monthlyIncome: parseNumberInput(event.target.value)
              })
            }
            aria-describedby="monthlyIncomeHint"
          />
          <p id="monthlyIncomeHint" className="text-xs text-[var(--color-text-muted)]">
            例: 120000
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="months">想定継続月数</Label>
            <Input
              id="months"
              inputMode="numeric"
              min={1}
              max={12}
              value={value.months}
              onChange={(event) =>
                onChange({ ...value, months: Math.max(1, Number(event.target.value) || 1) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>週あたり労働時間</Label>
            <Select
              value={value.weekly}
              onValueChange={(selected) =>
                onChange({ ...value, weekly: selected as SimulationInput["weekly"] })
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>従業員規模</Label>
            <Select
              value={value.firmSize}
              onValueChange={(selected) =>
                onChange({ ...value, firmSize: selected as SimulationInput["firmSize"] })
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
            <Label>扶養関係</Label>
            <Select
              value={value.dependent}
              onValueChange={(selected) =>
                onChange({ ...value, dependent: selected as SimulationInput["dependent"] })
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

        {professional ? (
          <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-panel)_88%,transparent)] p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              プロモード（控除の詳細）
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              自治体や制度により閾値が異なる場合があります。最新の法令をご確認ください。
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  自治体注記を確認
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>自治体の住民税ルール</DialogTitle>
                <DialogDescription>
                  多くの自治体では 110 万円を閾値としていますが、一部地域では非課税枠が異なります。
                  公式サイトや窓口で最新情報をご確認ください。
                </DialogDescription>
              </DialogContent>
            </Dialog>
            <Separator />
            <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
              <p>
                交通費や賞与を調整したい場合は、月収欄を修正して複数パターンを比較しましょう。
                モード切り替えは URL にも保存されます。
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
