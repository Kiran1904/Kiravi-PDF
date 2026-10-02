"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Scissors } from "lucide-react";

import { Field, RadioCards } from "@/components/tools/Field";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { Input } from "@/components/ui/input";
import { useFileTool } from "@/components/upload/useFileTool";
import { formatBytes } from "@/lib/files/format";
import { allPages, parseRangeGroups } from "@/lib/pdf/page-ranges";
import type { Tool } from "@/lib/tools/registry";
import { SingleFileRow } from "./SingleFileRow";

type Mode = "ranges" | "each" | "every";

function defaultRanges(pageCount: number): string {
  if (pageCount <= 0) return "";
  if (pageCount === 1) return "1";
  const half = Math.ceil(pageCount / 2);
  return `1-${half}, ${half + 1}-${pageCount}`;
}

export function SplitPdf({ tool }: { tool: Tool }) {
  const ft = useFileTool(tool);
  const file = ft.files[0] ?? null;
  // Both pieces of state are tagged with their file, so a new file starts clean.
  const [info, setInfo] = useState<{ file: File; pageCount: number } | null>(null);
  const [range, setRange] = useState<{ file: File; text: string } | null>(null);
  const [mode, setMode] = useState<Mode>("ranges");
  const [every, setEvery] = useState(2);
  const rangeId = useId();
  const everyId = useId();
  const { fail } = ft;

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    import("@/lib/pdf/edit")
      .then(({ getPageCount }) => getPageCount(file))
      .then((count) => {
        if (!cancelled) setInfo({ file, pageCount: count });
      })
      .catch((caught) => {
        if (!cancelled) fail(caught);
      });
    return () => {
      cancelled = true;
    };
  }, [file, fail]);

  const pageCount = info?.file === file ? info.pageCount : 0;
  const rangeText = range?.file === file ? range.text : defaultRanges(pageCount);
  const setRangeText = (text: string) => {
    if (file) setRange({ file, text });
  };

  const groups = useMemo(() => {
    if (pageCount === 0) return null;
    if (mode === "each") return allPages(pageCount).map((page) => [page]);
    if (mode === "every") {
      const size = Math.max(1, Math.floor(every));
      const out: number[][] = [];
      for (let start = 1; start <= pageCount; start += size) {
        out.push(allPages(pageCount).slice(start - 1, start - 1 + size));
      }
      return out;
    }
    return parseRangeGroups(rangeText, pageCount);
  }, [every, mode, pageCount, rangeText]);

  const rangeInvalid = mode === "ranges" && groups === null;
  const busy = ft.status === "processing";

  async function split() {
    if (!groups || groups.length === 0) return;
    await ft.run(async ([input], context) => {
      const { splitPdf } = await import("@/lib/pdf/edit");
      return splitPdf(input, groups, { ...context, maxPages: ft.limits.maxPages });
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

      {file && ft.status !== "done" && (
        <>
          <SingleFileRow
            file={file}
            meta={pageCount ? `${pageCount} ${pageCount === 1 ? "page" : "pages"}` : "reading…"}
            onRemove={ft.clear}
            disabled={busy}
          />

          {pageCount > 0 && (
            <>
              <RadioCards<Mode>
                name="split-mode"
                legend="How to split"
                value={mode}
                onChange={setMode}
                disabled={busy}
                options={[
                  {
                    value: "ranges",
                    label: "Custom ranges",
                    description: "Choose exactly which pages go in each file.",
                  },
                  {
                    value: "each",
                    label: "Every page",
                    description: `One file per page — ${pageCount} files.`,
                  },
                  { value: "every", label: "Every N pages", description: "Fixed-size chunks, in order." },
                ]}
              />

              {mode === "ranges" && (
                <Field
                  label="Page ranges"
                  htmlFor={rangeId}
                  hint={`Separate files with commas, pages with a hyphen. Pages run from 1 to ${pageCount}.`}
                >
                  <Input
                    id={rangeId}
                    value={rangeText}
                    onChange={(event) => setRangeText(event.target.value)}
                    disabled={busy}
                    inputMode="numeric"
                    aria-invalid={rangeInvalid}
                    className="h-10 max-w-sm"
                  />
                </Field>
              )}

              {mode === "every" && (
                <Field label="Pages per file" htmlFor={everyId}>
                  <Input
                    id={everyId}
                    type="number"
                    min={1}
                    max={pageCount}
                    value={every}
                    onChange={(event) => setEvery(Number(event.target.value) || 1)}
                    disabled={busy}
                    className="h-10 w-28"
                  />
                </Field>
              )}

              <p className="text-muted-foreground text-sm" aria-live="polite">
                {rangeInvalid
                  ? "That range isn't valid — check the page numbers."
                  : groups && groups.length > 0
                    ? `This will create ${groups.length} ${groups.length === 1 ? "file" : "files"}.`
                    : "Enter at least one page range."}
              </p>
            </>
          )}
        </>
      )}

      <ToolFeedback tool={ft} processingLabel="Splitting your PDF…" />

      {file && ft.status !== "done" && pageCount > 0 && (
        <ProcessButton
          onClick={split}
          busy={busy}
          disabled={!groups || groups.length === 0}
          icon={<Scissors className="size-4" />}
        >
          Split PDF
        </ProcessButton>
      )}

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
