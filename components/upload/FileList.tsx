"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";

import { FilePreview } from "@/components/upload/FilePreview";
import { formatBytes } from "@/lib/files/format";
import { cn } from "@/lib/utils";

/**
 * Reordering has two paths on purpose: pointer drag (HTML5, desktop) and the
 * arrow buttons (keyboard and touch). The buttons are the accessible path, not
 * a fallback — they are always visible.
 */
export function FileList({
  files,
  reorderable = false,
  onRemove,
  onMove,
  renderMeta,
}: {
  files: File[];
  reorderable?: boolean;
  onRemove: (index: number) => void;
  onMove?: (from: number, to: number) => void;
  /** Extra per-file detail, e.g. page count or dimensions */
  renderMeta?: (file: File, index: number) => React.ReactNode;
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const canReorder = reorderable && Boolean(onMove) && files.length > 1;

  return (
    <ol className="space-y-2" aria-label="Selected files">
      {files.map((file, index) => (
        <li
          key={`${file.name}-${file.lastModified}-${index}`}
          draggable={canReorder}
          onDragStart={() => setDraggingIndex(index)}
          onDragEnd={() => setDraggingIndex(null)}
          onDragOver={(event) => {
            if (!canReorder || draggingIndex === null) return;
            event.preventDefault();
          }}
          onDrop={(event) => {
            if (!canReorder || draggingIndex === null) return;
            event.preventDefault();
            onMove?.(draggingIndex, index);
            setDraggingIndex(null);
          }}
          className={cn(
            "bg-card flex items-center gap-3 rounded-xl border p-3 transition-shadow",
            draggingIndex === index && "opacity-50 shadow-lg",
          )}
        >
          {canReorder && (
            <GripVertical
              aria-hidden
              className="text-muted-foreground hidden size-4 shrink-0 cursor-grab sm:block"
            />
          )}

          <span className="text-muted-foreground w-5 shrink-0 text-center text-xs font-medium tabular-nums">
            {index + 1}
          </span>

          <FilePreview file={file} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={file.name}>
              {file.name}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatBytes(file.size)}
              {renderMeta ? <> · {renderMeta(file, index)}</> : null}
            </p>
          </div>

          {canReorder && (
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => onMove?.(index, index - 1)}
                disabled={index === 0}
                className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring grid size-8 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:opacity-30"
              >
                <ArrowUp aria-hidden className="size-4" />
                <span className="sr-only">Move {file.name} up</span>
              </button>
              <button
                type="button"
                onClick={() => onMove?.(index, index + 1)}
                disabled={index === files.length - 1}
                className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring grid size-8 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:opacity-30"
              >
                <ArrowDown aria-hidden className="size-4" />
                <span className="sr-only">Move {file.name} down</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring grid size-8 shrink-0 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <X aria-hidden className="size-4" />
            <span className="sr-only">Remove {file.name}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
