import Link from "next/link";
import { Github } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_65%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_90%,transparent)] px-6 py-5 shadow-none">
      <div className="flex flex-col">
        <span className="text-sm uppercase tracking-wide text-[var(--color-text-muted)] font-english">
          Mirai Labs
        </span>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          年収の壁シミュレーター
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          月収と条件を入力して、到達した壁と次のアクションを確認しましょう。
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" className="font-english">
          <Link
            href="https://github.com/mirai-labs/tedorinavi"
            aria-label="GitHub リポジトリを開く"
          >
            <Github className="mr-2 h-4 w-4" aria-hidden="true" />
            GitHub
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
