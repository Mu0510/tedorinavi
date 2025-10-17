import { ResponsiveContainer, Sankey } from "recharts";
import { sankeyColors } from "mirai-theme";

const data = {
  nodes: [
    { name: "収入" },
    { name: "手取り" },
    { name: "控除・保険" }
  ],
  links: [
    { source: 0, target: 1, value: 65, color: sankeyColors.income },
    { source: 0, target: 2, value: 35, color: sankeyColors.expense }
  ]
};

export default function SankeyDemo() {
  return (
    <div className="h-72 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <h3 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
        サンプルフロー（色トークンの参照例）
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          nodePadding={24}
          node={{
            stroke: "var(--color-border)",
            strokeWidth: 1,
            fill: "var(--color-panel)"
          }}
          link={{
            strokeOpacity: 0.4
          }}
        />
      </ResponsiveContainer>
    </div>
  );
}
