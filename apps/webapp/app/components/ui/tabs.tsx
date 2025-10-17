import * as TabsPrimitive from "@radix-ui/react-tabs";
import { clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={twMerge(
      clsx(
        "inline-flex items-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in oklab,var(--color-panel) 80%,transparent)] p-1 text-sm"
      ),
      className
    )}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={twMerge(
      clsx(
        "inline-flex min-w-[80px] items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition data-[state=active]:bg-[var(--color-panel)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
      ),
      className
    )}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={twMerge(
      clsx("mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"),
      className
    )}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;
