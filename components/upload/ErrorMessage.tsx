import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Status is carried by the icon and the words, not only by colour — so it still
 * reads for a colour-blind user or in a high-contrast theme.
 */
export function ErrorMessage({
  title = "Something went wrong",
  message,
  variant = "error",
  className,
  children,
}: {
  title?: string;
  message?: string;
  variant?: "error" | "notice";
  className?: string;
  children?: React.ReactNode;
}) {
  const Icon = variant === "error" ? AlertTriangle : Info;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        variant === "error"
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-brand/30 bg-brand-muted text-foreground",
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{title}</p>
        {message && (
          <p className={variant === "error" ? "text-destructive/90" : "text-muted-foreground"}>{message}</p>
        )}
        {children}
      </div>
    </div>
  );
}
