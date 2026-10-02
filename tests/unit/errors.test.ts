import { describe, expect, it } from "vitest";

import { AppError, errorCode, normalizeError, userMessage } from "@/lib/errors";

describe("userMessage", () => {
  it("renders a friendly sentence with context", () => {
    expect(userMessage(new AppError("UNSUPPORTED_TYPE", { expected: "a PDF file" }))).toBe(
      "This file type isn't supported. Please choose a PDF file.",
    );
    expect(userMessage(new AppError("FILE_TOO_LARGE", { limit: "100 MB" }))).toContain("100 MB");
  });

  it("never leaks a raw error message", () => {
    const raw = new Error("ENOENT /srv/private/path.pdf at pdf-lib/index.js:42");
    expect(userMessage(raw)).toBe("Something went wrong while processing your file. Please try again.");
    expect(userMessage(raw)).not.toContain("/srv");
  });
});

describe("normalizeError", () => {
  it("maps library failures to codes", () => {
    expect(normalizeError(new Error("Input document to `PDFDocument.load` is encrypted")).code).toBe(
      "ENCRYPTED_PDF",
    );
    expect(normalizeError(new Error("Failed to parse PDF document (line:0 col:0 offset=0)")).code).toBe(
      "CORRUPT_FILE",
    );
    expect(normalizeError(new RangeError("Array buffer allocation failed")).code).toBe("OUT_OF_MEMORY");
    expect(normalizeError("weird string").code).toBe("PROCESSING_FAILED");
    expect(errorCode(null)).toBe("PROCESSING_FAILED");
  });

  it("passes AppError through unchanged", () => {
    const error = new AppError("NO_TEXT_LAYER");
    expect(normalizeError(error)).toBe(error);
  });
});
