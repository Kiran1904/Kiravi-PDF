"use client";

import { useId, useState } from "react";
import { ArrowRightLeft, Repeat } from "lucide-react";

import { Field, rangeClass, selectClass } from "@/components/tools/Field";
import type { OutputType } from "@/lib/image/decode";
import { OUTPUT_LABELS } from "@/lib/image/output";
import type { Tool } from "@/lib/tools/registry";
import { ImageBatchTool } from "./ImageBatchTool";

/** JPG → PNG: no options; PNG is lossless so there is nothing to tune. */
export function JpgToPng({ tool }: { tool: Tool }) {
  return (
    <ImageBatchTool
      tool={tool}
      actionLabel="Convert to PNG"
      processingLabel="Converting…"
      icon={<ArrowRightLeft className="size-4" />}
      showSaving={false}
      transform={async (file, { limits }) => {
        const { transformImage } = await import("@/lib/image/transform");
        return transformImage(file, { output: "image/png", maxPixels: limits.maxPixels });
      }}
    />
  );
}

/** PNG → JPG: quality plus a fill colour for transparent pixels. */
export function PngToJpg({ tool }: { tool: Tool }) {
  const [quality, setQuality] = useState(0.9);
  const [background, setBackground] = useState("#ffffff");
  const qualityId = useId();
  const colorId = useId();

  return (
    <ImageBatchTool
      tool={tool}
      actionLabel="Convert to JPG"
      processingLabel="Converting…"
      icon={<ArrowRightLeft className="size-4" />}
      renderOptions={(ft) => (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={`JPG quality — ${Math.round(quality * 100)}%`} htmlFor={qualityId}>
            <input
              id={qualityId}
              type="range"
              min={40}
              max={100}
              step={5}
              value={Math.round(quality * 100)}
              onChange={(event) => setQuality(Number(event.target.value) / 100)}
              disabled={ft.status === "processing"}
              className={rangeClass}
            />
          </Field>
          <Field
            label="Background for transparent areas"
            htmlFor={colorId}
            hint="JPG cannot store transparency, so those pixels are filled with this colour."
          >
            <div className="flex items-center gap-3">
              <input
                id={colorId}
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                disabled={ft.status === "processing"}
                className="h-10 w-14 cursor-pointer rounded-lg border p-1"
              />
              <span className="text-muted-foreground font-mono text-sm">{background}</span>
            </div>
          </Field>
        </div>
      )}
      transform={async (file, { limits }) => {
        const { transformImage } = await import("@/lib/image/transform");
        return transformImage(file, {
          output: "image/jpeg",
          quality,
          background,
          maxPixels: limits.maxPixels,
        });
      }}
    />
  );
}

/** WebP in either direction. */
export function WebpConverter({ tool }: { tool: Tool }) {
  const [output, setOutput] = useState<OutputType>("image/webp");
  const [quality, setQuality] = useState(0.82);
  const outputId = useId();
  const qualityId = useId();

  return (
    <ImageBatchTool
      tool={tool}
      actionLabel={`Convert to ${OUTPUT_LABELS[output]}`}
      processingLabel="Converting…"
      icon={<Repeat className="size-4" />}
      renderOptions={(ft) => (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Output format" htmlFor={outputId}>
            <select
              id={outputId}
              value={output}
              onChange={(event) => setOutput(event.target.value as OutputType)}
              disabled={ft.status === "processing"}
              className={selectClass}
            >
              <option value="image/webp">WebP — smallest, keeps transparency</option>
              <option value="image/jpeg">JPG — widest compatibility</option>
              <option value="image/png">PNG — lossless</option>
            </select>
          </Field>
          {output !== "image/png" && (
            <Field
              label={`Quality — ${Math.round(quality * 100)}%`}
              htmlFor={qualityId}
              hint={
                output === "image/webp"
                  ? "100% gives the highest-quality WebP, useful for logos and screenshots."
                  : undefined
              }
            >
              <input
                id={qualityId}
                type="range"
                min={40}
                max={100}
                step={2}
                value={Math.round(quality * 100)}
                onChange={(event) => setQuality(Number(event.target.value) / 100)}
                disabled={ft.status === "processing"}
                className={rangeClass}
              />
            </Field>
          )}
        </div>
      )}
      transform={async (file, { limits }) => {
        const { transformImage } = await import("@/lib/image/transform");
        return transformImage(file, {
          output,
          quality: output === "image/png" ? undefined : quality,
          background: output === "image/jpeg" ? "#ffffff" : undefined,
          maxPixels: limits.maxPixels,
        });
      }}
    />
  );
}
