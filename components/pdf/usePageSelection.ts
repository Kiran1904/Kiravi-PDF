"use client";

import { useState } from "react";

import { allPages, formatPageRanges, parsePageRanges } from "@/lib/pdf/page-ranges";

interface SelectionState {
  pageCount: number;
  selected: ReadonlySet<number>;
  rangeText: string;
  rangeError: string | null;
}

function initial(pageCount: number, all: boolean): SelectionState {
  const pages = all ? allPages(pageCount) : [];
  return { pageCount, selected: new Set(pages), rangeText: formatPageRanges(pages), rangeError: null };
}

/**
 * Selection that stays in sync between thumbnail clicks and a typed range.
 * State is tagged with the page count it was made for, so a new document
 * starts fresh without an effect.
 */
export function usePageSelection(pageCount: number, initiallyAll = false) {
  const [state, setState] = useState<SelectionState>(() => initial(pageCount, initiallyAll));
  const current = state.pageCount === pageCount ? state : initial(pageCount, initiallyAll);

  const commit = (next: ReadonlySet<number>) =>
    setState({ pageCount, selected: next, rangeText: formatPageRanges([...next]), rangeError: null });

  const toggle = (pageNumber: number) => {
    const next = new Set(current.selected);
    if (next.has(pageNumber)) next.delete(pageNumber);
    else next.add(pageNumber);
    commit(next);
  };

  const setRange = (text: string) => {
    const pages = parsePageRanges(text, pageCount);
    setState({
      pageCount,
      selected: pages === null ? current.selected : new Set(pages),
      rangeText: text,
      rangeError: pages === null ? `Use page numbers between 1 and ${pageCount}, like 1-3, 7` : null,
    });
  };

  return {
    selected: current.selected,
    sortedPages: [...current.selected].sort((a, b) => a - b),
    rangeText: current.rangeText,
    rangeError: current.rangeError,
    toggle,
    selectAll: () => commit(new Set(allPages(pageCount))),
    clear: () => commit(new Set()),
    invert: () => commit(new Set(allPages(pageCount).filter((page) => !current.selected.has(page)))),
    setRange,
  };
}
