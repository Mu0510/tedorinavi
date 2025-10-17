'use client';

import * as React from "react";
import { clsx } from "clsx";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={clsx("card", className)} {...props} />;
}

export default Card;
