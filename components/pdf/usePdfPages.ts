"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { normalizeError, userMessage } from "@/lib/errors";
import type { PageThumbnail, PdfDocument } from "@/lib/pdf/pdfjs";

interface Loaded {
  file: File;
  pageCount: number;
  thumbnails: ReadonlyMap<number, PageThumbnail>;
  error: string | null;
}

const EMPTY: ReadonlyMap<number, PageThumbnail> = new Map();

/**
 * Opens a PDF once and renders page thumbnails on demand, one at a time, so a
 * thousand-page document costs nothing until its pages scroll into view.
 * State is tagged with the file it belongs to, so switching files needs no reset.
 */
export function usePdfPages(file: File | null, options: { maxPages: number }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const docRef = useRef<{ file: File; doc: PdfDocument } | null>(null);
  const queue = useRef<number[]>([]);
  const queued = useRef<Set<number>>(new Set());
  const draining = useRef(false);
  const { maxPages } = options;

  useEffect(() => {
    queue.current = [];
    queued.current.clear();
    if (!file) return;
    let cancelled = false;

    (async () => {
      const { openPdf, closePdf } = await import("@/lib/pdf/pdfjs");
      const { assertPageBudget } = await import("@/lib/pdf/pdf-lib");
      try {
        const doc = await openPdf(file);
        if (cancelled) {
          await closePdf(doc);
          return;
        }
        try {
          assertPageBudget(doc.numPages, maxPages);
        } catch (budget) {
          await closePdf(doc);
          throw budget;
        }
        docRef.current = { file, doc };
        setLoaded({ file, pageCount: doc.numPages, thumbnails: new Map(), error: null });
      } catch (caught) {
        if (!cancelled) {
          setLoaded({
            file,
            pageCount: 0,
            thumbnails: new Map(),
            error: userMessage(normalizeError(caught)),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      const current = docRef.current;
      if (current?.file === file) {
        docRef.current = null;
        void import("@/lib/pdf/pdfjs").then(({ closePdf }) => closePdf(current.doc));
      }
    };
  }, [file, maxPages]);

  const drain = useCallback(async () => {
    if (draining.current) return;
    draining.current = true;
    try {
      const { renderThumbnails } = await import("@/lib/pdf/pdfjs");
      while (queue.current.length > 0) {
        const current = docRef.current;
        const pageNumber = queue.current.shift();
        if (!current || pageNumber === undefined) break;
        try {
          const [thumbnail] = await renderThumbnails(current.doc, [pageNumber]);
          if (docRef.current !== current) break;
          setLoaded((state) =>
            state && state.file === current.file
              ? { ...state, thumbnails: new Map(state.thumbnails).set(pageNumber, thumbnail) }
              : state,
          );
        } catch {
          // A page that will not render still shows as a numbered tile.
        }
      }
    } finally {
      draining.current = false;
    }
  }, []);

  const requestThumbnail = useCallback(
    (pageNumber: number) => {
      if (queued.current.has(pageNumber)) return;
      queued.current.add(pageNumber);
      queue.current.push(pageNumber);
      void drain();
    },
    [drain],
  );

  const current = loaded && loaded.file === file ? loaded : null;

  return {
    pageCount: current?.pageCount ?? 0,
    thumbnails: current?.thumbnails ?? EMPTY,
    loading: Boolean(file) && !current,
    error: current?.error ?? null,
    requestThumbnail,
  };
}
