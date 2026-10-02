import { ShieldCheck } from "lucide-react";

/**
 * Rendered only when `tool.clientSide` is true, so the claim is never made for
 * a tool that does not actually process locally.
 */
export function PrivacyNote({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
        <ShieldCheck aria-hidden className="text-success size-3.5" />
        Processed in your browser — nothing is uploaded
      </p>
    );
  }

  return (
    <div className="border-success/30 bg-success/5 flex items-start gap-3 rounded-xl border p-4">
      <ShieldCheck aria-hidden className="text-success mt-0.5 size-5 shrink-0" />
      <p className="text-sm">
        <span className="font-medium">Your files stay on your device.</span>{" "}
        <span className="text-muted-foreground">
          Your files are processed directly in your browser and are not uploaded to our servers.
        </span>
      </p>
    </div>
  );
}
