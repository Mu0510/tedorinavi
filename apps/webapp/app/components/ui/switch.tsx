'use client';

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";
import { clsx } from "clsx";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={clsx("switch-root", className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className="switch-thumb data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]" />
  </SwitchPrimitive.Root>
));

Switch.displayName = SwitchPrimitive.Root.displayName;
