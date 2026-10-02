import { AppError } from "@/lib/errors";
import { formatBytes } from "./format";
import type { ToolLimits } from "./limits";

/**
 * `File.type` comes from the OS extension map: it is frequently empty, is
 * sometimes wrong, and is trivially faked by renaming a file. So the real check
 * is the file's own signature bytes.
 */
export type FileKind = "pdf" | "jpeg" | "png" | "webp" | "gif" | "bmp";

const SIGNATURES: ReadonlyArray<{
  kind: FileKind;
  bytes: readonly number[];
  offset?: number;
  /** Extra bytes that must match further into the header (e.g. WEBP in RIFF) */
  also?: { offset: number; bytes: readonly number[] };
}> = [
  { kind: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { kind: "jpeg", bytes: [0xff, 0xd8, 0xff] },
  { kind: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  {
    kind: "webp",
    bytes: [0x52, 0x49, 0x46, 0x46], // RIFF
    also: { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
  },
  { kind: "gif", bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { kind: "bmp", bytes: [0x42, 0x4d] }, // BM
];

const HEADER_BYTES = 16;

export function detectKindFromHeader(header: Uint8Array): FileKind | null {
  for (const signature of SIGNATURES) {
    const offset = signature.offset ?? 0;
    if (!matches(header, offset, signature.bytes)) continue;
    if (signature.also && !matches(header, signature.also.offset, signature.also.bytes)) {
      continue;
    }
    return signature.kind;
  }
  return null;
}

function matches(header: Uint8Array, offset: number, bytes: readonly number[]): boolean {
  if (header.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => header[offset + index] === byte);
}

/** Reads only the first bytes — the whole file is never pulled into memory here. */
export async function readFileKind(file: File): Promise<FileKind | null> {
  const header = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
  return detectKindFromHeader(header);
}

export interface ValidateOptions {
  /** Kinds this tool can actually process */
  allowedKinds: readonly FileKind[];
  /** Phrase for the error message, e.g. "a PDF file" */
  expected: string;
  limits: Pick<ToolLimits, "maxBytes">;
}

/**
 * Throws the first problem found. Size and emptiness are checked before the
 * header read so a 2 GB file is rejected without touching its contents.
 */
export async function validateFile(file: File, options: ValidateOptions): Promise<FileKind> {
  if (file.size === 0) {
    throw new AppError("EMPTY_FILE", { fileName: file.name });
  }
  if (file.size > options.limits.maxBytes) {
    throw new AppError("FILE_TOO_LARGE", {
      fileName: file.name,
      limit: formatBytes(options.limits.maxBytes, 0),
    });
  }

  const kind = await readFileKind(file);
  if (!kind || !options.allowedKinds.includes(kind)) {
    throw new AppError("UNSUPPORTED_TYPE", {
      fileName: file.name,
      expected: options.expected,
    });
  }
  return kind;
}

export interface ValidationResult {
  accepted: File[];
  /** One friendly sentence per rejected file, ready to display */
  rejected: { file: File; error: AppError }[];
}

/** Validates a batch, keeping the good files rather than failing the whole drop. */
export async function validateFiles(
  files: readonly File[],
  options: ValidateOptions & { maxFiles: number; existingCount?: number },
): Promise<ValidationResult> {
  const accepted: File[] = [];
  const rejected: ValidationResult["rejected"] = [];
  let count = options.existingCount ?? 0;

  for (const file of files) {
    if (count >= options.maxFiles) {
      rejected.push({
        file,
        error: new AppError("TOO_MANY_FILES", {
          fileName: file.name,
          limit: String(options.maxFiles),
        }),
      });
      continue;
    }
    try {
      await validateFile(file, options);
      accepted.push(file);
      count += 1;
    } catch (error) {
      rejected.push({
        file,
        error:
          error instanceof AppError
            ? error
            : new AppError("UNSUPPORTED_TYPE", { expected: options.expected }),
      });
    }
  }

  return { accepted, rejected };
}
