'use client';

import { useCallback, useMemo, useState } from "react";
import Header from "./components/Header";
import IncomeForm from "./components/IncomeForm";
import KpiCard from "./components/KpiCard";
import WallsBadges from "./components/WallsBadges";
import NextWallMeter from "./components/NextWallMeter";
import IncomeArea from "./components/Charts/IncomeArea";
import SankeyDemo from "./components/Charts/SankeyDemo";
import A11yTable from "./components/A11yTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Switch } from "./components/ui/switch";
import { Button } from "./components/ui/button";
import { Alert } from "./components/ui/alert";
import Badge from "./components/ui/badge";
import Separator from "./components/ui/separator";
import Card from "./components/ui/card";
import useUrlState from "@/hooks/useUrlState";
import { formatCompactJPY, formatCurrencyJPY } from "@/lib/format";
import { simulate, type SimulationInput, type SimulationOutput } from "@/lib/calc";

type SimulationState = SimulationInput & {
  professional: boolean;
  compare: boolean;
};

const DEFAULT_STATE: SimulationState = {
  monthlyIncome: 120_000,
  months: 12,
  firmSize: "<=50",
  weekly: ">=20",
  dependent: "none",
  mode: "individual",
  professional: false,
  compare: false
};

const parseState = (params: URLSearchParams, fallback: SimulationState): SimulationState => {
  const monthlyIncome = Number(params.get("income") ?? fallback.monthlyIncome);
  const months = Number(params.get("months") ?? fallback.months);
  const firmSize = (params.get("firm") ?? fallback.firmSize) as SimulationInput["firmSize"];
  const weekly = (params.get("weekly") ?? fallback.weekly) as SimulationInput["weekly"];
  const dependent = (params.get("dep") ?? fallback.dependent) as SimulationInput["dependent"];
  const mode = (params.get("mode") ?? fallback.mode) as SimulationInput["mode"];
  const professional = params.get("pro") === "1" ? true : fallback.professional;
  const compare = params.get("compare") === "1";

  return {
    monthlyIncome: Number.isFinite(monthlyIncome) ? monthlyIncome : fallback.monthlyIncome,
    months: Number.isFinite(months) ? months : fallback.months,
    firmSize,
    weekly,
    dependent,
    mode,
    professional,
    compare
  };
};

const serializeState = (state: SimulationState) => ({
  income: state.monthlyIncome,
  months: state.months,
  firm: state.firmSize,
  weekly: state.weekly,
  dep: state.dependent,
  mode: state.mode,
  pro: state.professional ? 1 : undefined,
  compare: state.compare ? 1 : undefined
});

function useComparisonSnapshot(initial: SimulationOutput | null) {
  const [snapshot, setSnapshot] = useState<SimulationOutput | null>(initial);

  const updateSnapshot = useCallback((output: SimulationOutput | null) => {
    setSnapshot(output);
  }, []);

  return { snapshot, updateSnapshot };
}

function getInsights(output: SimulationOutput): { merits: string[]; demerits: string[] } {
  const lastWall = output.reached.at(-1)?.id;
  const merits: string[] = [];
  const demerits: string[] = [];

  if (!lastWall) {
    merits.push("扶養内で働けるため社会保険料が発生していません。");
    demerits.push("将来の年金額が低くなる可能性があります。");
  } else if (lastWall === "SOCIAL_106" || lastWall === "SOCIAL_130") {
    merits.push("社会保険加入で医療・年金の保障が安定します。");
    demerits.push("手取りが一時的に減るため収支シミュレーションが必要です。");
  } else if (lastWall === "TAX_160") {
    merits.push("課税所得が増え、所得控除の活用余地が広がります。");
    demerits.push("源泉徴収や確定申告の負担が増えます。");
  } else {
    merits.push("年収が安定し、家計の計画が立てやすくなります。");
    demerits.push("配偶者控除が使えなくなる可能性があります。");
  }

  return { merits, demerits };
}

function ComparisonCards({
  current,
  snapshot
}: {
  current: SimulationOutput | null;
  snapshot: SimulationOutput | null;
}) {
  if (!current || !snapshot) return null;
  const diffIncome = current.annualIncome - snapshot.annualIncome;
  const diffTakeHome = current.takeHome - snapshot.takeHome;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">年収差分</h3>
        <p className="text-xl font-semibold text-[var(--color-text-primary)]">
          {formatCurrencyJPY(diffIncome)}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          現在 {formatCurrencyJPY(current.annualIncome)} / 比較{" "}
          {formatCurrencyJPY(snapshot.annualIncome)}
        </p>
      </Card>
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">手取り差分</h3>
        <p className="text-xl font-semibold text-[var(--color-text-primary)]">
          {formatCurrencyJPY(diffTakeHome)}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          現在 {formatCurrencyJPY(current.takeHome)} / 比較 {formatCurrencyJPY(snapshot.takeHome)}
        </p>
      </Card>
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">壁の違い</h3>
        <div className="flex flex-wrap gap-2">
          <div>
            <span className="text-xs text-[var(--color-text-muted)]">現在</span>
            <WallsBadges walls={current.reached} />
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div>
            <span className="text-xs text-[var(--color-text-muted)]">比較</span>
            <WallsBadges walls={snapshot.reached} />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Page() {
  const [state, setState] = useUrlState<SimulationState>({
    initialState: DEFAULT_STATE,
    parse: parseState,
    serialize: serializeState,
    debounceMs: 400
  });

  const simulation = useMemo(() => simulate(state), [state]);
  const { snapshot, updateSnapshot } = useComparisonSnapshot(null);

  const handleProfessionalToggle = (next: boolean) => {
    setState((prev) => ({ ...prev, professional: next }));
  };

  const handleStateChange = (next: SimulationInput) => {
    setState((prev) => ({ ...prev, ...next }));
  };

  const handleModeChange = (mode: SimulationInput["mode"]) => {
    setState((prev) => ({ ...prev, mode }));
  };

  const handleCompareToggle = (checked: boolean) => {
    setState((prev) => ({ ...prev, compare: checked }));
    if (checked) {
      updateSnapshot(simulation);
    } else {
      updateSnapshot(null);
    }
  };

  const handleAdjust = (delta: number) => {
    setState((prev) => ({
      ...prev,
      monthlyIncome: Math.max(0, prev.monthlyIncome + delta)
    }));
  };

  const { merits, demerits } = useMemo(() => getInsights(simulation), [simulation]);

  const reversal =
    simulation.annualIncome > 0 && simulation.takeHome / simulation.annualIncome < 0.78;

  return (
    <main className="space-y-8 bg-[var(--color-bg)] px-4 pb-16 pt-8 md:px-10">
      <Header />

      <Tabs value={state.mode} onValueChange={handleModeChange} className="w-full">
        <TabsList>
          <TabsTrigger value="individual">個人</TabsTrigger>
          <TabsTrigger value="spouse">配偶者</TabsTrigger>
          <TabsTrigger value="student">学生（19〜22歳）</TabsTrigger>
        </TabsList>
        <TabsContent value={state.mode}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <section className="space-y-6">
              <IncomeForm
                value={state}
                onChange={handleStateChange}
                professional={state.professional}
                onProfessionalToggle={handleProfessionalToggle}
              />
              <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-2">
                  <span>比較機能</span>
                  <Switch
                    checked={state.compare}
                    onCheckedChange={handleCompareToggle}
                    aria-label="現在の入力を比較用に保存"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => updateSnapshot(simulation)}
                  disabled={!state.compare}
                >
                  スナップショット更新
                </Button>
              </div>
              {state.compare ? (
                <ComparisonCards current={simulation} snapshot={snapshot} />
              ) : null}
            </section>

            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <KpiCard
                  label="年間見込み収入"
                  value={formatCurrencyJPY(simulation.annualIncome)}
                  hint="賞与は月平均換算で計算しています。"
                  tone="income"
                />
                <KpiCard
                  label="推定手取り"
                  value={formatCurrencyJPY(simulation.takeHome)}
                  hint="社会保険・税の概算を差し引いた金額です。"
                  tone="default"
                />
                <KpiCard
                  label="到達した壁"
                  value={`${simulation.reached.length}件`}
                  hint="バッジで到達状況を確認できます。"
                  tone={simulation.reached.length > 0 ? "expense" : "default"}
                />
              </div>

              <Card className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    現在到達した壁
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    直近の制度変更と自治体差異に注意してください。
                  </p>
                </div>
                <WallsBadges walls={simulation.reached} />
              </Card>

              <NextWallMeter
                next={simulation.next}
                currentAnnual={simulation.annualIncome}
                onAdjust={handleAdjust}
              />

              {reversal ? (
                <Alert tone="warning">
                  <p className="font-semibold">逆転現象の可能性</p>
                  <p>
                    社会保険料や税の増加により、手取りが大きく減少しています。勤務時間や支給方法を調整できるか検討し、必要に応じて勤務先へ相談しましょう。
                  </p>
                </Alert>
              ) : null}

              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    メリット / デメリット
                  </h3>
                  <Badge tone="muted">モード: {state.mode}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-income)]">メリット</h4>
                    <ul className="mt-2 space-y-2 text-sm text-[var(--color-text-secondary)]">
                      {merits.map((text) => (
                        <li key={text} className="flex gap-2">
                          <span aria-hidden="true">＋</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-expense)]">デメリット</h4>
                    <ul className="mt-2 space-y-2 text-sm text-[var(--color-text-secondary)]">
                      {demerits.map((text) => (
                        <li key={text} className="flex gap-2">
                          <span aria-hidden="true">−</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    月別推移
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    主要な壁にガイドラインを表示しています。各月の累積額はスクリーンリーダでも確認できます。
                  </p>
                </div>
                <IncomeArea data={simulation.series} />
                <A11yTable data={simulation.series} />
              </Card>

              <Card className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    参考ノート
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    実際の税率・保険料は制度により異なります。最新情報に差し替え可能な構造です。
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                  {simulation.notes.map((note) => (
                    <li key={note}>・{note}</li>
                  ))}
                </ul>
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    キャッシュフローイメージ（デモ）
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatCompactJPY(simulation.takeHome)} / 手取り
                  </span>
                </div>
                <SankeyDemo />
              </Card>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
