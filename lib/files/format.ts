const UNITS = ["B", "KB", "MB", "GB"] as const;

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const rounded = exponent === 0 ? Math.round(value) : Number(value.toFixed(decimals));
  return `${rounded} ${UNITS[exponent]}`;
}

/** Signed percentage change from `before` to `after`, positive meaning smaller. */
export function reductionPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 100);
}

/** `report.pdf` -> `report-merged.pdf` */
export function renameFile(fileName: string, suffix: string, extension?: string): string {
  const dot = fileName.lastIndexOf(".");
  const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = extension ?? (dot > 0 ? fileName.slice(dot + 1) : "");
  return ext ? `${stem}${suffix}.${ext}` : `${stem}${suffix}`;
}

/** Strips directory separators and anything else awkward in a download name. */
export function safeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^\w.\- ()]/g, "_").slice(0, 120) || "file";
}
