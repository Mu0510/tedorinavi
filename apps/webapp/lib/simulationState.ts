import type { SimulationInput } from "./calc";

export const STORAGE_KEY = "tedorinavi:inputs";

export interface DashboardState extends SimulationInput {
  currentYearIncome: number;
  incomeEntry: "monthly" | "annual";
}

export const DEMO_INPUT: SimulationInput = {
  monthlyIncome: 140_000,
  months: 12,
  weekly: ">=20",
  firmSize: "<=50",
  dependent: "none",
  mode: "individual"
};

export const DEFAULT_STATE: DashboardState = {
  ...DEMO_INPUT,
  currentYearIncome: 0,
  incomeEntry: "monthly"
};

const MONTH_MIN = 1;
const MONTH_MAX = 12;
const INCOME_MIN = 0;
const INCOME_MAX = 360_000;

function clampIncome(value: number) {
  if (Number.isNaN(value)) return DEFAULT_STATE.monthlyIncome;
  return Math.min(Math.max(value, INCOME_MIN), INCOME_MAX);
}

function clampMonths(value: number) {
  if (Number.isNaN(value)) return DEFAULT_STATE.months;
  return Math.min(Math.max(value, MONTH_MIN), MONTH_MAX);
}

export function parseSimulationState(
  params: URLSearchParams,
  current: DashboardState
): DashboardState {
  const useDemo = params.get("demo") === "1";
  const base = useDemo ? DEFAULT_STATE : current;

  const monthlyIncome = params.has("income")
    ? clampIncome(Number(params.get("income")))
    : base.monthlyIncome;
  const months = params.has("months")
    ? clampMonths(Number(params.get("months")))
    : base.months;
  const firmSize = (params.get("firm") as SimulationInput["firmSize"]) ?? base.firmSize;
  const weekly = (params.get("weekly") as SimulationInput["weekly"]) ?? base.weekly;
  const dependent = (params.get("dep") as SimulationInput["dependent"]) ?? base.dependent;
  const mode = (params.get("mode") as SimulationInput["mode"]) ?? base.mode;
  const currentYearIncome = params.has("ytd")
    ? Math.max(0, Number(params.get("ytd")))
    : base.currentYearIncome;
  const incomeEntry = (params.get("entry") as DashboardState["incomeEntry"]) ?? base.incomeEntry;

  return {
    monthlyIncome,
    months,
    firmSize: firmSize === "<=50" || firmSize === ">=51" ? firmSize : base.firmSize,
    weekly: weekly === "<20" || weekly === ">=20" ? weekly : base.weekly,
    dependent: dependent === "spouse" || dependent === "parent" || dependent === "none"
      ? dependent
      : base.dependent,
    mode: mode === "individual" || mode === "spouse" || mode === "student" ? mode : base.mode,
    currentYearIncome: Number.isNaN(currentYearIncome) ? base.currentYearIncome : currentYearIncome,
    incomeEntry: incomeEntry === "annual" || incomeEntry === "monthly" ? incomeEntry : base.incomeEntry
  };
}

export function serializeSimulationState(state: DashboardState) {
  return {
    income: state.monthlyIncome,
    months: state.months,
    firm: state.firmSize,
    weekly: state.weekly,
    dep: state.dependent,
    mode: state.mode,
    ytd: state.currentYearIncome,
    entry: state.incomeEntry
  };
}
