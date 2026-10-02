import { AppError } from "@/lib/errors";
import { closePdf, openPdf } from "./pdfjs";
import { assertPageBudget } from "./pdf-lib";

export interface ExtractedText {
  text: string;
  pageCount: number;
  /** Pages that produced no text at all — a strong hint of a scanned document */
  emptyPages: number;
  words: number;
}

export async function extractText(
  file: File,
  options: {
    maxPages?: number;
    onProgress?: (done: number, total: number) => void;
    yieldToUi?: () => Promise<void>;
  } = {},
): Promise<ExtractedText> {
  const doc = await openPdf(file);
  try {
    assertPageBudget(doc.numPages, options.maxPages ?? 0);

    const chunks: string[] = [];
    let emptyPages = 0;

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      page.cleanup();

      const pageText = linesFromTextItems(content.items);
      if (pageText.trim().length === 0) emptyPages += 1;
      chunks.push(`--- Page ${pageNumber} ---\n${pageText}`);

      options.onProgress?.(pageNumber, doc.numPages);
      await options.yieldToUi?.();
    }

    if (emptyPages === doc.numPages) throw new AppError("NO_TEXT_LAYER");

    const text = chunks.join("\n\n");
    return {
      text,
      pageCount: doc.numPages,
      emptyPages,
      words: text.split(/\s+/).filter((word) => /\w/.test(word)).length,
    };
  } finally {
    await closePdf(doc);
  }
}

interface TextItemLike {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
}

/**
 * pdfjs returns positioned runs, not lines. A new line starts when the run's
 * baseline moves, or when the item says so; a space is inserted between runs
 * that sit on the same line but do not abut.
 */
function linesFromTextItems(items: readonly unknown[]): string {
  let output = "";
  let lastY: number | null = null;

  for (const raw of items) {
    const item = raw as TextItemLike;
    if (typeof item.str !== "string") continue;

    const y = item.transform ? Math.round(item.transform[5]) : null;
    if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
      output = output.replace(/[ \t]+$/, "") + "\n";
    } else if (
      output.length > 0 &&
      !output.endsWith("\n") &&
      !output.endsWith(" ") &&
      !item.str.startsWith(" ")
    ) {
      output += " ";
    }

    output += item.str;
    if (item.hasEOL) output += "\n";
    if (y !== null) lastY = y;
  }

  return output
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
