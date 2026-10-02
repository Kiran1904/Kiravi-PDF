/**
 * The only module allowed to import pdf-lib. Dynamic import keeps it out of
 * every page bundle until a tool needs to write a PDF.
 */
import { AppError } from "@/lib/errors";

type PdfLib = typeof import("pdf-lib");
export type PdfLibDocument = import("pdf-lib").PDFDocument;

let pdfLibPromise: Promise<PdfLib> | null = null;

export function loadPdfLib(): Promise<PdfLib> {
  if (!pdfLibPromise) pdfLibPromise = import("pdf-lib");
  return pdfLibPromise;
}

export async function loadDocument(file: File | ArrayBuffer | Uint8Array): Promise<PdfLibDocument> {
  const { PDFDocument } = await loadPdfLib();
  const bytes = file instanceof File ? await file.arrayBuffer() : file;

  try {
    return await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/encrypt/i.test(message)) throw new AppError("ENCRYPTED_PDF");
    throw new AppError("CORRUPT_FILE");
  }
}

export async function saveAsBlob(doc: PdfLibDocument): Promise<Blob> {
  const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export function assertPageBudget(pageCount: number, maxPages: number): void {
  if (pageCount === 0) throw new AppError("CORRUPT_FILE");
  if (maxPages > 0 && pageCount > maxPages) {
    throw new AppError("TOO_MANY_PAGES", { limit: `${maxPages} pages` });
  }
}
