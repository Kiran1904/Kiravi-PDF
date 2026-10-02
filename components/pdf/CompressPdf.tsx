"use client";

import { useState } from "react";
import { Minimize2 } from "lucide-react";

import { RadioCards } from "@/components/tools/Field";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { ErrorMessage } from "@/components/upload/ErrorMessage";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes, reductionPercent } from "@/lib/files/format";
import { COMPRESSION_LEVELS, type CompressionLevel } from "@/lib/pdf/compress";
import type { Tool } from "@/lib/tools/registry";
import { SingleFileRow } from "./SingleFileRow";

export function CompressPdf({ tool }: { tool: Tool }) {
  const ft = useFileTool(tool);
  const file = ft.files[0] ?? null;
  const [level, setLevel] = useState<CompressionLevel>("balanced");
  const [outcome, setOutcome] = useState<{ keptOriginal: boolean; lossy: boolean } | null>(null);
  const busy = ft.status === "processing";
  const chosen = COMPRESSION_LEVELS[level];

  async function compress() {
    setOutcome(null);
    await ft.run(async ([input], context) => {
      const { compressPdf } = await import("@/lib/pdf/compress");
      const result = await compressPdf(input, {
        level,
        maxPages: ft.limits.maxPages,
        maxPixels: ft.limits.maxPixels,
        ...context,
      });
      setOutcome({ keptOriginal: result.keptOriginal, lossy: result.lossy });
      return [result];
    });
  }

  const result = ft.results[0];
  const saving = file && result ? reductionPercent(file.size, result.blob.size) : 0;

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
            meta={`original size ${formatBytes(file.size)}`}
            onRemove={ft.clear}
            disabled={busy}
          />

          <RadioCards<CompressionLevel>
            name="compression-level"
            legend="Compression level"
            value={level}
            onChange={setLevel}
            disabled={busy}
            options={(Object.keys(COMPRESSION_LEVELS) as CompressionLevel[]).map((key) => ({
              value: key,
              label: COMPRESSION_LEVELS[key].label,
              description: COMPRESSION_LEVELS[key].description,
            }))}
          />

          {chosen.lossy ? (
            <ErrorMessage
              variant="notice"
              title="This level re-encodes pages as images"
              message="Scanned documents shrink a lot. Text will no longer be selectable or searchable in the result, so keep your original."
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Light mode rewrites the file without touching its contents. How much it saves depends entirely
              on what is in the PDF — text-only documents often change very little.
            </p>
          )}
        </>
      )}

      <ToolFeedback
        tool={ft}
        processingLabel={chosen.lossy ? "Re-encoding pages…" : "Optimising your PDF…"}
      />

      {file && ft.status !== "done" && (
        <ProcessButton onClick={compress} busy={busy} icon={<Minimize2 className="size-4" />}>
          Compress PDF
        </ProcessButton>
      )}

      {ft.status === "done" && file && result && (
        <>
          {outcome?.keptOriginal && (
            <ErrorMessage
              variant="notice"
              title="This PDF is already as small as this method can make it"
              message="Compressing would have produced a larger file, so the original has been kept unchanged. A stronger level may help if the document contains images."
            />
          )}
          <DownloadResult
            results={ft.results}
            onDownload={ft.download}
            onDownloadAll={ft.downloadAll}
            onReset={ft.clear}
            summary={
              <dl className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Original</dt>
                  <dd className="font-medium tabular-nums">{formatBytes(file.size)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Compressed</dt>
                  <dd className="font-medium tabular-nums">{formatBytes(result.blob.size)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Saved</dt>
                  <dd
                    className={
                      saving > 0 ? "text-success font-medium tabular-nums" : "font-medium tabular-nums"
                    }
                  >
                    {saving > 0 ? `${saving}%` : "0%"}
                  </dd>
                </div>
                {outcome?.lossy && (
                  <dd className="text-muted-foreground col-span-3 text-xs">
                    Pages were re-encoded as images; text in this file is no longer selectable.
                  </dd>
                )}
              </dl>
            }
          />
        </>
      )}
    </ToolWorkspace>
  );
}
