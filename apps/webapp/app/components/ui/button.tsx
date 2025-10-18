'use client';

import * as React from "react";
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
    "btn-base bg-[color-mix(in_oklab,var(--color-primary-500)_10%,transparent)] text-[var(--color-text-primary)]"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild = false, children, ...props }, ref) => {
    const merged = twMerge(clsx("btn-base", variantClass[variant], className));

    if (asChild && React.isValidElement(children)) {
      const child = React.Children.only(children) as React.ReactElement;
      const childClassName = (child.props as { className?: string }).className;

      return React.cloneElement(child, {
        ...props,
        className: twMerge(childClassName, merged),
        ref
      });
    }

    return (
      <button className={merged} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
