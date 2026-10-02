"use client";

import { useCallback, useState } from "react";
import { ShieldOff } from "lucide-react";

import type { MetadataSummary } from "@/lib/image/metadata";
import type { Tool } from "@/lib/tools/registry";
import { ImageBatchTool } from "./ImageBatchTool";

export function RemoveMetadata({ tool }: { tool: Tool }) {
  const [summaries, setSummaries] = useState<ReadonlyMap<File, string>>(new Map());

  const onFilesChange = useCallback((files: File[]) => {
    for (const file of files) {
      if (summaries.has(file)) continue;
      void import("@/lib/image/metadata")
        .then(async ({ summarizeMetadata, describeMetadata }) => {
          const summary: MetadataSummary = await summarizeMetadata(file);
          const found = describeMetadata(summary);
          return found.length > 0 ? `found: ${found.join(", ")}` : "no metadata found";
        })
        .then((text) => setSummaries((current) => new Map(current).set(file, text)))
        .catch(() => setSummaries((current) => new Map(current).set(file, "")));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ImageBatchTool
      tool={tool}
      actionLabel="Remove Metadata"
      processingLabel="Rewriting images without metadata…"
      icon={<ShieldOff className="size-4" />}
      showSaving={false}
      onFilesChange={onFilesChange}
      renderFileMeta={(file) => summaries.get(file) ?? "checking…"}
      renderOptions={() => (
        <p className="text-muted-foreground text-sm">
          Each image is re-encoded from its pixels alone, so EXIF, GPS, XMP, IPTC and colour-profile data are
          all dropped. The picture itself is unchanged at normal viewing size.
        </p>
      )}
      transform={async (file, { limits }) => {
        const { transformImage } = await import("@/lib/image/transform");
        const { sameFormatAs } = await import("@/lib/image/output");
        const output = await sameFormatAs(file);
        return transformImage(file, {
          output,
          quality: output === "image/png" ? undefined : 0.92,
          maxPixels: limits.maxPixels,
          suffix: "-clean",
        });
      }}
    />
  );
}
