import { safeFileName } from "./format";

/** One processed artefact, ready to hand to the user. */
export interface ResultFile {
  name: string;
  blob: Blob;
  /** Object URL for previewing; the caller owns revoking it. */
  previewUrl?: string;
  /** Size of the input this result came from, when there is a one-to-one mapping */
  originalBytes?: number;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeFileName(fileName);
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in Safari.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function downloadAsZip(files: readonly ResultFile[], zipName: string): Promise<void> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const file of files) {
    zip.file(safeFileName(file.name), file.blob);
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  downloadBlob(blob, zipName);
}
