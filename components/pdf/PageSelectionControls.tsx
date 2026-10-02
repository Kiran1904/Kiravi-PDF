"use client";

import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { usePageSelection } from "./usePageSelection";

type Selection = ReturnType<typeof usePageSelection>;

export function PageSelectionControls({
  selection,
  pageCount,
  label = "Pages to include",
  disabled = false,
}: {
  selection: Selection;
  pageCount: number;
  label?: string;
  disabled?: boolean;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold" aria-live="polite">
          {selection.selected.size} of {pageCount} {pageCount === 1 ? "page" : "pages"} selected
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={selection.selectAll} disabled={disabled}>
            All
          </Button>
          <Button variant="outline" size="sm" onClick={selection.clear} disabled={disabled}>
            None
          </Button>
          <Button variant="outline" size="sm" onClick={selection.invert} disabled={disabled}>
            Invert
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          inputMode="numeric"
          placeholder="e.g. 1-3, 7, 10-12"
          value={selection.rangeText}
          onChange={(event) => selection.setRange(event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(selection.rangeError)}
          aria-describedby={selection.rangeError ? errorId : undefined}
          className="h-10 max-w-sm"
        />
        {selection.rangeError && (
          <p id={errorId} className="text-destructive text-xs">
            {selection.rangeError}
          </p>
        )}
      </div>
    </div>
  );
}
