"use client";

import { useState } from "react";
import { RotateCcw, RotateCw, Save } from "lucide-react";

import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { Button } from "@/components/ui/button";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { ErrorMessage } from "@/components/upload/ErrorMessage";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes } from "@/lib/files/format";
import { allPages } from "@/lib/pdf/page-ranges";
import type { Tool } from "@/lib/tools/registry";
import { PdfPageGrid } from "./PdfPageGrid";
import { SingleFileRow } from "./SingleFileRow";
import { usePdfPages } from "./usePdfPages";

export function RotatePdf({ tool }: { tool: Tool }) {
  const ft = useFileTool(tool);
  const file = ft.files[0] ?? null;
  const pages = usePdfPages(file, { maxPages: ft.limits.maxPages });
  const [rotations, setRotations] = useState<ReadonlyMap<number, number>>(new Map());
  const busy = ft.status === "processing";

  function rotate(pageNumbers: readonly number[], delta: number) {
    setRotations((current) => {
      const next = new Map(current);
      for (const pageNumber of pageNumbers)
        next.set(pageNumber, ((((next.get(pageNumber) ?? 0) + delta) % 360) + 360) % 360);
      return next;
    });
  }

  const changed = [...rotations.values()].some((value) => value % 360 !== 0);

  async function save() {
    const snapshot = new Map(rotations);
    await ft.run(async ([input]) => {
      const { rotatePages } = await import("@/lib/pdf/edit");
      return [await rotatePages(input, snapshot, { maxPages: ft.limits.maxPages })];
    });
  }

  function reset() {
    setRotations(new Map());
    ft.clear();
  }

  return (
    <ToolWorkspace>
      {!file && (
        <FileDropzone
          accept={tool.accept}
          acceptLabel={tool.acceptLabel}
          multiple={false}
          maxLabel={`Up to ${formatBytes(ft.limits.maxBytes, 0)}`}
          onFiles={ft.addFiles}
        />
      )}

      {file && ft.status !== "done" && (
        <>
          <SingleFileRow
            file={file}
            meta={
              pages.pageCount
                ? `${pages.pageCount} ${pages.pageCount === 1 ? "page" : "pages"}`
                : pages.loading
                  ? "reading…"
                  : undefined
            }
            onRemove={reset}
            disabled={busy}
          />

          {pages.error && <ErrorMessage message={pages.error} />}

          {pages.pageCount > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">All pages:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rotate(allPages(pages.pageCount), -90)}
                  disabled={busy}
                >
                  <RotateCcw className="size-3.5" /> Rotate left
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rotate(allPages(pages.pageCount), 90)}
                  disabled={busy}
                >
                  <RotateCw className="size-3.5" /> Rotate right
                </Button>
                {changed && (
                  <Button variant="ghost" size="sm" onClick={() => setRotations(new Map())} disabled={busy}>
                    Reset
                  </Button>
                )}
                <span className="text-muted-foreground text-xs">
                  Or rotate single pages with the buttons under each thumbnail.
                </span>
              </div>

              <PdfPageGrid
                pageCount={pages.pageCount}
                thumbnails={pages.thumbnails}
                requestThumbnail={pages.requestThumbnail}
                rotations={rotations}
                onRotate={(pageNumber, delta) => rotate([pageNumber], delta)}
              />
            </>
          )}
        </>
      )}

      <ToolFeedback tool={ft} processingLabel="Saving the rotated PDF…" />

      {file && ft.status !== "done" && pages.pageCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ProcessButton onClick={save} busy={busy} disabled={!changed} icon={<Save className="size-4" />}>
            Save PDF
          </ProcessButton>
          {!changed && <p className="text-muted-foreground text-sm">Rotate at least one page to continue.</p>}
        </div>
      )}

      {ft.status === "done" && (
        <DownloadResult
          results={ft.results}
          onDownload={ft.download}
          onDownloadAll={ft.downloadAll}
          onReset={reset}
        />
      )}
    </ToolWorkspace>
  );
}
