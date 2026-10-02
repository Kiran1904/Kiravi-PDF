"use client";

import { X } from "lucide-react";

import { ErrorMessage } from "@/components/upload/ErrorMessage";
import { ProcessingState } from "@/components/upload/ProcessingState";
import type { useFileTool } from "@/components/upload/useFileTool";

type FileTool = ReturnType<typeof useFileTool>;

/**
 * The warning / error / processing strip every tool shows between its
 * controls and its result. One live region announces all of it.
 */
export function ToolFeedback({
  tool,
  processingLabel,
}: {
  tool: Pick<FileTool, "status" | "error" | "warnings" | "progress" | "dismissWarnings">;
  processingLabel?: string;
}) {
  return (
    <div aria-live="polite" className="space-y-3 empty:hidden">
      {tool.warnings.length > 0 && (
        <ErrorMessage
          variant="notice"
          title={
            tool.warnings.length === 1 ? "One file was skipped" : `${tool.warnings.length} files were skipped`
          }
        >
          <ul className="text-muted-foreground mt-1 list-disc space-y-1 pl-4">
            {tool.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={tool.dismissWarnings}
            className="text-brand focus-visible:ring-ring mt-2 inline-flex items-center gap-1 rounded text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            <X aria-hidden className="size-3" /> Dismiss
          </button>
        </ErrorMessage>
      )}

      {tool.status === "error" && tool.error && <ErrorMessage message={tool.error} />}

      {tool.status === "processing" && <ProcessingState label={processingLabel} progress={tool.progress} />}
    </div>
  );
}
