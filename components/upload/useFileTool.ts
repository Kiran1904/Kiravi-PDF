"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { track } from "@/lib/analytics";
import { normalizeError, userMessage } from "@/lib/errors";
import { downloadAsZip, downloadBlob, type ResultFile } from "@/lib/files/download";
import { expectedLabel, kindsForTool } from "@/lib/files/kinds";
import { getToolLimits } from "@/lib/files/limits";
import { validateFiles } from "@/lib/files/validate";
import type { Tool } from "@/lib/tools/registry";

export type ToolStatus = "idle" | "ready" | "processing" | "done" | "error";

export interface ProcessContext {
  /** Report progress so the UI can show a determinate bar */
  onProgress: (done: number, total: number) => void;
  /** Resolves on the next frame; call between heavy items to keep the UI alive */
  yieldToUi: () => Promise<void>;
}

export type ProcessFn = (files: File[], context: ProcessContext) => Promise<ResultFile[]>;

export interface Progress {
  done: number;
  total: number;
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });

/**
 * The state machine every tool shares: validate -> hold files -> process ->
 * expose results or one friendly error. Tool components supply only the
 * `process` function, so none of this is duplicated per tool.
 */
export function useFileTool(tool: Tool) {
  const limits = getToolLimits(tool);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ResultFile[]>([]);
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const resultUrls = useRef<string[]>([]);

  useEffect(() => {
    track({ name: "tool_viewed", tool: tool.slug });
  }, [tool.slug]);

  const releaseResults = useCallback(() => {
    for (const url of resultUrls.current) URL.revokeObjectURL(url);
    resultUrls.current = [];
    setResults([]);
  }, []);

  const addFiles = useCallback(
    async (incoming: FileList | File[] | null) => {
      const list = incoming ? Array.from(incoming) : [];
      if (list.length === 0) return;

      setError(null);
      setWarnings([]);
      releaseResults();
      setStatus("idle");

      const existing = tool.multiple ? files : [];
      const { accepted, rejected } = await validateFiles(list, {
        allowedKinds: kindsForTool(tool),
        expected: expectedLabel(tool),
        limits,
        maxFiles: tool.multiple ? limits.maxFiles : 1,
        existingCount: existing.length,
      });

      if (rejected.length > 0) {
        setWarnings(rejected.map(({ file, error: rejection }) => `${file.name}: ${userMessage(rejection)}`));
        for (const { error: rejection } of rejected) {
          track({ name: "file_rejected", tool: tool.slug, errorCode: rejection.code });
        }
      }

      if (accepted.length === 0) {
        if (existing.length === 0) setStatus("idle");
        return;
      }

      const next = tool.multiple ? [...existing, ...accepted] : [accepted[0]];
      setFiles(next);
      setStatus("ready");
      track({
        name: "file_selected",
        tool: tool.slug,
        fileCount: accepted.length,
        totalBytes: accepted.reduce((sum, file) => sum + file.size, 0),
      });
    },
    [files, limits, releaseResults, tool],
  );

  const removeFile = useCallback(
    (index: number) => {
      releaseResults();
      setError(null);
      setFiles((current) => {
        const next = current.filter((_, position) => position !== index);
        setStatus(next.length > 0 ? "ready" : "idle");
        return next;
      });
    },
    [releaseResults],
  );

  const moveFile = useCallback(
    (from: number, to: number) => {
      releaseResults();
      setFiles((current) => {
        if (to < 0 || to >= current.length || from === to) return current;
        const next = [...current];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    },
    [releaseResults],
  );

  const clear = useCallback(() => {
    releaseResults();
    setFiles([]);
    setError(null);
    setWarnings([]);
    setProgress(null);
    setStatus("idle");
  }, [releaseResults]);

  const run = useCallback(
    async (process: ProcessFn) => {
      if (files.length === 0) return;

      releaseResults();
      setError(null);
      setStatus("processing");
      setProgress({ done: 0, total: files.length });
      track({ name: "processing_started", tool: tool.slug, fileCount: files.length });
      const startedAt = Date.now();

      try {
        const output = await process(files, {
          onProgress: (done, total) => setProgress({ done, total }),
          yieldToUi: nextFrame,
        });

        const withPreviews = output.map((file) => {
          if (!file.previewUrl && file.blob.type.startsWith("image/")) {
            const url = URL.createObjectURL(file.blob);
            resultUrls.current.push(url);
            return { ...file, previewUrl: url };
          }
          return file;
        });

        setResults(withPreviews);
        setStatus("done");
        setProgress(null);
        track({
          name: "processing_completed",
          tool: tool.slug,
          durationMs: Date.now() - startedAt,
          outputCount: withPreviews.length,
        });
      } catch (caught) {
        const appError = normalizeError(caught);
        setError(userMessage(appError));
        setStatus("error");
        setProgress(null);
        track({ name: "processing_failed", tool: tool.slug, errorCode: appError.code });
      }
    },
    [files, releaseResults, tool.slug],
  );

  const download = useCallback(
    (result: ResultFile) => {
      downloadBlob(result.blob, result.name);
      track({ name: "download_clicked", tool: tool.slug, asZip: false });
    },
    [tool.slug],
  );

  const downloadAll = useCallback(async () => {
    if (results.length === 0) return;
    if (results.length === 1) {
      download(results[0]);
      return;
    }
    await downloadAsZip(results, `${tool.slug}.zip`);
    track({ name: "download_clicked", tool: tool.slug, asZip: true });
  }, [download, results, tool.slug]);

  /** Shows a failure that happened outside `run`, e.g. while reading page counts. */
  const fail = useCallback(
    (caught: unknown) => {
      const appError = normalizeError(caught);
      setError(userMessage(appError));
      setStatus("error");
      setProgress(null);
      track({ name: "processing_failed", tool: tool.slug, errorCode: appError.code });
    },
    [tool.slug],
  );

  return {
    limits,
    files,
    results,
    status,
    error,
    warnings,
    progress,
    addFiles,
    removeFile,
    moveFile,
    clear,
    run,
    fail,
    download,
    downloadAll,
    dismissWarnings: () => setWarnings([]),
  };
}
