/**
 * Closed set of failures a tool can surface. Anything a library throws is
 * normalised into one of these before it reaches the UI, so stack traces,
 * internal messages and file paths never get rendered.
 */
export type ErrorCode =
  | "UNSUPPORTED_TYPE"
  | "CORRUPT_FILE"
  | "ENCRYPTED_PDF"
  | "FILE_TOO_LARGE"
  | "TOO_MANY_PAGES"
  | "EMPTY_FILE"
  | "TOO_MANY_FILES"
  | "NOT_ENOUGH_FILES"
  | "NO_PAGES_SELECTED"
  | "NO_TEXT_LAYER"
  | "OUT_OF_MEMORY"
  | "BROWSER_UNSUPPORTED"
  | "PROCESSING_FAILED";

export interface ErrorContext {
  /** Human-readable description of what was expected, e.g. "a PDF file" */
  expected?: string;
  /** Formatted limit, e.g. "100 MB" or "500 pages" */
  limit?: string;
  /** File name, used only in the message shown to the user who chose it */
  fileName?: string;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly context: ErrorContext;

  constructor(code: ErrorCode, context: ErrorContext = {}) {
    super(code);
    this.name = "AppError";
    this.code = code;
    this.context = context;
  }
}

const MESSAGES: Record<ErrorCode, (context: ErrorContext) => string> = {
  UNSUPPORTED_TYPE: ({ expected }) =>
    `This file type isn't supported. Please choose ${expected ?? "a supported file"}.`,
  CORRUPT_FILE: () =>
    "This file looks damaged and couldn't be read. Try opening it in another app and saving a fresh copy.",
  ENCRYPTED_PDF: () =>
    "This PDF is password-protected. Remove the password in your PDF reader, then try again.",
  FILE_TOO_LARGE: ({ limit }) =>
    `This file is larger than the supported limit${limit ? ` of ${limit}` : ""}.`,
  TOO_MANY_PAGES: ({ limit }) =>
    `This PDF has more pages than we can process in the browser${limit ? ` (limit ${limit})` : ""}. Try splitting it first.`,
  EMPTY_FILE: () => "This file is empty. Please choose a different one.",
  TOO_MANY_FILES: ({ limit }) =>
    `That's more files than this tool can handle at once${limit ? ` (limit ${limit})` : ""}. Please remove a few.`,
  NOT_ENOUGH_FILES: () => "Please add at least two files to continue.",
  NO_PAGES_SELECTED: () => "Please select at least one page to continue.",
  NO_TEXT_LAYER: () =>
    "No text could be found in this PDF. It's most likely a scan, which stores pages as images rather than text.",
  OUT_OF_MEMORY: () =>
    "Your browser ran out of memory on this file. Try a smaller file, or close some other tabs and try again.",
  BROWSER_UNSUPPORTED: () =>
    "Your browser doesn't support this tool. Please try a recent version of Chrome, Safari, Firefox or Edge.",
  PROCESSING_FAILED: () => "Something went wrong while processing your file. Please try again.",
};

/** The one sentence a user is allowed to see for a failure. */
export function userMessage(error: unknown, fallbackContext: ErrorContext = {}): string {
  if (error instanceof AppError) {
    return MESSAGES[error.code]({ ...fallbackContext, ...error.context });
  }
  return MESSAGES.PROCESSING_FAILED(fallbackContext);
}

export function errorCode(error: unknown): ErrorCode {
  return error instanceof AppError ? error.code : "PROCESSING_FAILED";
}

/**
 * Turns whatever a processing library threw into an AppError. Library messages
 * are inspected but never forwarded.
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const text = raw.toLowerCase();

  if (text.includes("encrypted") || text.includes("password")) {
    return new AppError("ENCRYPTED_PDF");
  }
  if (
    text.includes("invalid pdf") ||
    text.includes("no pdf header") ||
    text.includes("failed to parse") ||
    text.includes("invalidpdfexception")
  ) {
    return new AppError("CORRUPT_FILE");
  }
  if (
    error instanceof RangeError ||
    text.includes("out of memory") ||
    text.includes("allocation size overflow") ||
    text.includes("array buffer allocation failed")
  ) {
    return new AppError("OUT_OF_MEMORY");
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[kiravi] unhandled processing error:", error);
  }
  return new AppError("PROCESSING_FAILED");
}
