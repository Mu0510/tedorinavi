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
      <div className="space-y-2 rounded-[var(--radius-lg)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">年収差分</h3>
        <p className="text-xl font-semibold text-[var(--color-text-primary)]">
          {formatCurrencyJPY(diffIncome)}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          現在 {formatCurrencyJPY(current.annualIncome)} / 比較{" "}
          {formatCurrencyJPY(snapshot.annualIncome)}
        </p>
      </div>
      <div className="space-y-2 rounded-[var(--radius-lg)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
          手取り差分
        </h3>
        <p className="text-xl font-semibold text-[var(--color-text-primary)]">
          {formatCurrencyJPY(diffTakeHome)}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          現在 {formatCurrencyJPY(current.takeHome)} / 比較 {formatCurrencyJPY(snapshot.takeHome)}
        </p>
      </div>
      <div className="space-y-2 rounded-[var(--radius-lg)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-4">
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
      </div>
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
    <main className="bg-[var(--color-bg)] pb-16 pt-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-10 lg:px-12">
        <Header />

        <Tabs value={state.mode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="w-full justify-start gap-2 overflow-x-auto rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_92%,transparent)] p-2">
            <TabsTrigger value="individual" className="w-full sm:w-auto">
              個人
            </TabsTrigger>
            <TabsTrigger value="spouse" className="w-full sm:w-auto">
              配偶者
            </TabsTrigger>
            <TabsTrigger value="student" className="w-full sm:w-auto">
              学生（19〜22歳）
            </TabsTrigger>
          </TabsList>
          <TabsContent value={state.mode}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              <section className="space-y-6">
                <Card className="space-y-6 border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] shadow-none">
                  <IncomeForm
                    value={state}
                    onChange={handleStateChange}
                    professional={state.professional}
                    onProfessionalToggle={handleProfessionalToggle}
                  />
                </Card>

                <Card className="space-y-5 border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] shadow-none">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                        比較スナップショット
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        現在の入力を保存して、年収・手取りの差分を一目で比較できます。
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                      <Switch
                        checked={state.compare}
                        onCheckedChange={handleCompareToggle}
                        aria-label="現在の入力を比較用に保存"
                      />
                      <span className="font-medium">
                        {state.compare ? "比較モード ON" : "比較モード OFF"}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      スナップショットを更新すると、最新の入力で差分が再計算されます。
                    </span>
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
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      モードをオンにすると、保存した条件との差をカードで表示します。
                    </p>
                  )}
                </Card>
              </section>

              <section className="space-y-8">
                <div className="space-y-6 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-6 shadow-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      主要指標
                    </h2>
                    <Badge tone="muted">モード: {state.mode}</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                    />
                    <KpiCard
                      label="到達した壁"
                      value={`${simulation.reached.length}件`}
                      hint="バッジで到達状況を確認できます。"
                      tone={simulation.reached.length > 0 ? "expense" : "default"}
                    />
                  </div>
                </div>

                <div className="space-y-6 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-6 shadow-none">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      到達状況と次のアクション
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      直近の制度変更と自治体差異に注意しながら、次に備えましょう。
                    </p>
                  </div>
                  <WallsBadges walls={simulation.reached} />
                  <Separator />
                  <NextWallMeter
                    next={simulation.next}
                    currentAnnual={simulation.annualIncome}
                    onAdjust={handleAdjust}
                    className="border-none bg-transparent p-0"
                  />
                  {reversal ? (
                    <Alert tone="warning" className="bg-[color-mix(in_oklab,var(--processing-light)_55%,var(--color-panel))]">
                      <p className="font-semibold">逆転現象の可能性</p>
                      <p>
                        社会保険料や税の増加により手取りが減少しています。勤務時間や支給方法を調整できるか確認し、必要に応じて勤務先へ相談しましょう。
                      </p>
                    </Alert>
                  ) : null}
                </div>

                <div className="space-y-6 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-6 shadow-none">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    メリット / デメリット
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
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
                </div>

                <div className="space-y-6 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-6 shadow-none">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      月別推移
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      主要な壁にガイドラインを表示しています。各月の累積額はスクリーンリーダでも確認できます。
                    </p>
                  </div>
                  <IncomeArea data={simulation.series} />
                  <A11yTable data={simulation.series} />
                </div>

                <div className="space-y-6 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-6 shadow-none">
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        参考ノート
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        実際の税率・保険料は制度により異なります。最新情報に差し替え可能な構造です。
                      </p>
                      <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                        {simulation.notes.map((note) => (
                          <li key={note}>・{note}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_96%,transparent)] p-4">
                      <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                        <span>キャッシュフローイメージ（デモ）</span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {formatCompactJPY(simulation.takeHome)} / 手取り
                        </span>
                      </div>
                      <SankeyDemo />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
