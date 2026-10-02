/**
 * Everything image-related goes through the browser's own decoder and canvas:
 * no image library is shipped. `createImageBitmap` applies EXIF orientation,
 * which is also how "remove metadata" works — re-encoding through a canvas
 * produces a file that carries pixels and nothing else.
 */
import { AppError } from "@/lib/errors";

export interface DecodedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  /** True when the image was downscaled to fit the pixel budget */
  downscaled: boolean;
}

export async function decodeImage(file: Blob, options: { maxPixels?: number } = {}): Promise<DecodedImage> {
  if (typeof createImageBitmap !== "function") throw new AppError("BROWSER_UNSUPPORTED");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new AppError("CORRUPT_FILE");
  }

  const maxPixels = options.maxPixels ?? 40_000_000;
  const pixels = bitmap.width * bitmap.height;
  if (pixels <= maxPixels) {
    return { bitmap, width: bitmap.width, height: bitmap.height, downscaled: false };
  }

  // Too big to hold as RGBA: resample down before any further work.
  const ratio = Math.sqrt(maxPixels / pixels);
  const width = Math.max(1, Math.floor(bitmap.width * ratio));
  const height = Math.max(1, Math.floor(bitmap.height * ratio));
  const smaller = await createImageBitmap(bitmap, {
    resizeWidth: width,
    resizeHeight: height,
    resizeQuality: "high",
  });
  bitmap.close();
  return { bitmap: smaller, width, height, downscaled: true };
}

export function releaseBitmap(bitmap: ImageBitmap): void {
  bitmap.close();
}

export type OutputType = "image/jpeg" | "image/png" | "image/webp";

export const EXTENSIONS: Record<OutputType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) throw new AppError("BROWSER_UNSUPPORTED");
  return context;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: OutputType, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Safari returns null for unsupported encoders (older versions, WebP).
        if (!blob || blob.type !== type) reject(new AppError("BROWSER_UNSUPPORTED"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/** Draws a bitmap onto a fresh canvas and encodes it. */
export async function encodeCanvas(
  bitmap: ImageBitmap,
  type: OutputType,
  quality?: number,
  background?: string,
): Promise<Blob> {
  const canvas = makeCanvas(bitmap.width, bitmap.height);
  const context = context2d(canvas);
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(bitmap, 0, 0);
  try {
    return await canvasToBlob(canvas, type, quality);
  } finally {
    releaseCanvas(canvas);
  }
}
