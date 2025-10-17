'use client';

import * as React from "react";
import { clsx } from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "income" | "expense" | "muted";
}

const toneClass: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "badge",
  income: "badge-income",
  expense: "badge-expense",
  muted: "badge bg-[color-mix(in_oklab,var(--color-text-muted)_16%,transparent)] text-[var(--color-text-primary)]"
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return <span className={clsx(toneClass[tone], className)} {...props} />;
}

export default Badge;
