"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Crop } from "lucide-react";

import { Field, selectClass } from "@/components/tools/Field";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { Input } from "@/components/ui/input";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes } from "@/lib/files/format";
import type { CropRect } from "@/lib/image/transform";
import type { Tool } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";
import { useObjectUrls } from "./useObjectUrls";

const ASPECTS: Record<string, number | null> = {
  free: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
  "4:5": 4 / 5,
};

type Handle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const HANDLES: { id: Exclude<Handle, "move">; className: string; cursor: string }[] = [
  { id: "nw", className: "-top-1.5 -left-1.5", cursor: "nwse-resize" },
  { id: "n", className: "-top-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { id: "ne", className: "-top-1.5 -right-1.5", cursor: "nesw-resize" },
  { id: "e", className: "top-1/2 -right-1.5 -translate-y-1/2", cursor: "ew-resize" },
  { id: "se", className: "-right-1.5 -bottom-1.5", cursor: "nwse-resize" },
  { id: "s", className: "-bottom-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { id: "sw", className: "-bottom-1.5 -left-1.5", cursor: "nesw-resize" },
  { id: "w", className: "top-1/2 -left-1.5 -translate-y-1/2", cursor: "ew-resize" },
];

const MIN = 8;

export function CropImage({ tool }: { tool: Tool }) {
  const ft = useFileTool(tool);
  const file = ft.files[0] ?? null;
  const urls = useObjectUrls(ft.files);
  const url = file ? urls.get(file) : undefined;
  const busy = ft.status === "processing";

  async function crop(rect: CropRect) {
    await ft.run(async ([input], context) => {
      const { transformImage } = await import("@/lib/image/transform");
      const { sameFormatAs } = await import("@/lib/image/output");
      const output = await sameFormatAs(input);
      const result = await transformImage(input, {
        output,
        quality: output === "image/png" ? undefined : 0.92,
        crop: rect,
        maxPixels: Number.MAX_SAFE_INTEGER,
        suffix: "-cropped",
      });
      context.onProgress(1, 1);
      return [result];
    });
  }

  return (
    <ToolWorkspace>
      {!file && (
        <FileDropzone
          accept={tool.accept}
          acceptLabel={tool.acceptLabel}
          multiple={false}
          maxLabel={`Up to ${formatBytes(ft.limits.maxBytes, 0)}`}
          onFiles={ft.addFiles}
        />
      )}

      {file && url && ft.status !== "done" && (
        // Keyed by file: a new image gets a fresh editor instead of stale crop state.
        <CropEditor
          key={`${file.name}-${file.size}-${file.lastModified}`}
          file={file}
          url={url}
          busy={busy}
          onCrop={crop}
          onClear={ft.clear}
        />
      )}

      <ToolFeedback tool={ft} processingLabel="Cropping…" />

      {ft.status === "done" && (
        <DownloadResult
          results={ft.results}
          onDownload={ft.download}
          onDownloadAll={ft.downloadAll}
          onReset={ft.clear}
        />
      )}
    </ToolWorkspace>
  );
}

function CropEditor({
  file,
  url,
  busy,
  onCrop,
  onClear,
}: {
  file: File;
  url: string;
  busy: boolean;
  onCrop: (rect: CropRect) => void;
  onClear: () => void;
}) {
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [rect, setRect] = useState<CropRect | null>(null);
  const [aspectKey, setAspectKey] = useState("free");
  const [display, setDisplay] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ handle: Handle; startX: number; startY: number; start: CropRect } | null>(null);
  const aspectId = useId();
  const aspect = ASPECTS[aspectKey];

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const observer = new ResizeObserver(() =>
      setDisplay({ width: image.clientWidth, height: image.clientHeight }),
    );
    observer.observe(image);
    return () => observer.disconnect();
  }, []);

  const scale = natural && display.width > 0 ? display.width / natural.width : 1;

  function clamp(next: CropRect): CropRect {
    if (!natural) return next;
    const width = Math.min(Math.max(MIN, next.width), natural.width);
    const height = Math.min(Math.max(MIN, next.height), natural.height);
    return {
      x: Math.round(Math.min(Math.max(0, next.x), natural.width - width)),
      y: Math.round(Math.min(Math.max(0, next.y), natural.height - height)),
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  function applyAspect(key: string) {
    setAspectKey(key);
    const ratio = ASPECTS[key];
    if (!ratio || !rect || !natural) return;
    let width = rect.width;
    let height = Math.round(width / ratio);
    if (height > natural.height) {
      height = natural.height;
      width = Math.round(height * ratio);
    }
    setRect(clamp({ ...rect, width, height }));
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (!rect || busy) return;
    const handle = (event.currentTarget.dataset.handle ?? "move") as Handle;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { handle, startX: event.clientX, startY: event.clientY, start: rect };
  }

  function onPointerMove(event: React.PointerEvent) {
    const current = drag.current;
    if (!current || !natural) return;
    const dx = (event.clientX - current.startX) / scale;
    const dy = (event.clientY - current.startY) / scale;
    const { start, handle } = current;

    if (handle === "move") {
      setRect(clamp({ ...start, x: start.x + dx, y: start.y + dy }));
      return;
    }

    let { x, y, width, height } = start;
    if (handle.includes("e")) width = start.width + dx;
    if (handle.includes("s")) height = start.height + dy;
    if (handle.includes("w")) {
      width = start.width - dx;
      x = start.x + dx;
    }
    if (handle.includes("n")) {
      height = start.height - dy;
      y = start.y + dy;
    }

    if (aspect) {
      // Drive the locked dimension from whichever one the handle moves most.
      if (handle === "n" || handle === "s") width = height * aspect;
      else height = width / aspect;
      if (handle.includes("w")) x = start.x + start.width - width;
      if (handle.includes("n")) y = start.y + start.height - height;
    }

    setRect(clamp({ x, y, width: Math.max(MIN, width), height: Math.max(MIN, height) }));
  }

  function onPointerUp() {
    drag.current = null;
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!rect) return;
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = moves[event.key];
    if (!delta) return;
    event.preventDefault();
    if (event.altKey) {
      const width = rect.width + delta[0];
      const height = aspect ? width / aspect : rect.height + delta[1];
      setRect(clamp({ ...rect, width, height }));
    } else {
      setRect(clamp({ ...rect, x: rect.x + delta[0], y: rect.y + delta[1] }));
    }
  }

  function setField(key: keyof CropRect, value: string) {
    if (!rect) return;
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    const next = { ...rect, [key]: number };
    if (aspect && key === "width") next.height = number / aspect;
    if (aspect && key === "height") next.width = number * aspect;
    setRect(clamp(next));
  }

  const pointerProps = { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="truncate text-sm font-medium" title={file.name}>
          {file.name}
          {natural && (
            <span className="text-muted-foreground font-normal">
              {" "}
              · {natural.width}×{natural.height}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
        >
          Choose a different image
        </button>
      </div>

      <div className="relative mx-auto w-fit max-w-full touch-none overflow-hidden rounded-lg border select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={url}
          alt=""
          draggable={false}
          onLoad={(event) => {
            const image = event.currentTarget;
            const size = { width: image.naturalWidth, height: image.naturalHeight };
            setNatural(size);
            setDisplay({ width: image.clientWidth, height: image.clientHeight });
            setRect({ x: 0, y: 0, width: size.width, height: size.height });
          }}
          className="block max-h-[70vh] w-auto max-w-full"
        />

        {rect && natural && display.width > 0 && (
          <div
            role="group"
            tabIndex={0}
            data-handle="move"
            aria-label={`Crop area: ${rect.width} by ${rect.height} pixels at ${rect.x}, ${rect.y}. Arrow keys move it, Alt plus arrow keys resize it, hold Shift for larger steps.`}
            onKeyDown={onKeyDown}
            {...pointerProps}
            style={{
              left: rect.x * scale,
              top: rect.y * scale,
              width: rect.width * scale,
              height: rect.height * scale,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
            }}
            className="border-brand focus-visible:ring-brand/60 absolute cursor-move border-2 focus-visible:ring-4 focus-visible:outline-none"
          >
            {HANDLES.map((handle) => (
              <span
                key={handle.id}
                aria-hidden
                data-handle={handle.id}
                {...pointerProps}
                style={{ cursor: handle.cursor }}
                className={cn(
                  "bg-background border-brand absolute size-3 rounded-sm border-2",
                  handle.className,
                )}
              />
            ))}
          </div>
        )}
      </div>

      {rect && natural && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Field label="Aspect ratio" htmlFor={aspectId} className="col-span-2 sm:col-span-1">
            <select
              id={aspectId}
              value={aspectKey}
              onChange={(event) => applyAspect(event.target.value)}
              disabled={busy}
              className={selectClass}
            >
              {Object.keys(ASPECTS).map((key) => (
                <option key={key} value={key}>
                  {key === "free" ? "Free" : key}
                </option>
              ))}
            </select>
          </Field>
          {(["x", "y", "width", "height"] as const).map((key) => (
            <Field
              key={key}
              label={{ x: "X", y: "Y", width: "Width", height: "Height" }[key]}
              htmlFor={`${aspectId}-${key}`}
            >
              <Input
                id={`${aspectId}-${key}`}
                type="number"
                inputMode="numeric"
                min={0}
                value={rect[key]}
                onChange={(event) => setField(key, event.target.value)}
                disabled={busy}
                className="h-10"
              />
            </Field>
          ))}
        </div>
      )}

      {rect && (
        <ProcessButton onClick={() => onCrop(rect)} busy={busy} icon={<Crop className="size-4" />}>
          Crop Image
        </ProcessButton>
      )}
    </>
  );
}
