"use client";

import { useState } from "react";
import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Tool } from "@/lib/tools/registry";
import { ImageBatchTool } from "./ImageBatchTool";
import { useObjectUrls } from "./useObjectUrls";

type Turn = 0 | 90 | 180 | 270;

export function RotateImage({ tool }: { tool: Tool }) {
  const [rotate, setRotate] = useState<Turn>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const changed = rotate !== 0 || flipH || flipV;

  return (
    <ImageBatchTool
      tool={tool}
      actionLabel="Apply & Download"
      processingLabel="Rotating…"
      icon={<RotateCw className="size-4" />}
      showSaving={false}
      canRun={changed}
      blockedHint="Rotate or flip the images to continue."
      renderOptions={(ft) => (
        <Preview
          files={ft.files}
          rotate={rotate}
          flipH={flipH}
          flipV={flipV}
          disabled={ft.status === "processing"}
          onRotate={(delta) => setRotate(((((rotate + delta) % 360) + 360) % 360) as Turn)}
          onFlipH={() => setFlipH((v) => !v)}
          onFlipV={() => setFlipV((v) => !v)}
          onReset={() => {
            setRotate(0);
            setFlipH(false);
            setFlipV(false);
          }}
        />
      )}
      transform={async (file, { limits }) => {
        const { transformImage } = await import("@/lib/image/transform");
        const { sameFormatAs } = await import("@/lib/image/output");
        const output = await sameFormatAs(file);
        return transformImage(file, {
          output,
          quality: output === "image/png" ? undefined : 0.92,
          rotate,
          flipHorizontal: flipH,
          flipVertical: flipV,
          maxPixels: limits.maxPixels,
          suffix: "-rotated",
        });
      }}
    />
  );
}

function Preview({
  files,
  rotate,
  flipH,
  flipV,
  disabled,
  onRotate,
  onFlipH,
  onFlipV,
  onReset,
}: {
  files: File[];
  rotate: Turn;
  flipH: boolean;
  flipV: boolean;
  disabled: boolean;
  onRotate: (delta: 90 | -90) => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onReset: () => void;
}) {
  const urls = useObjectUrls(files);
  const transform = `rotate(${rotate}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`;
  const changed = rotate !== 0 || flipH || flipV;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onRotate(-90)} disabled={disabled}>
          <RotateCcw className="size-3.5" /> Rotate left
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRotate(90)} disabled={disabled}>
          <RotateCw className="size-3.5" /> Rotate right
        </Button>
        <Button
          variant={flipH ? "secondary" : "outline"}
          size="sm"
          onClick={onFlipH}
          disabled={disabled}
          aria-pressed={flipH}
        >
          <FlipHorizontal2 className="size-3.5" /> Flip horizontal
        </Button>
        <Button
          variant={flipV ? "secondary" : "outline"}
          size="sm"
          onClick={onFlipV}
          disabled={disabled}
          aria-pressed={flipV}
        >
          <FlipVertical2 className="size-3.5" /> Flip vertical
        </Button>
        {changed && (
          <Button variant="ghost" size="sm" onClick={onReset} disabled={disabled}>
            Reset
          </Button>
        )}
        <span className="text-muted-foreground text-xs" aria-live="polite">
          {rotate}°{flipH ? ", flipped horizontally" : ""}
          {flipV ? ", flipped vertically" : ""}
        </span>
      </div>

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6" aria-label="Preview">
        {files.map((file) => (
          <li
            key={`${file.name}-${file.lastModified}`}
            className="bg-muted grid aspect-square place-items-center overflow-hidden rounded-lg border p-2"
          >
            {urls.get(file) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urls.get(file)}
                alt={`Preview of ${file.name}`}
                className="max-h-full max-w-full object-contain transition-transform"
                style={{ transform }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
