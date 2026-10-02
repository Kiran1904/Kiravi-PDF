import { inputExtensions, type Tool } from "@/lib/tools/types";
import type { FileKind } from "./validate";

const EXTENSION_KINDS: Record<string, FileKind> = {
  PDF: "pdf",
  JPG: "jpeg",
  JPEG: "jpeg",
  PNG: "png",
  WEBP: "webp",
  GIF: "gif",
  BMP: "bmp",
};

/** The signature kinds a tool can actually process, derived from its `accept`. */
export function kindsForTool(tool: Pick<Tool, "accept">): FileKind[] {
  const kinds = new Set<FileKind>();
  for (const extension of inputExtensions(tool)) {
    const kind = EXTENSION_KINDS[extension];
    if (kind) kinds.add(kind);
  }
  return [...kinds];
}

/** "a PDF file" / "a JPG, PNG or WebP file" — for the unsupported-type message. */
export function expectedLabel(tool: Pick<Tool, "accept">): string {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const extension of inputExtensions(tool)) {
    const name = extension === "JPEG" ? "JPG" : extension === "WEBP" ? "WebP" : extension;
    if (seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  if (names.length === 0) return "a supported file";
  if (names.length === 1) return `a ${names[0]} file`;
  const last = names.pop();
  return `a ${names.join(", ")} or ${last} file`;
}
