"use client";

import { useId, useState } from "react";
import { FileOutput, Trash2 } from "lucide-react";

import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { ErrorMessage } from "@/components/upload/ErrorMessage";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes } from "@/lib/files/format";
import type { Tool } from "@/lib/tools/registry";
import { PageSelectionControls } from "./PageSelectionControls";
import { PdfPageGrid } from "./PdfPageGrid";
import { SingleFileRow } from "./SingleFileRow";
import { usePageSelection } from "./usePageSelection";
import { usePdfPages } from "./usePdfPages";

/**
 * Delete Pages and Extract Pages are the same picker with opposite verbs:
 * one removes the selection, the other keeps only the selection.
 */
export function PickPages({ tool, mode }: { tool: Tool; mode: "delete" | "extract" }) {
  const ft = useFileTool(tool);
  const file = ft.files[0] ?? null;
  const pages = usePdfPages(file, { maxPages: ft.limits.maxPages });
  const selection = usePageSelection(pages.pageCount, false);
  const [separate, setSeparate] = useState(false);
  const separateId = useId();
  const busy = ft.status === "processing";
  const count = selection.selected.size;
  const isDelete = mode === "delete";

  const blocked = count === 0 || (isDelete && count === pages.pageCount);

  async function run() {
    const chosen = selection.sortedPages;
    await ft.run(async ([input], context) => {
      const { deletePages, extractPages } = await import("@/lib/pdf/edit");
      if (isDelete) return [await deletePages(input, chosen, { ...context, maxPages: ft.limits.maxPages })];
      return extractPages(input, chosen, { ...context, separate, maxPages: ft.limits.maxPages });
    });
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
            onRemove={ft.clear}
            disabled={busy}
          />

          {pages.error && <ErrorMessage message={pages.error} />}

          {pages.pageCount > 0 && (
            <>
              <PageSelectionControls
                selection={selection}
                pageCount={pages.pageCount}
                label={isDelete ? "Pages to delete" : "Pages to extract"}
                disabled={busy}
              />

              <PdfPageGrid
                pageCount={pages.pageCount}
                thumbnails={pages.thumbnails}
                requestThumbnail={pages.requestThumbnail}
                selected={selection.selected}
                onToggle={selection.toggle}
                selectedLabel={isDelete ? "marked for deletion" : "selected"}
              />

              {!isDelete && (
                <label htmlFor={separateId} className="flex items-center gap-2 text-sm">
                  <input
                    id={separateId}
                    type="checkbox"
                    checked={separate}
                    onChange={(event) => setSeparate(event.target.checked)}
                    disabled={busy}
                    className="accent-brand size-4"
                  />
                  Save each page as its own PDF
                </label>
              )}

              <p className="text-muted-foreground text-sm" aria-live="polite">
                {isDelete
                  ? count === pages.pageCount
                    ? "A PDF needs at least one page — leave at least one unselected."
                    : `${pages.pageCount - count} ${pages.pageCount - count === 1 ? "page" : "pages"} will be kept.`
                  : count === 0
                    ? "Select the pages you want in the new PDF."
                    : `${count} ${count === 1 ? "page" : "pages"} will be ${separate ? "saved as separate files" : "saved to a new PDF"}.`}
              </p>
            </>
          )}
        </>
      )}

      <ToolFeedback tool={ft} processingLabel={isDelete ? "Removing pages…" : "Extracting pages…"} />

      {file && ft.status !== "done" && pages.pageCount > 0 && (
        <ProcessButton
          onClick={run}
          busy={busy}
          disabled={blocked}
          icon={isDelete ? <Trash2 className="size-4" /> : <FileOutput className="size-4" />}
        >
          {isDelete
            ? `Delete ${count || ""} ${count === 1 ? "page" : "pages"}`.replace(/\s+/g, " ")
            : "Extract Pages"}
        </ProcessButton>
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

export function DeletePages({ tool }: { tool: Tool }) {
  return <PickPages tool={tool} mode="delete" />;
}

export function ExtractPages({ tool }: { tool: Tool }) {
  return <PickPages tool={tool} mode="extract" />;
}
