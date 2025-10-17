import { describe, expect, it } from "vitest";
import { RESIDENT_110, simulate, type SimulationInput, TAX_160 } from "@/lib/calc";
import {
  DEFAULT_STATE,
  parseSimulationState,
  serializeSimulationState,
  type DashboardState
} from "@/lib/simulationState";

const baseInput: SimulationInput = {
  monthlyIncome: 120_000,
  months: 12,
  firmSize: "<=50",
  weekly: "<20",
  dependent: "none",
  mode: "individual"
};

describe("simulate", () => {
  it("keeps walls empty around the resident-tax boundary", () => {
    const input: SimulationInput = { ...baseInput, monthlyIncome: 90_000 };
    const result = simulate(input);
    expect(result.annualIncome).toBe(1_080_000);
    expect(result.reached).toHaveLength(0);
    expect(result.next?.id).toBe("RESIDENT_110");
    expect(result.next?.amount).toBe(RESIDENT_110 - result.annualIncome);
  });

  it("flags TAX_160 wall when threshold exceeded", () => {
    const input: SimulationInput = {
      ...baseInput,
      monthlyIncome: 140_000,
      weekly: ">=20",
      firmSize: ">=51"
    };
    const result = simulate(input);
    expect(result.annualIncome).toBe(1_680_000);
    const ids = result.reached.map((wall) => wall.id);
    expect(ids).toContain("TAX_160");
    expect(result.takeHome).toBeGreaterThan(0);
  });

  it("triggers SOCIAL_106 wall for large firms with weekly >=20h", () => {
    const input: SimulationInput = {
      ...baseInput,
      monthlyIncome: 110_000,
      firmSize: ">=51",
      weekly: ">=20"
    };
    const result = simulate(input);
    expect(result.annualIncome).toBe(1_320_000);
    const ids = result.reached.map((wall) => wall.id);
    expect(ids).toContain("SOCIAL_106");
    expect(result.takeHome).toBeLessThan(result.annualIncome);
    expect(result.notes.join(" ")).toContain("社会保険料率");
  });

});

describe("simulation state helpers", () => {
  it("serializes and parses dashboard extras", () => {
    const initial: DashboardState = {
      ...DEFAULT_STATE,
      monthlyIncome: 180_000,
      months: 10,
      currentYearIncome: 920_000,
      incomeEntry: "annual"
    };

    const serialized = serializeSimulationState(initial);
    expect(serialized.ytd).toBe(920000);
    expect(serialized.entry).toBe("annual");

    const params = new URLSearchParams();
    Object.entries(serialized).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });

    const parsed = parseSimulationState(params, DEFAULT_STATE);
    expect(parsed.monthlyIncome).toBe(initial.monthlyIncome);
    expect(parsed.currentYearIncome).toBe(920000);
    expect(parsed.incomeEntry).toBe("annual");
  });
});
