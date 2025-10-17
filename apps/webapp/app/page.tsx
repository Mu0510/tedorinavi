'use client';

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import IncomeFormMini from "./components/IncomeFormMini";
import useUrlState from "@/hooks/useUrlState";
import { simulate } from "@/lib/calc";
import {
  DEFAULT_STATE,
  STORAGE_KEY,
  parseSimulationState,
  serializeSimulationState,
  type DashboardState
} from "@/lib/simulationState";
import Badge from "./components/ui/badge";
import { Button } from "./components/ui/button";

const WALL_TYPES = [
  "住民税 110万",
  "所得税 扶養 123万",
  "社会保険 106/130万",
  "特別控除 150/188/201.6万"
];

const faqItems: Array<{ question: string; answer: string }> = [
  {
    question: "自治体ごとに壁が違うって本当？",
    answer:
      "住民税の非課税枠は自治体によって差があります。本ツールでは一般的な 110 万円を採用していますが、お住まいの自治体サイトで最新情報を確認してください。"
  },
  {
    question: "学生アルバイトでも利用できますか？",
    answer:
      "はい。学生モードでは特定扶養控除の上限（188万円）を踏まえて試算します。学業とバランスを取りつつ、勤務時間を調整してください。"
  },
  {
    question: "配偶者特別控除の 201.6 万円とは？",
    answer:
      "配偶者の所得が 201.6 万円を超えると控除額がゼロになります。年末近くで働き方を調整する際は、月収だけでなく賞与や交通費も踏まえて判断しましょう。"
  },
  {
    question: "計算結果はサーバーに送信されますか？",
    answer: "いいえ。入力内容と結果はブラウザ内に保存され、外部には送信されません。"
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [inputs, setInputs] = useUrlState<DashboardState>({
    defaults: DEFAULT_STATE,
    parse: parseSimulationState,
    serialize: serializeSimulationState,
    storageKey: STORAGE_KEY,
    debounceMs: 200
  });

  const preview = useMemo(() => simulate(inputs), [inputs]);
  const nextPreview =
    preview.next !== undefined
      ? `次の壁まであと ${preview.next.amount.toLocaleString("ja-JP")} 円`
      : "すべての壁を超えています";

  const handleStart = () => {
    const serialized = serializeSimulationState(inputs);
    const params = new URLSearchParams();
    Object.entries(serialized).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    router.push(`/app?${params.toString()}`);
  };

  return (
    <main className="bg-[var(--page-bg)] pb-16 pt-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 md:px-6">
        <header className="relative overflow-hidden rounded-[var(--radius-3xl)] border border-[color-mix(in_oklab,var(--color-border)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] px-6 py-10 shadow-none md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary-400)_0%,transparent_70%)] opacity-35 md:opacity-40" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-english">
                Mirai Labs
              </p>
              <h1 className="text-balance text-4xl font-bold leading-tight text-[var(--color-text-primary)] md:text-5xl">
                年収の“壁”を、やさしく見通すダッシュボード
              </h1>
              <p className="max-w-3xl text-pretty text-base text-[var(--color-text-secondary)] md:text-lg">
                月収・年収・勤務条件を入力すると、今年の想定と次にぶつかる壁までの余白をすぐに確認できます。URL に保存されるので、そのまま共有も可能です。
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild>
                  <Link href="/app?demo=1">デモで試算を見る</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="#methodology">しくみを見る</Link>
                </Button>
              </div>
            </div>
            <div className="hidden flex-1 md:flex" />
          </div>
        </header>

        <section className="grid gap-12 rounded-[var(--radius-3xl)] bg-[var(--surface-bg)] px-6 py-10 shadow-sm md:grid-cols-[minmax(0,1fr)]">
          <IncomeFormMini
            value={inputs}
            onChange={(next) => setInputs(next)}
            onStart={handleStart}
          />
        </section>

        <section className="space-y-6 rounded-[var(--radius-3xl)] bg-[var(--surface-bg)] px-6 py-10 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">壁の種類</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            到達順に壁バッジを表示します。数字を把握しておくことで、手取りの急減を先に予測できます。
          </p>
          <div className="flex flex-wrap gap-3">
            {WALL_TYPES.map((label) => (
              <Badge key={label} tone="muted">
                {label}
              </Badge>
            ))}
          </div>
        </section>

        <section id="methodology" className="space-y-6 rounded-[var(--radius-3xl)] bg-[var(--surface-bg)] px-6 py-10 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">根拠と更新情報</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              最終更新日: 2025年10月10日 / 制度改定（2024年・2025年）を反映済み
            </p>
          </div>
          <ul className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <li>
              ・住民税の非課税枠:{" "}
              <Link
                href="https://www.soumu.go.jp/main_content/000850091.pdf"
                className="underline decoration-dotted underline-offset-4"
              >
                総務省 住民税制度概要
              </Link>
            </li>
            <li>
              ・社会保険の適用拡大:{" "}
              <Link
                href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000132313.html"
                className="underline decoration-dotted underline-offset-4"
              >
                厚生労働省 短時間労働者の適用拡大
              </Link>
            </li>
            <li>
              ・配偶者（特別）控除:{" "}
              <Link
                href="https://www.nta.go.jp/publication/pamph/gensen/fuyou2023/pdf/01.pdf"
                className="underline decoration-dotted underline-offset-4"
              >
                国税庁 所得税の控除制度
              </Link>
            </li>
          </ul>
          <p className="text-sm text-[var(--color-text-muted)]">
            計算はすべてブラウザ内で行われ、入力内容はローカルの storage にのみ保持されます。
          </p>
        </section>

        <section className="space-y-6 rounded-[var(--radius-3xl)] bg-[var(--surface-bg)] px-6 py-10 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">FAQ</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="space-y-2 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-5"
              >
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {item.question}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
