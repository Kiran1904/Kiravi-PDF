"use client";

import { useId, useState } from "react";
import { ImageDown } from "lucide-react";

import { Field, rangeClass } from "@/components/tools/Field";
import { Input } from "@/components/ui/input";
import type { Tool } from "@/lib/tools/registry";
import { ImageBatchTool } from "./ImageBatchTool";

export function CompressImage({ tool }: { tool: Tool }) {
  const [quality, setQuality] = useState(0.8);
  const [toWebp, setToWebp] = useState(false);
  const [maxWidth, setMaxWidth] = useState("");
  const qualityId = useId();
  const webpId = useId();
  const widthId = useId();
  const widthValue = Number(maxWidth) > 0 ? Number(maxWidth) : undefined;

  return (
    <ImageBatchTool
      tool={tool}
      actionLabel="Compress Images"
      processingLabel="Compressing…"
      icon={<ImageDown className="size-4" />}
      renderOptions={(ft) => (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={`Quality — ${Math.round(quality * 100)}%`}
            htmlFor={qualityId}
            hint="80% is invisible on most photos. Lower is smaller."
            className="sm:col-span-2"
          >
            <input
              id={qualityId}
              type="range"
              min={30}
              max={95}
              step={5}
              value={Math.round(quality * 100)}
              onChange={(event) => setQuality(Number(event.target.value) / 100)}
              disabled={ft.status === "processing"}
              className={rangeClass}
            />
          </Field>

          <Field
            label="Maximum width (optional)"
            htmlFor={widthId}
            hint="Images wider than this are scaled down. Narrower images are left alone."
          >
            <Input
              id={widthId}
              type="number"
              inputMode="numeric"
              min={16}
              placeholder="e.g. 1920"
              value={maxWidth}
              onChange={(event) => setMaxWidth(event.target.value)}
              disabled={ft.status === "processing"}
              className="h-10 max-w-40"
            />
          </Field>

          <label htmlFor={webpId} className="flex items-start gap-2 text-sm sm:pt-7">
            <input
              id={webpId}
              type="checkbox"
              checked={toWebp}
              onChange={(event) => setToWebp(event.target.checked)}
              disabled={ft.status === "processing"}
              className="accent-brand mt-0.5 size-4"
            />
            <span>
              Convert to WebP
              <span className="text-muted-foreground block text-xs">
                Smallest files. PNG is lossless, so a PNG only really shrinks if you turn this on.
              </span>
            </span>
          </label>
        </div>
      )}
      transform={async (file, { limits }) => {
        const { transformImage } = await import("@/lib/image/transform");
        const { sameFormatAs } = await import("@/lib/image/output");
        const output = toWebp ? "image/webp" : await sameFormatAs(file);
        return transformImage(file, {
          output,
          quality: output === "image/png" ? undefined : quality,
          background: output === "image/jpeg" ? "#ffffff" : undefined,
          resize: widthValue ? { maxWidth: widthValue } : undefined,
          maxPixels: limits.maxPixels,
          suffix: "-compressed",
        });
      }}
    />
  );
}
