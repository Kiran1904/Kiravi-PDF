"use client";

import { useId, useState } from "react";
import { FileImage } from "lucide-react";

import { Field, rangeClass, selectClass } from "@/components/tools/Field";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { ErrorMessage } from "@/components/upload/ErrorMessage";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes } from "@/lib/files/format";
import type { RenderScale } from "@/lib/pdf/pdfjs";
import type { Tool } from "@/lib/tools/registry";
import { PageSelectionControls } from "./PageSelectionControls";
import { PdfPageGrid } from "./PdfPageGrid";
import { SingleFileRow } from "./SingleFileRow";
import { usePageSelection } from "./usePageSelection";
import { usePdfPages } from "./usePdfPages";

/** PDF to JPG and PDF to PNG share everything except the encoder. */
export function PdfToImages({ tool, format }: { tool: Tool; format: "image/jpeg" | "image/png" }) {
  const ft = useFileTool(tool);
  const file = ft.files[0] ?? null;
  const pages = usePdfPages(file, { maxPages: ft.limits.maxPages });
  const selection = usePageSelection(pages.pageCount, true);
  const [scale, setScale] = useState<RenderScale>("balanced");
  const [quality, setQuality] = useState(0.85);
  const scaleId = useId();
  const qualityId = useId();
  const busy = ft.status === "processing";
  const isJpeg = format === "image/jpeg";

  async function convert() {
    const chosen = selection.sortedPages;
    await ft.run(async ([input], context) => {
      const { rasterizePdf } = await import("@/lib/pdf/rasterize");
      return rasterizePdf(input, {
        pages: chosen,
        format,
        quality: isJpeg ? quality : undefined,
        scale,
        maxPages: ft.limits.maxPages,
        maxPixels: ft.limits.maxPixels,
        ...context,
      });
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
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Resolution" htmlFor={scaleId}>
                  <select
                    id={scaleId}
                    value={scale}
                    onChange={(event) => setScale(event.target.value as RenderScale)}
                    disabled={busy}
                    className={selectClass}
                  >
                    <option value="screen">Screen — 72 DPI, smallest files</option>
                    <option value="balanced">Balanced — 150 DPI</option>
                    <option value="high">High — 300 DPI, print quality</option>
                  </select>
                </Field>

                {isJpeg && (
                  <Field label={`JPG quality — ${Math.round(quality * 100)}%`} htmlFor={qualityId}>
                    <input
                      id={qualityId}
                      type="range"
                      min={40}
                      max={100}
                      step={5}
                      value={Math.round(quality * 100)}
                      onChange={(event) => setQuality(Number(event.target.value) / 100)}
                      disabled={busy}
                      className={rangeClass}
                    />
                  </Field>
                )}
              </div>

              <PageSelectionControls
                selection={selection}
                pageCount={pages.pageCount}
                label="Pages to convert"
                disabled={busy}
              />

              <PdfPageGrid
                pageCount={pages.pageCount}
                thumbnails={pages.thumbnails}
                requestThumbnail={pages.requestThumbnail}
                selected={selection.selected}
                onToggle={selection.toggle}
              />
            </>
          )}
        </>
      )}

      <ToolFeedback tool={ft} processingLabel={`Rendering pages to ${isJpeg ? "JPG" : "PNG"}…`} />

      {file && ft.status !== "done" && pages.pageCount > 0 && (
        <ProcessButton
          onClick={convert}
          busy={busy}
          disabled={selection.selected.size === 0}
          icon={<FileImage className="size-4" />}
        >
          Convert to {isJpeg ? "JPG" : "PNG"}
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

export function PdfToJpg({ tool }: { tool: Tool }) {
  return <PdfToImages tool={tool} format="image/jpeg" />;
}

export function PdfToPng({ tool }: { tool: Tool }) {
  return <PdfToImages tool={tool} format="image/png" />;
}
