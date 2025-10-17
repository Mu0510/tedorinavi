import Badge from "./ui/badge";

const toneMap: Record<string, "income" | "expense" | "muted"> = {
  RESIDENT_110: "muted",
  TAX_FUYOU_123: "muted",
  SOCIAL_106: "income",
  SOCIAL_130: "income",
  SPOUSE_150: "income",
  TAX_160: "expense",
  STUDENT_188: "expense",
  SPOUSE_2016: "expense"
};

export interface WallsBadgesProps {
  walls: Array<{ id: string; label: string }>;
  onSelect?: (id: string) => void;
}

export default function WallsBadges({ walls, onSelect }: WallsBadgesProps) {
  if (walls.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        まだ壁には到達していません。月収を上げると必要な手続きが変わります。
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {walls.map((wall) => {
        if (!onSelect) {
          return (
            <Badge key={wall.id} tone={toneMap[wall.id] ?? "muted"}>
              {wall.label}
            </Badge>
          );
        }

        return (
          <button
            key={wall.id}
            type="button"
            onClick={() => onSelect(wall.id)}
            className="rounded-[var(--radius-full)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-panel)]"
            aria-label={`${wall.label} の詳細を表示`}
          >
            <Badge tone={toneMap[wall.id] ?? "muted"}>{wall.label}</Badge>
          </button>
        );
      })}
    </div>
  );
}
