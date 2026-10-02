/**
 * One pipeline for every image tool: decode -> (crop) -> (rotate/flip) ->
 * (resize) -> encode. Each tool is a thin call with the options it exposes.
 */
import type { ResultFile } from "@/lib/files/download";
import { renameFile } from "@/lib/files/format";
import {
  canvasToBlob,
  context2d,
  decodeImage,
  EXTENSIONS,
  makeCanvas,
  releaseBitmap,
  releaseCanvas,
  type OutputType,
} from "./decode";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeSpec {
  /** Either dimension may be omitted to derive it from the aspect ratio */
  width?: number;
  height?: number;
  /** Percentage (1–1000) applied instead of width/height when set */
  percent?: number;
  /** Downscale-only ceiling on width; images already narrower are left alone */
  maxWidth?: number;
  keepAspect?: boolean;
}

export interface TransformOptions {
  output: OutputType;
  /** 0–1 for JPEG/WebP; ignored for PNG */
  quality?: number;
  /** Fill colour behind transparent pixels when the output cannot hold alpha */
  background?: string;
  crop?: CropRect;
  /** 0, 90, 180, 270 — applied after crop */
  rotate?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  resize?: ResizeSpec;
  maxPixels?: number;
  /** Suffix for the output file name, e.g. "-resized" */
  suffix?: string;
}

export interface TransformResult extends ResultFile {
  originalBytes: number;
  width: number;
  height: number;
  downscaled: boolean;
}

export async function transformImage(file: File, options: TransformOptions): Promise<TransformResult> {
  const decoded = await decodeImage(file, { maxPixels: options.maxPixels });
  const { bitmap } = decoded;

  try {
    // 1. Crop — clamp to the bitmap so a stale rectangle cannot throw.
    const crop = clampCrop(options.crop, bitmap.width, bitmap.height);

    // 2. Rotate / flip. A quarter turn swaps the canvas dimensions.
    const rotate = options.rotate ?? 0;
    const turned = rotate === 90 || rotate === 270;
    const rotatedWidth = turned ? crop.height : crop.width;
    const rotatedHeight = turned ? crop.width : crop.height;

    // 3. Resize target.
    const target = resolveResize(options.resize, rotatedWidth, rotatedHeight);

    const canvas = makeCanvas(target.width, target.height);
    const context = context2d(canvas);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((rotate * Math.PI) / 180);
    context.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
    // After rotation the drawing box is the un-rotated crop size, scaled to target.
    const scaleX = (turned ? target.height : target.width) / crop.width;
    const scaleY = (turned ? target.width : target.height) / crop.height;
    const drawWidth = crop.width * scaleX;
    const drawHeight = crop.height * scaleY;
    context.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );
    context.restore();

    try {
      const blob = await canvasToBlob(canvas, options.output, options.quality);
      return {
        name: renameFile(file.name, options.suffix ?? "", EXTENSIONS[options.output]),
        blob,
        originalBytes: file.size,
        width: canvas.width,
        height: canvas.height,
        downscaled: decoded.downscaled,
      };
    } finally {
      releaseCanvas(canvas);
    }
  } finally {
    releaseBitmap(bitmap);
  }
}

function clampCrop(crop: CropRect | undefined, width: number, height: number): CropRect {
  if (!crop) return { x: 0, y: 0, width, height };
  const x = Math.min(Math.max(0, Math.round(crop.x)), width - 1);
  const y = Math.min(Math.max(0, Math.round(crop.y)), height - 1);
  return {
    x,
    y,
    width: Math.max(1, Math.min(Math.round(crop.width), width - x)),
    height: Math.max(1, Math.min(Math.round(crop.height), height - y)),
  };
}

export function resolveResize(
  spec: ResizeSpec | undefined,
  width: number,
  height: number,
): { width: number; height: number } {
  if (!spec) return { width, height };

  if (spec.maxWidth && spec.maxWidth > 0) {
    if (width <= spec.maxWidth) return { width, height };
    const factor = spec.maxWidth / width;
    return { width: Math.round(spec.maxWidth), height: Math.max(1, Math.round(height * factor)) };
  }

  if (spec.percent && spec.percent > 0) {
    const factor = spec.percent / 100;
    return {
      width: Math.max(1, Math.round(width * factor)),
      height: Math.max(1, Math.round(height * factor)),
    };
  }

  const keepAspect = spec.keepAspect ?? true;
  const ratio = width / height;

  if (spec.width && spec.height) {
    if (!keepAspect) return { width: Math.round(spec.width), height: Math.round(spec.height) };
    // Fit inside the box.
    const fit = Math.min(spec.width / width, spec.height / height);
    return { width: Math.max(1, Math.round(width * fit)), height: Math.max(1, Math.round(height * fit)) };
  }
  if (spec.width)
    return { width: Math.round(spec.width), height: Math.max(1, Math.round(spec.width / ratio)) };
  if (spec.height)
    return { width: Math.max(1, Math.round(spec.height * ratio)), height: Math.round(spec.height) };
  return { width, height };
}

export async function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  const decoded = await decodeImage(file, { maxPixels: Number.MAX_SAFE_INTEGER });
  const size = { width: decoded.width, height: decoded.height };
  releaseBitmap(decoded.bitmap);
  return size;
}
