"use client";

import { useEffect, useState } from "react";
import { FileStack } from "lucide-react";

import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { FileList } from "@/components/upload/FileList";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes } from "@/lib/files/format";
import type { Tool } from "@/lib/tools/registry";

export function MergePdf({ tool }: { tool: Tool }) {
  const ft = useFileTool(tool);
  const [pageCounts, setPageCounts] = useState<Map<File, number>>(new Map());

  // Page counts are a nicety; a file we cannot count still merges (or fails loudly there).
  useEffect(() => {
    let cancelled = false;
    const missing = ft.files.filter((file) => !pageCounts.has(file));
    if (missing.length === 0) return;

    (async () => {
      const { getPageCount } = await import("@/lib/pdf/edit");
      for (const file of missing) {
        const count = await getPageCount(file).catch(() => 0);
        if (cancelled) return;
        setPageCounts((current) => new Map(current).set(file, count));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ft.files, pageCounts]);

  const totalPages = ft.files.reduce((sum, file) => sum + (pageCounts.get(file) ?? 0), 0);
  const busy = ft.status === "processing";

  async function merge() {
    await ft.run(async (files, context) => {
      const { mergePdfs } = await import("@/lib/pdf/edit");
      return [await mergePdfs(files, { ...context, maxPages: ft.limits.maxPages })];
    });
  }

  return (
    <ToolWorkspace>
      {ft.status !== "done" && (
        <FileDropzone
          accept={tool.accept}
          acceptLabel={tool.acceptLabel}
          multiple
          maxLabel={`Up to ${formatBytes(ft.limits.maxBytes, 0)} per file`}
          disabled={busy}
          compact={ft.files.length > 0}
          onFiles={ft.addFiles}
        />
      )}

      {ft.files.length > 0 && ft.status !== "done" && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {ft.files.length} {ft.files.length === 1 ? "file" : "files"}
              {totalPages > 0 && (
                <span className="text-muted-foreground font-normal"> · {totalPages} pages</span>
              )}
            </h2>
            <p className="text-muted-foreground text-xs">
              Drag to reorder, or use the arrows. Pages merge in this order.
            </p>
          </div>

          <FileList
            files={ft.files}
            reorderable
            onRemove={ft.removeFile}
            onMove={ft.moveFile}
            renderMeta={(file) => {
              const count = pageCounts.get(file);
              return count ? `${count} ${count === 1 ? "page" : "pages"}` : "…";
            }}
          />
        </>
      )}

      <ToolFeedback tool={ft} processingLabel="Merging your PDFs…" />

      {ft.status !== "done" && ft.files.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ProcessButton
            onClick={merge}
            busy={busy}
            disabled={ft.files.length < 2}
            icon={<FileStack className="size-4" />}
          >
            Merge PDF
          </ProcessButton>
          {ft.files.length < 2 && (
            <p className="text-muted-foreground text-sm">Add at least one more PDF to merge.</p>
          )}
        </div>
      )}

      {ft.status === "done" && (
        <DownloadResult
          results={ft.results}
          onDownload={ft.download}
          onDownloadAll={ft.downloadAll}
          onReset={ft.clear}
        />
      )}
    </ToolWorkspace>
  );
}
