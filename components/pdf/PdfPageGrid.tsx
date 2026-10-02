"use client";

import { useEffect, useRef } from "react";
import { Check, RotateCcw, RotateCw } from "lucide-react";

import type { PageThumbnail } from "@/lib/pdf/pdfjs";
import { cn } from "@/lib/utils";

/**
 * Thumbnail grid for page pickers. Tiles are checkboxes when `onToggle` is
 * given; rotate buttons appear when `onRotate` is given. Thumbnails are
 * requested only when a tile scrolls into view.
 */
export function PdfPageGrid({
  pageCount,
  thumbnails,
  requestThumbnail,
  selected,
  onToggle,
  rotations,
  onRotate,
  selectedLabel = "selected",
}: {
  pageCount: number;
  thumbnails: ReadonlyMap<number, PageThumbnail>;
  requestThumbnail: (pageNumber: number) => void;
  selected?: ReadonlySet<number>;
  onToggle?: (pageNumber: number) => void;
  rotations?: ReadonlyMap<number, number>;
  onRotate?: (pageNumber: number, delta: 90 | -90) => void;
  selectedLabel?: string;
}) {
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const pageNumber = Number((entry.target as HTMLElement).dataset.page);
          if (pageNumber) requestThumbnail(pageNumber);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "200px" },
    );

    for (const tile of grid.querySelectorAll<HTMLElement>("[data-page]")) observer.observe(tile);
    return () => observer.disconnect();
  }, [pageCount, requestThumbnail]);

  return (
    <ul
      ref={gridRef}
      className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
      aria-label="Pages"
    >
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
        const thumbnail = thumbnails.get(pageNumber);
        const isSelected = selected?.has(pageNumber) ?? false;
        const rotation = rotations?.get(pageNumber) ?? 0;
        const selectable = Boolean(onToggle);

        const image = (
          <span
            className={cn(
              "bg-muted relative block aspect-[3/4] w-full overflow-hidden rounded-md border",
              selectable && isSelected ? "border-brand" : "border-border",
            )}
          >
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail.dataUrl}
                alt=""
                className="absolute inset-0 m-auto max-h-full max-w-full object-contain transition-transform"
                style={
                  rotation ? { transform: `rotate(${rotation}deg)`, transformOrigin: "center" } : undefined
                }
              />
            ) : (
              <span className="text-muted-foreground absolute inset-0 grid place-items-center text-xs">
                …
              </span>
            )}
            {selectable && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-1.5 left-1.5 grid size-5 place-items-center rounded-full border text-[10px]",
                  isSelected
                    ? "bg-brand border-brand text-brand-foreground"
                    : "bg-background/90 border-border",
                )}
              >
                {isSelected && <Check className="size-3" strokeWidth={3} />}
              </span>
            )}
          </span>
        );

        return (
          <li key={pageNumber} data-page={pageNumber} className="space-y-1">
            {selectable ? (
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Page ${pageNumber}${isSelected ? `, ${selectedLabel}` : ""}`}
                onClick={() => onToggle?.(pageNumber)}
                className="focus-visible:ring-brand/40 block w-full rounded-md focus-visible:ring-4 focus-visible:outline-none"
              >
                {image}
              </button>
            ) : (
              image
            )}

            <div className="flex items-center justify-between px-0.5">
              <span className="text-muted-foreground text-xs tabular-nums">
                {pageNumber}
                {rotation ? <span className="text-brand"> · {((rotation % 360) + 360) % 360}°</span> : null}
              </span>
              {onRotate && (
                <span className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => onRotate(pageNumber, -90)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring grid size-6 place-items-center rounded focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <RotateCcw aria-hidden className="size-3.5" />
                    <span className="sr-only">Rotate page {pageNumber} left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRotate(pageNumber, 90)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring grid size-6 place-items-center rounded focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <RotateCw aria-hidden className="size-3.5" />
                    <span className="sr-only">Rotate page {pageNumber} right</span>
                  </button>
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
