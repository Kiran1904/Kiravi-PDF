"use client";

import { useCallback, useId, useState } from "react";
import { Scaling } from "lucide-react";

import { Field, RadioCards } from "@/components/tools/Field";
import { Input } from "@/components/ui/input";
import type { Tool } from "@/lib/tools/registry";
import { ImageBatchTool } from "./ImageBatchTool";

type Mode = "pixels" | "percent";

export function ResizeImage({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<Mode>("pixels");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [percent, setPercent] = useState("50");
  const [dimensions, setDimensions] = useState<ReadonlyMap<File, string>>(new Map());
  const widthId = useId();
  const heightId = useId();
  const aspectId = useId();
  const percentId = useId();

  const onFilesChange = useCallback((files: File[]) => {
    for (const file of files) {
      if (dimensions.has(file)) continue;
      void import("@/lib/image/transform")
        .then(({ imageDimensions }) => imageDimensions(file))
        .then((size) =>
          setDimensions((current) => new Map(current).set(file, `${size.width}×${size.height}`)),
        )
        .catch(() => setDimensions((current) => new Map(current).set(file, "")));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const widthValue = Number(width) > 0 ? Number(width) : undefined;
  const heightValue = Number(height) > 0 ? Number(height) : undefined;
  const percentValue = Number(percent);
  const canRun =
    mode === "pixels" ? Boolean(widthValue || heightValue) : percentValue >= 1 && percentValue <= 1000;

  return (
    <ImageBatchTool
      tool={tool}
      actionLabel="Resize Images"
      processingLabel="Resizing…"
      icon={<Scaling className="size-4" />}
      canRun={canRun}
      blockedHint={
        mode === "pixels" ? "Enter a width, a height, or both." : "Enter a percentage between 1 and 1000."
      }
      onFilesChange={onFilesChange}
      renderFileMeta={(file) => dimensions.get(file) || "…"}
      renderOptions={(ft) => {
        const busy = ft.status === "processing";
        return (
          <div className="space-y-5">
            <RadioCards<Mode>
              name="resize-mode"
              legend="Resize by"
              value={mode}
              onChange={setMode}
              disabled={busy}
              options={[
                { value: "pixels", label: "Pixels", description: "Exact width and/or height." },
                { value: "percent", label: "Percentage", description: "Scale relative to the original." },
              ]}
            />

            {mode === "pixels" ? (
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Width (px)" htmlFor={widthId}>
                  <Input
                    id={widthId}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    disabled={busy}
                    className="h-10"
                  />
                </Field>
                <Field label="Height (px)" htmlFor={heightId}>
                  <Input
                    id={heightId}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    disabled={busy}
                    className="h-10"
                  />
                </Field>
                <label htmlFor={aspectId} className="flex items-start gap-2 text-sm sm:pt-7">
                  <input
                    id={aspectId}
                    type="checkbox"
                    checked={keepAspect}
                    onChange={(e) => setKeepAspect(e.target.checked)}
                    disabled={busy}
                    className="accent-brand mt-0.5 size-4"
                  />
                  <span>
                    Keep aspect ratio
                    <span className="text-muted-foreground block text-xs">
                      {keepAspect
                        ? "Fits inside the size you enter without stretching."
                        : "Stretches to exactly the size you enter."}
                    </span>
                  </span>
                </label>
              </div>
            ) : (
              <Field
                label="Scale (%)"
                htmlFor={percentId}
                hint="50% halves the width and height; 200% doubles them (and softens the image)."
              >
                <Input
                  id={percentId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={1000}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  disabled={busy}
                  className="h-10 w-32"
                />
              </Field>
            )}
          </div>
        );
      }}
      transform={async (file, { limits }) => {
        const { transformImage } = await import("@/lib/image/transform");
        const { sameFormatAs } = await import("@/lib/image/output");
        const output = await sameFormatAs(file);
        return transformImage(file, {
          output,
          quality: output === "image/png" ? undefined : 0.92,
          resize:
            mode === "percent"
              ? { percent: percentValue }
              : { width: widthValue, height: heightValue, keepAspect },
          maxPixels: limits.maxPixels,
          suffix: "-resized",
        });
      }}
    />
  );
}
