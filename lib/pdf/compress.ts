/**
 * Honest PDF compression. See PLAN.md R1.
 *
 * - "light": lossless rewrite via pdf-lib. Removes unreferenced objects and
 *   uses object streams. Keeps text selectable. Small savings.
 * - "balanced" / "strong": rasterise each page via pdfjs and re-encode as
 *   JPEG, then rebuild. Large savings on scans, but the text layer is gone —
 *   the UI says so before the user runs it.
 *
 * If the result is not smaller, the original bytes are returned unchanged and
 * flagged, rather than handing back a bigger file.
 */
import type { ResultFile } from "@/lib/files/download";
import { renameFile } from "@/lib/files/format";
import { assertPageBudget, loadDocument, loadPdfLib, saveAsBlob } from "./pdf-lib";
import { canvasToBlob, closePdf, openPdf, releaseCanvas, renderPageToCanvas } from "./pdfjs";

export type CompressionLevel = "light" | "balanced" | "strong";

export const COMPRESSION_LEVELS: Record<
  CompressionLevel,
  { label: string; description: string; lossy: boolean; scale: number; quality: number }
> = {
  light: {
    label: "Light",
    description: "Lossless. Text stays selectable; images untouched. Small saving.",
    lossy: false,
    scale: 0,
    quality: 0,
  },
  balanced: {
    label: "Balanced",
    description: "Pages re-encoded at 150 DPI. Big saving on scans; text becomes an image.",
    lossy: true,
    scale: 150 / 72,
    quality: 0.72,
  },
  strong: {
    label: "Strong",
    description: "Pages re-encoded at 110 DPI. Smallest file; fine print may soften.",
    lossy: true,
    scale: 110 / 72,
    quality: 0.6,
  },
};

export interface CompressResult extends ResultFile {
  originalBytes: number;
  /** True when compression did not help and the original was kept */
  keptOriginal: boolean;
  lossy: boolean;
}

export interface CompressOptions {
  level: CompressionLevel;
  maxPages?: number;
  maxPixels?: number;
  onProgress?: (done: number, total: number) => void;
  yieldToUi?: () => Promise<void>;
}

export async function compressPdf(file: File, options: CompressOptions): Promise<CompressResult> {
  const level = COMPRESSION_LEVELS[options.level];
  const blob = level.lossy
    ? await rasterCompress(file, level.scale, level.quality, options)
    : await losslessRewrite(file, options);

  const keptOriginal = blob.size >= file.size;
  return {
    name: renameFile(file.name, "-compressed", "pdf"),
    blob: keptOriginal ? new Blob([await file.arrayBuffer()], { type: "application/pdf" }) : blob,
    originalBytes: file.size,
    keptOriginal,
    lossy: level.lossy && !keptOriginal,
  };
}

async function losslessRewrite(file: File, options: CompressOptions): Promise<Blob> {
  const doc = await loadDocument(file);
  assertPageBudget(doc.getPageCount(), options.maxPages ?? 0);
  options.onProgress?.(1, 1);
  return saveAsBlob(doc);
}

async function rasterCompress(
  file: File,
  scale: number,
  quality: number,
  options: CompressOptions,
): Promise<Blob> {
  const source = await openPdf(file);
  try {
    assertPageBudget(source.numPages, options.maxPages ?? 0);

    const { PDFDocument } = await loadPdfLib();
    const target = await PDFDocument.create();

    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
      const page = await source.getPage(pageNumber);
      const { width, height } = page.getViewport({ scale: 1 });
      page.cleanup();

      const canvas = await renderPageToCanvas(source, pageNumber, scale, { maxPixels: options.maxPixels });
      const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
      releaseCanvas(canvas);

      const image = await target.embedJpg(await jpeg.arrayBuffer());
      // Keep the original page dimensions in points so the document prints the same size.
      target.addPage([width, height]).drawImage(image, { x: 0, y: 0, width, height });

      options.onProgress?.(pageNumber, source.numPages);
      await options.yieldToUi?.();
    }

    return saveAsBlob(target);
  } finally {
    await closePdf(source);
  }
}
