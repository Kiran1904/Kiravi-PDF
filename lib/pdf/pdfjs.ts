/**
 * The only module allowed to import pdfjs-dist. Everything goes through
 * `await import()` so the ~1 MB library (and its worker) never reaches a page
 * bundle until a tool actually opens a PDF.
 */
import { AppError } from "@/lib/errors";

type PdfJs = typeof import("pdfjs-dist");
export type PdfDocument = import("pdfjs-dist").PDFDocumentProxy;
export type PdfPage = import("pdfjs-dist").PDFPageProxy;

let pdfjsPromise: Promise<PdfJs> | null = null;

export function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Parsing and rasterising run in pdfjs's own worker, off the main thread.
      // One worker per opened document; `closePdf` terminates it.
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function openPdf(file: File | ArrayBuffer | Uint8Array): Promise<PdfDocument> {
  const pdfjs = await loadPdfJs();
  const data =
    file instanceof File
      ? new Uint8Array(await file.arrayBuffer())
      : file instanceof Uint8Array
        ? file
        : new Uint8Array(file);

  try {
    return await pdfjs.getDocument({ data }).promise;
  } catch (error) {
    throw mapPdfJsError(error, pdfjs);
  }
}

/** Releases the document and terminates its worker. */
export async function closePdf(doc: PdfDocument): Promise<void> {
  await doc.loadingTask.destroy();
}

function mapPdfJsError(error: unknown, pdfjs: PdfJs): AppError {
  if (error instanceof pdfjs.PasswordException) return new AppError("ENCRYPTED_PDF");
  if (error instanceof pdfjs.InvalidPDFException) return new AppError("CORRUPT_FILE");
  if (error instanceof Error && /password|encrypt/i.test(error.message)) return new AppError("ENCRYPTED_PDF");
  return new AppError("CORRUPT_FILE");
}

/** DPI presets exposed to users; 72 is PDF's native unit. */
export const RENDER_SCALES = {
  thumbnail: 0.35,
  screen: 1,
  balanced: 150 / 72,
  high: 300 / 72,
} as const;

export type RenderScale = keyof typeof RENDER_SCALES;

/**
 * Renders one page to a fresh canvas. Caller is responsible for dropping the
 * canvas (set width/height to 0) once the pixels have been consumed, so that a
 * 500-page document never holds 500 bitmaps at once.
 */
export async function renderPageToCanvas(
  doc: PdfDocument,
  pageNumber: number,
  scale: number,
  options: { maxPixels?: number } = {},
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  try {
    let viewport = page.getViewport({ scale });

    // Clamp to the pixel budget so a poster-sized page cannot exhaust memory.
    const maxPixels = options.maxPixels ?? 40_000_000;
    const pixels = viewport.width * viewport.height;
    if (pixels > maxPixels) {
      viewport = page.getViewport({ scale: scale * Math.sqrt(maxPixels / pixels) });
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new AppError("BROWSER_UNSUPPORTED");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvas, canvasContext: context, viewport }).promise;
    return canvas;
  } finally {
    page.cleanup();
  }
}

export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new AppError("PROCESSING_FAILED"))),
      type,
      quality,
    );
  });
}

export interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/** Small JPEG data URLs for page pickers; generated sequentially to bound memory. */
export async function renderThumbnails(
  doc: PdfDocument,
  pageNumbers: readonly number[],
  onEach?: (thumbnail: PageThumbnail) => void,
): Promise<PageThumbnail[]> {
  const thumbnails: PageThumbnail[] = [];
  for (const pageNumber of pageNumbers) {
    const canvas = await renderPageToCanvas(doc, pageNumber, RENDER_SCALES.thumbnail);
    const thumbnail = {
      pageNumber,
      dataUrl: canvas.toDataURL("image/jpeg", 0.7),
      width: canvas.width,
      height: canvas.height,
    };
    releaseCanvas(canvas);
    thumbnails.push(thumbnail);
    onEach?.(thumbnail);
  }
  return thumbnails;
}
