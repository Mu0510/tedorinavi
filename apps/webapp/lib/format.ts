const currency = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

const compact = new Intl.NumberFormat("ja-JP", {
  notation: "compact",
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat("ja-JP", {
  style: "percent",
  maximumFractionDigits: 1
});

export function formatCurrencyJPY(value: number) {
  return currency.format(Math.round(value));
}

export function formatCompactJPY(value: number) {
  return compact.format(Math.round(value));
}

export function formatPercent(value: number) {
  return percent.format(value);
}
