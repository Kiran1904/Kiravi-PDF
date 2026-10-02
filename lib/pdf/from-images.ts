import type { ResultFile } from "@/lib/files/download";
import { renameFile } from "@/lib/files/format";
import { decodeImage, encodeCanvas, releaseBitmap } from "@/lib/image/decode";
import { readFileKind } from "@/lib/files/validate";
import { loadPdfLib, saveAsBlob } from "./pdf-lib";

export type PageSizeKey = "a4" | "letter" | "fit";
export type OrientationKey = "auto" | "portrait" | "landscape";
export type MarginKey = "none" | "small" | "large";

/** Points (1/72 in). */
export const PAGE_SIZES: Record<Exclude<PageSizeKey, "fit">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const MARGINS: Record<MarginKey, number> = { none: 0, small: 28, large: 56 };

export interface ImagesToPdfOptions {
  pageSize: PageSizeKey;
  orientation: OrientationKey;
  margin: MarginKey;
  maxPixels?: number;
  onProgress?: (done: number, total: number) => void;
  yieldToUi?: () => Promise<void>;
}

export async function imagesToPdf(files: readonly File[], options: ImagesToPdfOptions): Promise<ResultFile> {
  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.create();
  const margin = MARGINS[options.margin];

  for (const [index, file] of files.entries()) {
    const kind = await readFileKind(file);

    // JPEG and PNG embed natively; everything else is re-encoded to PNG first
    // (lossless, and it also normalises EXIF orientation into the pixels).
    let image;
    if (kind === "jpeg") {
      image = await doc.embedJpg(await file.arrayBuffer());
    } else if (kind === "png") {
      image = await doc.embedPng(await file.arrayBuffer());
    } else {
      const { bitmap } = await decodeImage(file, { maxPixels: options.maxPixels });
      const blob = await encodeCanvas(bitmap, "image/png");
      releaseBitmap(bitmap);
      image = await doc.embedPng(await blob.arrayBuffer());
    }

    const imageIsLandscape = image.width > image.height;
    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === "fit") {
      pageWidth = image.width + margin * 2;
      pageHeight = image.height + margin * 2;
    } else {
      const [shortSide, longSide] = PAGE_SIZES[options.pageSize];
      const landscape =
        options.orientation === "landscape" || (options.orientation === "auto" && imageIsLandscape);
      pageWidth = landscape ? longSide : shortSide;
      pageHeight = landscape ? shortSide : longSide;
    }

    const page = doc.addPage([pageWidth, pageHeight]);
    const boxWidth = pageWidth - margin * 2;
    const boxHeight = pageHeight - margin * 2;
    const ratio = Math.min(
      boxWidth / image.width,
      boxHeight / image.height,
      options.pageSize === "fit" ? 1 : Infinity,
    );
    const drawWidth = image.width * ratio;
    const drawHeight = image.height * ratio;

    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });

    options.onProgress?.(index + 1, files.length);
    await options.yieldToUi?.();
  }

  const stem = files.length === 1 ? files[0].name : "images";
  return { name: renameFile(stem, "", "pdf"), blob: await saveAsBlob(doc) };
}
