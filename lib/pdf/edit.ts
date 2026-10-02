/**
 * Page-level operations built on pdf-lib's copyPages. Merge, split, extract,
 * delete and rotate are all variations of "copy these pages into a new doc",
 * which is why they live together.
 */
import { AppError } from "@/lib/errors";
import type { ResultFile } from "@/lib/files/download";
import { renameFile } from "@/lib/files/format";
import { assertPageBudget, loadDocument, loadPdfLib, saveAsBlob, type PdfLibDocument } from "./pdf-lib";

export interface PdfProgress {
  onProgress?: (done: number, total: number) => void;
  yieldToUi?: () => Promise<void>;
  maxPages?: number;
}

export async function mergePdfs(files: readonly File[], options: PdfProgress = {}): Promise<ResultFile> {
  if (files.length < 2) throw new AppError("NOT_ENOUGH_FILES");

  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();
  let totalPages = 0;

  for (const [index, file] of files.entries()) {
    const source = await loadDocument(file);
    totalPages += source.getPageCount();
    assertPageBudget(totalPages, options.maxPages ?? 0);

    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) merged.addPage(page);

    options.onProgress?.(index + 1, files.length);
    await options.yieldToUi?.();
  }

  return { name: renameFile(files[0].name, "-merged", "pdf"), blob: await saveAsBlob(merged) };
}

/** 1-based page numbers -> a new document containing only those pages, in order. */
export async function copyPagesToNewDocument(
  source: PdfLibDocument,
  pageNumbers: readonly number[],
): Promise<Blob> {
  if (pageNumbers.length === 0) throw new AppError("NO_PAGES_SELECTED");

  const { PDFDocument } = await loadPdfLib();
  const target = await PDFDocument.create();
  const pages = await target.copyPages(
    source,
    pageNumbers.map((pageNumber) => pageNumber - 1),
  );
  for (const page of pages) target.addPage(page);
  return saveAsBlob(target);
}

export async function extractPages(
  file: File,
  pageNumbers: readonly number[],
  options: PdfProgress & { separate?: boolean } = {},
): Promise<ResultFile[]> {
  const source = await loadDocument(file);
  assertPageBudget(source.getPageCount(), options.maxPages ?? 0);

  if (!options.separate) {
    return [
      {
        name: renameFile(file.name, "-extracted", "pdf"),
        blob: await copyPagesToNewDocument(source, pageNumbers),
      },
    ];
  }

  const results: ResultFile[] = [];
  for (const [index, pageNumber] of pageNumbers.entries()) {
    results.push({
      name: renameFile(file.name, `-page-${pageNumber}`, "pdf"),
      blob: await copyPagesToNewDocument(source, [pageNumber]),
    });
    options.onProgress?.(index + 1, pageNumbers.length);
    await options.yieldToUi?.();
  }
  return results;
}

export async function deletePages(
  file: File,
  pagesToDelete: readonly number[],
  options: PdfProgress = {},
): Promise<ResultFile> {
  const source = await loadDocument(file);
  const pageCount = source.getPageCount();
  assertPageBudget(pageCount, options.maxPages ?? 0);

  const remove = new Set(pagesToDelete);
  const keep: number[] = [];
  for (let page = 1; page <= pageCount; page += 1) if (!remove.has(page)) keep.push(page);
  if (keep.length === 0) throw new AppError("NO_PAGES_SELECTED");

  return { name: renameFile(file.name, "-trimmed", "pdf"), blob: await copyPagesToNewDocument(source, keep) };
}

export async function splitPdf(
  file: File,
  groups: readonly (readonly number[])[],
  options: PdfProgress = {},
): Promise<ResultFile[]> {
  if (groups.length === 0) throw new AppError("NO_PAGES_SELECTED");

  const source = await loadDocument(file);
  assertPageBudget(source.getPageCount(), options.maxPages ?? 0);

  const results: ResultFile[] = [];
  for (const [index, group] of groups.entries()) {
    const label = group.length === 1 ? `page-${group[0]}` : `pages-${group[0]}-${group[group.length - 1]}`;
    results.push({
      name: renameFile(file.name, `-${label}`, "pdf"),
      blob: await copyPagesToNewDocument(source, group),
    });
    options.onProgress?.(index + 1, groups.length);
    await options.yieldToUi?.();
  }
  return results;
}

/** Rotation is additive to whatever the page already carries, in 90° steps. */
export async function rotatePages(
  file: File,
  rotations: ReadonlyMap<number, number>,
  options: PdfProgress = {},
): Promise<ResultFile> {
  const { degrees } = await loadPdfLib();
  const doc = await loadDocument(file);
  assertPageBudget(doc.getPageCount(), options.maxPages ?? 0);

  doc.getPages().forEach((page, index) => {
    const delta = rotations.get(index + 1) ?? 0;
    if (delta % 360 === 0) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees((((current + delta) % 360) + 360) % 360));
  });

  return { name: renameFile(file.name, "-rotated", "pdf"), blob: await saveAsBlob(doc) };
}

export async function getPageCount(file: File): Promise<number> {
  const doc = await loadDocument(file);
  return doc.getPageCount();
}
