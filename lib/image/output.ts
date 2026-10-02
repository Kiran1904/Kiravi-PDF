import { readFileKind, type FileKind } from "@/lib/files/validate";
import type { OutputType } from "./decode";

/** Browsers can encode JPEG, PNG and WebP; GIF and BMP inputs come back as PNG. */
export function outputTypeFor(kind: FileKind | null): OutputType {
  if (kind === "jpeg") return "image/jpeg";
  if (kind === "webp") return "image/webp";
  return "image/png";
}

export async function sameFormatAs(file: File): Promise<OutputType> {
  return outputTypeFor(await readFileKind(file));
}

export const OUTPUT_LABELS: Record<OutputType, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
};
