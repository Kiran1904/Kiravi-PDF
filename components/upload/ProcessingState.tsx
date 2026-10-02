import { Loader2 } from "lucide-react";

import { ProgressIndicator } from "@/components/upload/ProgressIndicator";
import type { Progress } from "@/components/upload/useFileTool";

export function ProcessingState({
  label = "Processing your file…",
  progress,
}: {
  label?: string;
  progress: Progress | null;
}) {
  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center gap-3">
        <Loader2 aria-hidden className="text-brand size-5 animate-spin" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      {progress && progress.total > 1 && (
        <ProgressIndicator
          className="mt-4"
          done={progress.done}
          total={progress.total}
          label="Pages processed"
        />
      )}
      <p className="text-muted-foreground mt-3 text-xs">
        Keep this tab open — the work is happening on your device.
      </p>
    </div>
  );
}
