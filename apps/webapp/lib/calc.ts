export const RESIDENT_110 = 1_100_000;
export const TAX_FUYOU_123 = 1_230_000;
export const SOCIAL_106 = 1_060_000;
export const SOCIAL_130 = 1_300_000;
export const SPOUSE_150 = 1_500_000;
export const TAX_160 = 1_600_000;
export const STUDENT_188 = 1_880_000;
export const SPOUSE_2016 = 2_016_000;

export type SimulationInput = {
  monthlyIncome: number;
  months: number;
  firmSize: "<=50" | ">=51";
  weekly: "<20" | ">=20";
  dependent: "none" | "spouse" | "parent";
  mode: "individual" | "spouse" | "student";
};

export type SimulationOutput = {
  annualIncome: number;
  takeHome: number;
  reached: Array<{ id: string; label: string }>;
  next?: { id: string; label: string; amount: number };
  series: Array<{ month: number; cumulative: number }>;
  notes: string[];
};

type WallDefinition = {
  id: string;
  label: string;
  threshold: number;
  modes?: Array<SimulationInput["mode"]>;
};

const WALLS: WallDefinition[] = [
  { id: "SOCIAL_106", label: "社保加入（特定適用）106万円", threshold: SOCIAL_106 },
  { id: "RESIDENT_110", label: "住民税（参考）110万円", threshold: RESIDENT_110 },
  { id: "TAX_FUYOU_123", label: "配偶者控除（住民税）123万円", threshold: TAX_FUYOU_123 },
  { id: "SOCIAL_130", label: "国民年金・健康保険 130万円", threshold: SOCIAL_130 },
  { id: "SPOUSE_150", label: "配偶者控除 150万円", threshold: SPOUSE_150, modes: ["spouse"] },
  { id: "TAX_160", label: "所得税（概算）160万円", threshold: TAX_160 },
  { id: "STUDENT_188", label: "学生特例控除 188万円", threshold: STUDENT_188, modes: ["student"] },
  { id: "SPOUSE_2016", label: "配偶者特別控除終了 201.6万円", threshold: SPOUSE_2016, modes: ["spouse"] }
];

const numberFormatter = new Intl.NumberFormat("ja-JP");

function evaluateWalls(input: SimulationInput, annualIncome: number) {
  const reached: SimulationOutput["reached"] = [];
  let next: SimulationOutput["next"];

  for (const wall of WALLS) {
    if (wall.modes && !wall.modes.includes(input.mode)) {
      continue;
    }

    if (annualIncome >= wall.threshold) {
      reached.push({
        id: wall.id,
        label: wall.label
      });
    } else if (!next) {
      next = {
        id: wall.id,
        label: wall.label,
        amount: Math.max(0, wall.threshold - annualIncome)
      };
    }
  }

  return { reached, next };
}

function buildSeries(monthlyIncome: number, months: number) {
  const cappedMonths = Math.min(Math.max(months, 1), 12);
  return Array.from({ length: cappedMonths }, (_, index) => {
    const month = index + 1;
    return { month, cumulative: monthlyIncome * month };
  });
}

function socialInsuranceRate(input: SimulationInput, annualIncome: number) {
  if (annualIncome <= 0) return 0;
  if (input.firmSize === ">=51" && input.weekly === ">=20" && annualIncome >= SOCIAL_106) {
    return 0.14;
  }
  if (annualIncome >= SOCIAL_130) {
    return 0.18;
  }
  return 0;
}

function residentTaxRate(annualIncome: number) {
  return annualIncome >= RESIDENT_110 ? 0.1 : 0;
}

function incomeTaxRate(annualIncome: number) {
  return annualIncome >= TAX_160 ? 0.05 : 0;
}

function dependentAdjustment(input: SimulationInput) {
  if (input.mode === "spouse" && input.dependent === "spouse") {
    return -0.02;
  }
  if (input.mode === "student") {
    return -0.01;
  }
  return 0;
}

export function simulate(input: SimulationInput): SimulationOutput {
  const monthlyIncome = Math.max(0, input.monthlyIncome);
  const months = Math.min(Math.max(input.months, 1), 12);
  const annualIncome = monthlyIncome * months;

  const socialRate = socialInsuranceRate(input, annualIncome);
  const residentRate = residentTaxRate(annualIncome);
  const incomeRate = incomeTaxRate(annualIncome);
  const dependentRate = dependentAdjustment(input);

  const finalRate = Math.max(0, socialRate + residentRate + incomeRate + dependentRate);
  const takeHome = Math.max(0, Math.round(annualIncome * (1 - finalRate)));

  const { reached, next } = evaluateWalls(input, annualIncome);
  const series = buildSeries(monthlyIncome, months);

  const notes: string[] = [];
  if (socialRate > 0) {
    notes.push("社会保険料率は仮に 14% / 18% を適用しています（実際の料率は地域で異なります）。");
  }
  if (residentRate > 0) {
    notes.push("住民税は概算で 10% を計算しています。自治体により免税点が違う場合があります。");
  } else {
    notes.push("住民税はまだ発生しません。自治体の非課税枠を確認しましょう。");
  }
  if (incomeRate > 0) {
    notes.push("所得税は概算で 5% を適用しました。扶養や控除で変動します。");
  }
  if (input.mode === "student") {
    notes.push("学生区分は特定扶養控除の範囲を表示します。アルバイト時間の調整に注意してください。");
  }

  return {
    annualIncome,
    takeHome,
    reached,
    next,
    series,
    notes
  };
}

export function formatWallAmount(amount: number) {
  return numberFormatter.format(amount);
}
