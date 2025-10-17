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
}

export default function WallsBadges({ walls }: WallsBadgesProps) {
  if (walls.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        まだ壁には到達していません。月収を上げると必要な手続きが変わります。
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {walls.map((wall) => (
        <Badge key={wall.id} tone={toneMap[wall.id] ?? "muted"}>
          {wall.label}
        </Badge>
      ))}
    </div>
  );
}
