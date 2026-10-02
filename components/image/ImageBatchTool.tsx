"use client";

import { useEffect } from "react";

import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { FileList } from "@/components/upload/FileList";
import { useFileTool, type ProcessContext } from "@/components/upload/useFileTool";
import type { ResultFile } from "@/lib/files/download";
import { formatBytes } from "@/lib/files/format";
import type { ToolLimits } from "@/lib/files/limits";
import type { Tool } from "@/lib/tools/registry";

type FileTool = ReturnType<typeof useFileTool>;

/**
 * Every image tool is "pick files → set options → transform each → download".
 * This owns that flow; a tool supplies its options UI and its per-file transform.
 */
export function ImageBatchTool({
  tool,
  actionLabel,
  processingLabel,
  icon,
  renderOptions,
  renderFileMeta,
  onFilesChange,
  transform,
  canRun = true,
  blockedHint,
  showSaving = true,
}: {
  tool: Tool;
  actionLabel: string;
  processingLabel: string;
  icon?: React.ReactNode;
  renderOptions?: (ft: FileTool) => React.ReactNode;
  renderFileMeta?: (file: File, index: number) => React.ReactNode;
  onFilesChange?: (files: File[]) => void;
  transform: (file: File, context: ProcessContext & { limits: ToolLimits }) => Promise<ResultFile>;
  canRun?: boolean;
  blockedHint?: string;
  showSaving?: boolean;
}) {
  const ft = useFileTool(tool);
  const busy = ft.status === "processing";

  useEffect(() => {
    onFilesChange?.(ft.files);
  }, [ft.files, onFilesChange]);

  async function run() {
    await ft.run(async (files, context) => {
      const results: ResultFile[] = [];
      for (const [index, file] of files.entries()) {
        results.push(await transform(file, { ...context, limits: ft.limits }));
        context.onProgress(index + 1, files.length);
        await context.yieldToUi();
      }
      return results;
    });
  }

  const originalBytes = ft.files.reduce((sum, file) => sum + file.size, 0);

  return (
    <ToolWorkspace>
      {ft.status !== "done" && (
        <FileDropzone
          accept={tool.accept}
          acceptLabel={tool.acceptLabel}
          multiple={tool.multiple}
          maxLabel={`Up to ${formatBytes(ft.limits.maxBytes, 0)} per image`}
          disabled={busy}
          compact={ft.files.length > 0}
          onFiles={ft.addFiles}
        />
      )}

      {ft.files.length > 0 && ft.status !== "done" && (
        <>
          <FileList files={ft.files} onRemove={ft.removeFile} renderMeta={renderFileMeta} />
          {renderOptions?.(ft)}
        </>
      )}

      <ToolFeedback tool={ft} processingLabel={processingLabel} />

      {ft.files.length > 0 && ft.status !== "done" && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ProcessButton onClick={run} busy={busy} disabled={!canRun} icon={icon}>
            {actionLabel}
          </ProcessButton>
          {!canRun && blockedHint && <p className="text-muted-foreground text-sm">{blockedHint}</p>}
        </div>
      )}

      {ft.status === "done" && (
        <DownloadResult
          results={ft.results}
          onDownload={ft.download}
          onDownloadAll={ft.downloadAll}
          onReset={ft.clear}
          originalBytes={showSaving ? originalBytes : undefined}
        />
      )}
    </ToolWorkspace>
  );
}
