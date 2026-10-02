import { cn } from "@/lib/utils";

export function ProgressIndicator({
  done,
  total,
  label,
  className,
}: {
  done: number;
  total: number;
  label: string;
  className?: string;
}) {
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const indeterminate = total <= 1;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        {!indeterminate && (
          <span className="text-muted-foreground tabular-nums">
            {done} / {total}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={indeterminate ? undefined : percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-muted h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className={cn(
            "bg-brand h-full rounded-full",
            indeterminate ? "w-1/3 animate-pulse" : "transition-[width] duration-200",
          )}
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
