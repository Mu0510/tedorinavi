'use client';

import * as React from "react";
import { clsx } from "clsx";
import { AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "warning" | "info";
}

const toneIcon: Record<NonNullable<AlertProps["tone"]>, React.ReactNode> = {
  warning: <AlertTriangle className="h-5 w-5 text-[var(--processing-error)]" aria-hidden="true" />,
  info: <AlertTriangle className="h-5 w-5 text-[var(--color-income)]" aria-hidden="true" />
};

const toneClass: Record<NonNullable<AlertProps["tone"]>, string> = {
  warning: "alert",
  info: "alert bg-[color-mix(in oklab,var(--cash-balance-light) 80%,var(--color-panel))] border-[var(--color-income)]"
};

export function Alert({ className, tone = "warning", children, ...props }: AlertProps) {
  return (
    <div className={clsx(toneClass[tone], className)} role="alert" {...props}>
      <div className="pt-1">{toneIcon[tone]}</div>
      <div className="space-y-1 text-sm text-[var(--color-text-primary)]">{children}</div>
    </div>
  );
}

export default Alert;
