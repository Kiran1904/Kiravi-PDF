"use client";

import { FileText, X } from "lucide-react";

import { formatBytes } from "@/lib/files/format";

/** The compact "this is your file" row shown once a single-file tool has its input. */
export function SingleFileRow({
  file,
  meta,
  onRemove,
  disabled = false,
}: {
  file: File;
  meta?: React.ReactNode;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border p-3">
      <span className="bg-pdf/10 text-pdf grid size-10 shrink-0 place-items-center rounded-lg">
        <FileText aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={file.name}>
          {file.name}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatBytes(file.size)}
          {meta ? <> · {meta}</> : null}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring grid size-9 shrink-0 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
      >
        <X aria-hidden className="size-4" />
        <span className="sr-only">Remove {file.name}</span>
      </button>
    </div>
  );
}
