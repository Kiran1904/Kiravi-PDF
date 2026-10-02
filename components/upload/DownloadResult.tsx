"use client";

import { CheckCircle2, Download, FileArchive, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, reductionPercent } from "@/lib/files/format";
import type { ResultFile } from "@/lib/files/download";
import { cn } from "@/lib/utils";

export function DownloadResult({
  results,
  onDownload,
  onDownloadAll,
  onReset,
  /** Total input size, to show the saving for compression tools */
  originalBytes,
  summary,
}: {
  results: ResultFile[];
  onDownload: (result: ResultFile) => void;
  onDownloadAll: () => void;
  onReset: () => void;
  originalBytes?: number;
  summary?: React.ReactNode;
}) {
  if (results.length === 0) return null;

  const totalBytes = results.reduce((sum, result) => sum + result.blob.size, 0);
  const saving = originalBytes ? reductionPercent(originalBytes, totalBytes) : null;

  return (
    <section aria-labelledby="result-heading" className="space-y-4">
      <div className="border-success/40 bg-success/5 rounded-xl border p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden className="text-success mt-0.5 size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 id="result-heading" className="font-semibold">
              Done — {results.length === 1 ? "your file is ready" : `${results.length} files are ready`}
            </h2>
            {summary ?? (
              <p className="text-muted-foreground mt-1 text-sm">
                {formatBytes(totalBytes)} total
                {saving !== null && originalBytes ? (
                  <>
                    {" · "}
                    {saving > 0 ? (
                      <span className="text-success font-medium">{saving}% smaller than the original</span>
                    ) : (
                      <span>no size reduction was possible for this file</span>
                    )}
                  </>
                ) : null}
              </p>
            )}
          </div>
        </div>

        {results.length === 1 && results[0].previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={results[0].previewUrl}
            alt={`Preview of ${results[0].name}`}
            className="bg-muted mt-4 max-h-80 w-auto max-w-full rounded-lg border object-contain"
          />
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="h-11 flex-1 px-5 text-base sm:flex-none" onClick={onDownloadAll}>
            {results.length > 1 ? <FileArchive className="size-4" /> : <Download className="size-4" />}
            {results.length > 1 ? "Download all as ZIP" : "Download"}
          </Button>
          <Button size="lg" variant="outline" className="h-11 px-5 text-base" onClick={onReset}>
            <RotateCcw className="size-4" />
            Start over
          </Button>
        </div>
      </div>

      {results.length > 1 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {results.map((result, index) => (
            <li
              key={`${result.name}-${index}`}
              className="bg-card flex items-center gap-3 rounded-xl border p-3"
            >
              {result.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.previewUrl}
                  alt={`Preview of ${result.name}`}
                  loading="lazy"
                  className="bg-muted size-12 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <span className={cn("bg-muted grid size-12 shrink-0 place-items-center rounded-lg border")}>
                  <Download aria-hidden className="text-muted-foreground size-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={result.name}>
                  {result.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {result.originalBytes ? (
                    <>
                      {formatBytes(result.originalBytes)} → {formatBytes(result.blob.size)}
                      {reductionPercent(result.originalBytes, result.blob.size) > 0 && (
                        <span className="text-success">
                          {" "}
                          · −{reductionPercent(result.originalBytes, result.blob.size)}%
                        </span>
                      )}
                    </>
                  ) : (
                    formatBytes(result.blob.size)
                  )}
                </p>
              </div>
              <Button variant="outline" size="icon-lg" onClick={() => onDownload(result)}>
                <Download className="size-4" />
                <span className="sr-only">Download {result.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
