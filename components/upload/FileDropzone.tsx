"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A real <button> wrapping a hidden file input: drag-and-drop is an
 * enhancement, so the whole flow works from the keyboard.
 */
export function FileDropzone({
  accept,
  acceptLabel,
  multiple,
  maxLabel,
  disabled = false,
  compact = false,
  onFiles,
}: {
  accept: string;
  acceptLabel: string;
  multiple: boolean;
  /** e.g. "Up to 100 MB per file" */
  maxLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  onFiles: (files: FileList | File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer?.files;
    if (dropped && dropped.length > 0) onFiles(dropped);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const chosen = event.target.files;
          if (chosen && chosen.length > 0) onFiles(chosen);
          // Allows picking the same file again after a clear.
          event.target.value = "";
        }}
        aria-label={multiple ? `Choose files — ${acceptLabel}` : `Choose a file — ${acceptLabel}`}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors",
          "focus-visible:ring-brand/40 focus-visible:border-brand focus-visible:ring-4 focus-visible:outline-none",
          compact ? "gap-2 px-6 py-8" : "gap-3 px-6 py-14",
          disabled
            ? "cursor-not-allowed opacity-60"
            : dragging
              ? "border-brand bg-brand-muted"
              : "hover:border-brand/60 hover:bg-muted/50 border-border bg-muted/20",
        )}
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-colors",
            compact ? "size-10" : "size-14",
            dragging ? "bg-brand text-brand-foreground" : "bg-brand-muted text-brand",
          )}
        >
          <UploadCloud aria-hidden className={compact ? "size-5" : "size-7"} />
        </span>

        <span className={cn("font-semibold", compact ? "text-sm" : "text-base sm:text-lg")}>
          {dragging ? "Drop to add" : multiple ? "Drag & drop your files here" : "Drag & drop your file here"}
        </span>

        <span className="text-muted-foreground text-sm">
          or{" "}
          <span className="text-brand font-medium underline underline-offset-2">
            choose {multiple ? "files" : "a file"}
          </span>
        </span>

        <span className="text-muted-foreground mt-1 text-xs">
          {acceptLabel}
          {maxLabel ? ` · ${maxLabel}` : ""}
        </span>
      </button>
    </div>
  );
}
