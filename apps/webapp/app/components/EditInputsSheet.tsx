'use client';

import { useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { clsx } from "clsx";
import type { SimulationInput } from "@/lib/calc";
import type { DashboardState } from "@/lib/simulationState";
import IncomeFormFields from "./IncomeFormFields";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export interface EditInputsSheetProps {
  open: boolean;
  value: DashboardState;
  professional: boolean;
  onValueChange: (next: DashboardState) => void;
  onProfessionalToggle: (next: boolean) => void;
  onModeChange: (mode: SimulationInput["mode"]) => void;
  onClose: () => void;
  onSave: () => void;
}

const sheetClass =
  "fixed inset-x-0 bottom-0 z-50 h-[min(85vh,640px)] w-full translate-y-0 rounded-t-[var(--radius-2xl)] bg-[var(--color-panel)] shadow-[var(--shadow-lg)] focus-visible:outline-none md:bottom-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:w-[min(640px,90vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-3xl)]";

export default function EditInputsSheet({
  open,
  value,
  professional,
  onValueChange,
  onProfessionalToggle,
  onModeChange,
  onClose,
  onSave
}: EditInputsSheetProps) {
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current) {
      window.setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 60);
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[color-mix(in_oklab,var(--color-bg)_55%,black)]/75 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          className={clsx(
            sheetClass,
            "overflow-y-auto px-6 pb-6 pt-6 md:px-7 md:pt-10",
            "data-[state=open]:animate-slide-up md:data-[state=open]:animate-fade-in",
            "data-[state=closed]:animate-slide-down md:data-[state=closed]:animate-fade-out"
          )}
          aria-labelledby="edit-inputs-heading"
          aria-describedby="input-guidance"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-[var(--color-text-muted)] transition hover:bg-[color-mix(in_oklab,var(--color-border)_35%,transparent)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-panel)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">閉じる</span>
          </button>

          <div className="flex flex-col gap-6 pb-8">
            <Tabs
              value={value.mode}
              onValueChange={(mode) => onModeChange(mode as SimulationInput["mode"])}
              className="w-full"
            >
              <TabsList className="flex w-full gap-2 overflow-x-auto rounded-[var(--radius-xl)] border border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_90%,transparent)] p-2 text-sm font-medium">
                <TabsTrigger value="individual" className="flex-1">
                  個人
                </TabsTrigger>
                <TabsTrigger value="spouse" className="flex-1">
                  配偶者
                </TabsTrigger>
                <TabsTrigger value="student" className="flex-1">
                  学生
                </TabsTrigger>
              </TabsList>
              <TabsContent value={value.mode} className="mt-4">
                <IncomeFormFields
                  value={value}
                  onChange={onValueChange}
                  professional={professional}
                  onProfessionalToggle={onProfessionalToggle}
                  focusRef={firstFieldRef}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="sticky bottom-0 left-0 right-0 mt-8 flex flex-col gap-3 border-t border-[color-mix(in_oklab,var(--color-border)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-panel)_96%,transparent)] px-3 py-4 md:px-0 md:py-6">
            <p className="text-xs text-[var(--color-text-muted)]">
              保存すると計算結果が更新され、URL とブラウザに状態が記録されます。
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="sm:w-auto"
              >
                キャンセル
              </Button>
              <Button
                type="button"
                className="sm:w-auto"
                onClick={onSave}
              >
                保存
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
