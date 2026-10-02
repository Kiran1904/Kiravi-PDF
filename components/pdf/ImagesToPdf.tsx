"use client";

import { useId, useState } from "react";
import { FileDown } from "lucide-react";

import { Field, RadioCards, selectClass } from "@/components/tools/Field";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { FileList } from "@/components/upload/FileList";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes } from "@/lib/files/format";
import type { MarginKey, OrientationKey, PageSizeKey } from "@/lib/pdf/from-images";
import type { Tool } from "@/lib/tools/registry";

/** Shared by JPG to PDF and Image to PDF — same builder, different accepted inputs. */
export function ImagesToPdf({ tool }: { tool: Tool }) {
  const ft = useFileTool(tool);
  const [pageSize, setPageSize] = useState<PageSizeKey>("a4");
  const [orientation, setOrientation] = useState<OrientationKey>("auto");
  const [margin, setMargin] = useState<MarginKey>("small");
  const sizeId = useId();
  const busy = ft.status === "processing";

  async function build() {
    await ft.run(async (files, context) => {
      const { imagesToPdf } = await import("@/lib/pdf/from-images");
      return [
        await imagesToPdf(files, {
          pageSize,
          orientation,
          margin,
          maxPixels: ft.limits.maxPixels,
          ...context,
        }),
      ];
    });
  }

  return (
    <ToolWorkspace>
      {ft.status !== "done" && (
        <FileDropzone
          accept={tool.accept}
          acceptLabel={tool.acceptLabel}
          multiple
          maxLabel={`Up to ${formatBytes(ft.limits.maxBytes, 0)} per image`}
          disabled={busy}
          compact={ft.files.length > 0}
          onFiles={ft.addFiles}
        />
      )}

      {ft.files.length > 0 && ft.status !== "done" && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {ft.files.length} {ft.files.length === 1 ? "image" : "images"} · one page each
            </h2>
            <p className="text-muted-foreground text-xs">Drag to reorder, or use the arrows.</p>
          </div>
          <FileList files={ft.files} reorderable onRemove={ft.removeFile} onMove={ft.moveFile} />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Page size" htmlFor={sizeId}>
              <select
                id={sizeId}
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value as PageSizeKey)}
                disabled={busy}
                className={selectClass}
              >
                <option value="a4">A4</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit to each image</option>
              </select>
            </Field>
          </div>

          <RadioCards<OrientationKey>
            name="orientation"
            legend="Orientation"
            value={orientation}
            onChange={setOrientation}
            disabled={busy || pageSize === "fit"}
            options={[
              { value: "auto", label: "Automatic", description: "Match each image." },
              { value: "portrait", label: "Portrait" },
              { value: "landscape", label: "Landscape" },
            ]}
          />

          <RadioCards<MarginKey>
            name="margin"
            legend="Margin"
            value={margin}
            onChange={setMargin}
            disabled={busy}
            options={[
              { value: "none", label: "None" },
              { value: "small", label: "Small", description: "About 1 cm." },
              { value: "large", label: "Large", description: "About 2 cm." },
            ]}
          />
        </>
      )}

      <ToolFeedback tool={ft} processingLabel="Building your PDF…" />

      {ft.files.length > 0 && ft.status !== "done" && (
        <ProcessButton onClick={build} busy={busy} icon={<FileDown className="size-4" />}>
          Create PDF
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
