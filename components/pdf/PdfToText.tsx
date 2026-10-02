"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";

import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { Button } from "@/components/ui/button";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { ErrorMessage } from "@/components/upload/ErrorMessage";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes, renameFile } from "@/lib/files/format";
import type { ExtractedText } from "@/lib/pdf/extract-text";
import type { Tool } from "@/lib/tools/registry";
import { SingleFileRow } from "./SingleFileRow";

export function PdfToText({ tool }: { tool: Tool }) {
  const ft = useFileTool(tool);
  const file = ft.files[0] ?? null;
  const [extracted, setExtracted] = useState<ExtractedText | null>(null);
  const [copied, setCopied] = useState(false);
  const busy = ft.status === "processing";

  async function extract() {
    setExtracted(null);
    await ft.run(async ([input], context) => {
      const { extractText } = await import("@/lib/pdf/extract-text");
      const result = await extractText(input, { ...context, maxPages: ft.limits.maxPages });
      setExtracted(result);
      return [
        {
          name: renameFile(input.name, "", "txt"),
          blob: new Blob([result.text], { type: "text/plain;charset=utf-8" }),
        },
      ];
    });
  }

  async function copy() {
    if (!extracted) return;
    await navigator.clipboard.writeText(extracted.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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

      {file && ft.status !== "done" && <SingleFileRow file={file} onRemove={ft.clear} disabled={busy} />}

      <ToolFeedback tool={ft} processingLabel="Reading the text layer…" />

      {ft.status === "error" && ft.error?.includes("scan") && (
        <p className="text-muted-foreground text-sm">
          Scanned pages need optical character recognition (OCR), which this tool does not do yet. You can
          still convert the pages to images, or merge, split and rotate the document.
        </p>
      )}

      {file && ft.status !== "done" && (
        <ProcessButton onClick={extract} busy={busy} icon={<FileText className="size-4" />}>
          Extract Text
        </ProcessButton>
      )}

      {ft.status === "done" && extracted && (
        <>
          {extracted.emptyPages > 0 && (
            <ErrorMessage
              variant="notice"
              title={`${extracted.emptyPages} of ${extracted.pageCount} pages contained no text`}
              message="Those pages are probably scanned images. The text from the remaining pages is below."
            />
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                Extracted text{" "}
                <span className="text-muted-foreground font-normal">
                  · {extracted.pageCount} {extracted.pageCount === 1 ? "page" : "pages"} ·{" "}
                  {extracted.words.toLocaleString()} words · {extracted.text.length.toLocaleString()}{" "}
                  characters
                </span>
              </p>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy text"}
              </Button>
            </div>
            <textarea
              readOnly
              value={extracted.text}
              aria-label="Extracted text"
              className="bg-card focus-visible:ring-brand/30 h-72 w-full resize-y rounded-xl border p-4 font-mono text-xs leading-relaxed focus-visible:ring-4 focus-visible:outline-none"
            />
          </div>

          <DownloadResult
            results={ft.results}
            onDownload={ft.download}
            onDownloadAll={ft.downloadAll}
            onReset={ft.clear}
          />
        </>
      )}
    </ToolWorkspace>
  );
}
