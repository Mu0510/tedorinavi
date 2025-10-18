'use client';

import { useEffect, useMemo, useState } from "react";
import NextWallMeter from "@/components/NextWallMeter";
import WallsBadges from "@/components/WallsBadges";
import IncomeArea from "@/components/Charts/IncomeArea";
import A11yTable from "@/components/A11yTable";
import EditInputsSheet from "@/components/EditInputsSheet";
import MeritDemeritList from "@/components/MeritDemeritList";
import useUrlState from "@/hooks/useUrlState";
import { simulate, type SimulationOutput } from "@/lib/calc";
import {
  DEFAULT_STATE,
  STORAGE_KEY,
  parseSimulationState,
  serializeSimulationState,
  type DashboardState
} from "@/lib/simulationState";
import { WALL_DETAILS, getWallDemerits, getWallMerits } from "@/lib/wallDetails";
import { formatCurrencyJPY } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const PROFESSIONAL_KEY = "tedorinavi:inputs:professional";

interface WallModalState {
  id: string;
  title: string;
  description: string;
  impact: string;
  action: string;
}

function computeInverseAlert(output: SimulationOutput) {
  if (output.annualIncome === 0) return false;
  return output.takeHome / output.annualIncome < 0.78;
}

interface MetricTileProps {
  label: string;
  value: string;
  description: string;
}

function MetricTile({ label, value, description }: MetricTileProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_96%,transparent)] px-4 py-5 shadow-none">
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]" aria-live="polite">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}

export default function AppDashboard() {
  const [inputs, setInputs, meta] = useUrlState<DashboardState>({
    defaults: DEFAULT_STATE,
    parse: parseSimulationState,
    serialize: serializeSimulationState,
    storageKey: STORAGE_KEY,
    debounceMs: 200
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<DashboardState>(inputs);
  const [wallModal, setWallModal] = useState<WallModalState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [professional, setProfessional] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PROFESSIONAL_KEY);
    if (stored === "1") {
      setProfessional(true);
    }
  }, []);

  useEffect(() => {
    if (!sheetOpen) {
      setDraft(inputs);
    }
  }, [inputs, sheetOpen]);

  const simulation = useMemo(() => simulate(inputs), [inputs]);
  const reachedIds = simulation.reached.map((wall) => wall.id);
  const merits = useMemo(() => getWallMerits(reachedIds), [reachedIds]);
  const demerits = useMemo(() => getWallDemerits(reachedIds), [reachedIds]);
  const showInverse = computeInverseAlert(simulation);

  const nextThreshold = simulation.next
    ? simulation.annualIncome + simulation.next.amount
    : null;
  const remainingHeadroom =
    nextThreshold !== null
      ? Math.max(0, Math.round(nextThreshold - inputs.currentYearIncome))
      : 0;
  const ytdProgress =
    nextThreshold !== null && nextThreshold > 0
      ? Math.min(100, Math.max(0, (inputs.currentYearIncome / nextThreshold) * 100))
      : null;

  const monthlyIncome = Math.max(0, inputs.monthlyIncome);
  const estimatedMonthsRaw = monthlyIncome > 0 ? inputs.currentYearIncome / monthlyIncome : 0;
  let completedMonths = Number.isFinite(estimatedMonthsRaw) ? Math.floor(estimatedMonthsRaw) : 0;
  if (inputs.currentYearIncome > 0 && completedMonths === 0) {
    completedMonths = 1;
  }
  const actualMonths = Math.max(0, Math.min(simulation.series.length, completedMonths));

  const handleSave = () => {
    setInputs(draft);
    setSheetOpen(false);
    setAnnouncement("入力内容を保存し、結果を更新しました");
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setDraft(inputs);
  };

  const handleProfessionalToggle = (next: boolean) => {
    setProfessional(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROFESSIONAL_KEY, next ? "1" : "0");
    }
  };

  const hydrated = meta.hydrated;

  useEffect(() => {
    if (!announcement) return;
    const timer = window.setTimeout(() => setAnnouncement(""), 4000);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  const handleWallSelect = (id: string) => {
    const detail = WALL_DETAILS[id];
    if (!detail) return;
    setWallModal({
      id,
      title: detail.title,
      description: detail.description,
      impact: detail.impact,
      action: detail.action
    });
  };

  const closeWallModal = () => setWallModal(null);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-secondary)]">
        初期化中…
      </main>
    );
  }

  return (
    <main className="bg-[var(--page-bg)] pb-20 pt-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 md:px-6">
        <section className="relative overflow-hidden rounded-[var(--radius-3xl)] border border-[color-mix(in_oklab,var(--color-border)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] px-6 py-8 shadow-sm md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary-400)_0%,transparent_70%)] opacity-35 md:opacity-40" aria-hidden="true" />
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-english">
                  Dashboard
                </p>
                <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">
                  今年の見通しと次の壁
                </h1>
                <p className="max-w-2xl text-sm text-[var(--color-text-secondary)]">
                  入力条件に基づいた年間のシミュレーションと、現在までの収入に対して次の壁までどれだけ余裕があるかを表示しています。
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
                <Button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="min-w-[120px] justify-center"
                >
                  入力を編集
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricTile
                label="年間見込み収入"
                value={formatCurrencyJPY(simulation.annualIncome)}
                description={`${inputs.months}ヶ月想定`}
              />
              <MetricTile
                label="推定手取り"
                value={formatCurrencyJPY(simulation.takeHome)}
                description="社会保険・税を控除後"
              />
              <MetricTile
                label="到達済みの壁"
                value={`${simulation.reached.length} 件`}
                description="壁バッジをタップで詳細"
              />
              <MetricTile
                label="今年ここまでの収入"
                value={formatCurrencyJPY(inputs.currentYearIncome)}
                description={
                  nextThreshold === null
                    ? "主要な壁をすべて越えています"
                    : remainingHeadroom <= 0
                      ? `${simulation.next?.label ?? "次の壁"} に到達しています`
                      : `あと ${formatCurrencyJPY(remainingHeadroom)} で ${simulation.next?.label ?? "次の壁"}`
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <NextWallMeter
            next={simulation.next}
            projectedAnnual={simulation.annualIncome}
            threshold={nextThreshold}
            actualYearIncome={inputs.currentYearIncome}
            remainingHeadroom={remainingHeadroom}
            progressPercent={ytdProgress}
          />

          <Card className="space-y-4 border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">到達した壁</h2>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {simulation.reached.length} 件
              </span>
            </div>
            <WallsBadges walls={simulation.reached} onSelect={handleWallSelect} />
          </Card>

          <Card className="space-y-4 border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-6 shadow-none">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">累積チャート</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                月次累積と壁の到達タイミングを縦ガイドで表示します。ツールチップは必要最小限です。
              </p>
            </div>
            <IncomeArea
              data={simulation.series}
              annualTotal={simulation.annualIncome}
              takeHomeTotal={simulation.takeHome}
              reachedThresholds={simulation.reached.map((wall) => wall.id)}
              actualMonths={actualMonths}
            />
            <A11yTable data={simulation.series} />
          </Card>

          {showInverse ? (
            <Alert tone="warning">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">逆転注意</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                社会保険料や税額で手取りが年収の 78% 未満になっています。勤務時間の調整や控除の活用を検討してください。
              </p>
            </Alert>
          ) : null}

          <MeritDemeritList merits={merits} demerits={demerits} />

          <Card className="space-y-4 border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-6 shadow-none">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">補足ノート</h2>
            <ul className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {simulation.notes.map((note) => (
                <li key={note}>・{note}</li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Button type="button" onClick={() => setSheetOpen(true)} className="rounded-full shadow-[var(--shadow-lg)]">
          編集
        </Button>
      </div>

      <EditInputsSheet
        open={sheetOpen}
        value={draft}
        professional={professional}
        onValueChange={(next) => setDraft(next)}
        onProfessionalToggle={handleProfessionalToggle}
        onModeChange={(mode) => setDraft((prev) => ({ ...prev, mode }))}
        onClose={handleCloseSheet}
        onSave={handleSave}
      />

      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <Dialog open={wallModal !== null} onOpenChange={(open) => !open && closeWallModal()}>
        <DialogContent className="max-w-xl gap-4">
          <DialogTitle>{wallModal?.title}</DialogTitle>
          <DialogDescription className="space-y-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <p>{wallModal?.description}</p>
            <p className="font-semibold text-[var(--color-text-primary)]">影響</p>
            <p>{wallModal?.impact}</p>
            <p className="font-semibold text-[var(--color-text-primary)]">次の一手</p>
            <p>{wallModal?.action}</p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </main>
  );
}
