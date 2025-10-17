export const colors = {
  primary: {
    400: "#30BCA7",
    500: "#2AA693",
    600: "#238778"
  },
  danger: {
    500: "#EF4444",
    600: "#DC2626"
  },
  text: {
    light: "#000000",
    secondary: "#85868E",
    muted: "#6B7280",
    dark: "#FFFFFF"
  },
  dark: {
    bg: "#0B1020",
    panel: "#141A2D",
    border: "#263258",
    hover: "#1D2745",
    input: "#0F1527",
    accent: "#5B8CFF",
    muted: "#9AA4BF"
  },
  sankey: {
    total: "#4F566B",
    income: "#2AA693",
    incomeLight: "#E5F7F4",
    expense: "#DC2626",
    expenseLight: "#FBE2E7",
    carryoverLight: "#E5E7EB",
    text: "#1F2937"
  }
} as const;

export const sankeyColors = colors.sankey;

export type MiraiColors = typeof colors;

export default colors;
