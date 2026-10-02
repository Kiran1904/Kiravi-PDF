import type { ResultFile } from "@/lib/files/download";
import { renameFile } from "@/lib/files/format";
import {
  canvasToBlob,
  closePdf,
  openPdf,
  releaseCanvas,
  renderPageToCanvas,
  RENDER_SCALES,
  type RenderScale,
} from "./pdfjs";
import { assertPageBudget } from "./pdf-lib";

export interface RasterizeOptions {
  pages: readonly number[];
  format: "image/jpeg" | "image/png";
  /** 0–1, JPEG only */
  quality?: number;
  scale?: RenderScale;
  maxPages?: number;
  maxPixels?: number;
  onProgress?: (done: number, total: number) => void;
  yieldToUi?: () => Promise<void>;
}

/** One image per page, produced sequentially so only one bitmap lives at a time. */
export async function rasterizePdf(file: File, options: RasterizeOptions): Promise<ResultFile[]> {
  const doc = await openPdf(file);
  try {
    assertPageBudget(doc.numPages, options.maxPages ?? 0);

    const extension = options.format === "image/png" ? "png" : "jpg";
    const scale = RENDER_SCALES[options.scale ?? "balanced"];
    const results: ResultFile[] = [];

    for (const [index, pageNumber] of options.pages.entries()) {
      const canvas = await renderPageToCanvas(doc, pageNumber, scale, { maxPixels: options.maxPixels });
      const blob = await canvasToBlob(canvas, options.format, options.quality);
      releaseCanvas(canvas);

      results.push({ name: renameFile(file.name, `-page-${pageNumber}`, extension), blob });
      options.onProgress?.(index + 1, options.pages.length);
      await options.yieldToUi?.();
    }
    return results;
  } finally {
    await closePdf(doc);
  }
}
