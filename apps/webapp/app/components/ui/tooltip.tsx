'use client';

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  className,
  ...props
}: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={clsx("tooltip-content", className)}
      sideOffset={6}
      {...props}
    />
  </TooltipPrimitive.Portal>
);

TooltipContent.displayName = "TooltipContent";
