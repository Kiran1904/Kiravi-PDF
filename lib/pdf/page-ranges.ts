/**
 * Parses "1-3, 7, 10-12" into sorted, de-duplicated 1-based page numbers.
 * Returns null when the input has any token we cannot understand, so the UI
 * can show an inline hint instead of silently guessing.
 */
export function parsePageRanges(input: string, pageCount: number): number[] | null {
  const pages = new Set<number>();
  const tokens = input
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return [];

  for (const token of tokens) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(token);
    if (!match) return null;

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end < start || end > pageCount) return null;

    for (let page = start; page <= end; page += 1) pages.add(page);
  }

  return [...pages].sort((a, b) => a - b);
}

/** Groups "1-3, 7, 10-12" into separate runs: [[1,2,3],[7],[10,11,12]]. */
export function parseRangeGroups(input: string, pageCount: number): number[][] | null {
  const groups: number[][] = [];
  const tokens = input
    .split(/,/)
    .map((token) => token.trim())
    .filter(Boolean);

  for (const token of tokens) {
    const pages = parsePageRanges(token, pageCount);
    if (pages === null) return null;
    if (pages.length > 0) groups.push(pages);
  }
  return groups;
}

/** [1,2,3,7,10,11,12] -> "1-3, 7, 10-12" */
export function formatPageRanges(pages: readonly number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts: string[] = [];
  let start: number | null = null;
  let previous: number | null = null;

  for (const page of sorted) {
    if (start === null) {
      start = page;
    } else if (previous !== null && page !== previous + 1) {
      parts.push(start === previous ? `${start}` : `${start}-${previous}`);
      start = page;
    }
    previous = page;
  }
  if (start !== null && previous !== null) {
    parts.push(start === previous ? `${start}` : `${start}-${previous}`);
  }
  return parts.join(", ");
}

export function allPages(pageCount: number): number[] {
  return Array.from({ length: pageCount }, (_, index) => index + 1);
}
