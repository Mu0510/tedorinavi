'use client';

import * as React from "react";
import { clsx } from "clsx";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx(
        "h-3 w-full overflow-hidden rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--color-border)_80%,transparent)]",
        className
      )}
      {...props}
    >
      <div
        style={{ width: `${percentage}%` }}
        className="h-full rounded-[var(--radius-md)] bg-[var(--color-income)] transition-[width] duration-200 ease-in-out"
      />
    </div>
  );
}

export default Progress;
