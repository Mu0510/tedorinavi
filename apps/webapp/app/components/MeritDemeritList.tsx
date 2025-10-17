'use client';

export interface MeritDemeritListProps {
  merits: string[];
  demerits: string[];
}

export default function MeritDemeritList({ merits, demerits }: MeritDemeritListProps) {
  const hasContent = merits.length > 0 || demerits.length > 0;

  if (!hasContent) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        まだ到達した壁がないため、メリット・デメリットの一覧は表示されません。
      </p>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_94%,transparent)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        到達済みの壁で想定されるメリット / デメリット
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--color-income)]">メリット</h4>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {merits.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">＋</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--color-expense)]">デメリット</h4>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {demerits.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">−</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
