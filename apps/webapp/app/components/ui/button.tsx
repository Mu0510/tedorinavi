import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonVariants = "primary" | "outline" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariants;
}

const variantClass: Record<ButtonVariants, string> = {
  primary: "btn-primary",
  outline: "btn-outline",
  ghost:
    "btn-base bg-[color-mix(in oklab,var(--color-primary-500) 10%,transparent)] text-[var(--color-text-primary)]"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const merged = twMerge(clsx("btn-base", variantClass[variant], className));
    return <Comp className={merged} ref={ref as any} {...props} />;
  }
);

Button.displayName = "Button";

export default Button;
