import { cn } from "@/lib/utils";

/** The bordered card that holds the upload → configure → process flow. */
export function ToolWorkspace({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-muted/20 space-y-5 rounded-2xl border p-4 sm:p-6", className)}>{children}</div>
  );
}
