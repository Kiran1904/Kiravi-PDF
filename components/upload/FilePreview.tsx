"use client";

import { useEffect, useMemo } from "react";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";

/** Thumbnail for an image File. PDFs get a glyph — rendering them costs pdfjs. */
export function FilePreview({ file, className }: { file: File; className?: string }) {
  const isImage = file.type.startsWith("image/");
  const url = useMemo(() => (isImage ? URL.createObjectURL(file) : null), [file, isImage]);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return (
    <span
      className={cn(
        "bg-muted grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border",
        className,
      )}
    >
      {url ? (
        // Object URLs are local blobs; next/image would add no value here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <FileText aria-hidden className="text-pdf size-5" />
      )}
    </span>
  );
}
