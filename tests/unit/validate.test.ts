import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import { detectKindFromHeader, validateFile, validateFiles } from "@/lib/files/validate";

const bytes = (...values: number[]) => new Uint8Array(values);
const file = (data: Uint8Array | string, name = "x.pdf", type = "application/pdf") =>
  new File([(typeof data === "string" ? new TextEncoder().encode(data) : data) as BlobPart], name, { type });

const PDF = file("%PDF-1.7\n%âãÏÓ\n1 0 obj");
const JPEG = file(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46), "a.jpg", "image/jpeg");
const PNG = file(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0), "a.png", "image/png");
const WEBP = file(
  bytes(0x52, 0x49, 0x46, 0x46, 0x10, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20),
  "a.webp",
  "image/webp",
);

describe("detectKindFromHeader", () => {
  it("recognises every supported signature", () => {
    expect(detectKindFromHeader(new TextEncoder().encode("%PDF-1.4"))).toBe("pdf");
    expect(detectKindFromHeader(bytes(0xff, 0xd8, 0xff, 0xdb))).toBe("jpeg");
    expect(detectKindFromHeader(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(detectKindFromHeader(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe("gif");
    expect(detectKindFromHeader(bytes(0x42, 0x4d, 0, 0))).toBe("bmp");
  });
  it("requires WEBP after RIFF, not any RIFF container", () => {
    expect(
      detectKindFromHeader(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45)),
    ).toBeNull();
    expect(detectKindFromHeader(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe(
      "webp",
    );
  });
  it("returns null for unknown or short input", () => {
    expect(detectKindFromHeader(new TextEncoder().encode("hello"))).toBeNull();
    expect(detectKindFromHeader(bytes())).toBeNull();
    expect(detectKindFromHeader(bytes(0x25, 0x50))).toBeNull();
  });
});

describe("validateFile", () => {
  const limits = { maxBytes: 1024 };

  it("accepts a file whose bytes match an allowed kind", async () => {
    await expect(validateFile(PDF, { allowedKinds: ["pdf"], expected: "a PDF file", limits })).resolves.toBe(
      "pdf",
    );
    await expect(validateFile(WEBP, { allowedKinds: ["webp"], expected: "x", limits })).resolves.toBe("webp");
  });

  it("ignores the extension and MIME type and trusts the bytes", async () => {
    const disguised = file(bytes(0xff, 0xd8, 0xff, 0xe0), "report.pdf", "application/pdf");
    await expect(
      validateFile(disguised, { allowedKinds: ["pdf"], expected: "a PDF file", limits }),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_TYPE",
    });
    await expect(validateFile(disguised, { allowedKinds: ["jpeg"], expected: "x", limits })).resolves.toBe(
      "jpeg",
    );
  });

  it("rejects empty files before reading them", async () => {
    await expect(
      validateFile(file(""), { allowedKinds: ["pdf"], expected: "x", limits }),
    ).rejects.toMatchObject({
      code: "EMPTY_FILE",
    });
  });

  it("rejects oversized files with the limit in the message", async () => {
    const big = file(new Uint8Array(2048), "big.pdf");
    const error = await validateFile(big, { allowedKinds: ["pdf"], expected: "x", limits }).catch(
      (e: AppError) => e,
    );
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("FILE_TOO_LARGE");
    expect((error as AppError).context.limit).toBe("1 KB");
  });

  it("rejects a type that is valid but not allowed for this tool", async () => {
    await expect(
      validateFile(PNG, { allowedKinds: ["jpeg"], expected: "a JPG file", limits }),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_TYPE",
      context: { expected: "a JPG file" },
    });
  });
});

describe("validateFiles", () => {
  it("keeps good files and reports bad ones individually", async () => {
    const result = await validateFiles([PDF, JPEG, file("")], {
      allowedKinds: ["pdf"],
      expected: "a PDF file",
      limits: { maxBytes: 1024 },
      maxFiles: 10,
    });
    expect(result.accepted).toEqual([PDF]);
    expect(result.rejected.map((r) => r.error.code)).toEqual(["UNSUPPORTED_TYPE", "EMPTY_FILE"]);
  });

  it("enforces the batch ceiling including files already selected", async () => {
    const result = await validateFiles([PDF, PDF], {
      allowedKinds: ["pdf"],
      expected: "x",
      limits: { maxBytes: 1024 },
      maxFiles: 3,
      existingCount: 2,
    });
    expect(result.accepted).toHaveLength(1);
    expect(result.rejected[0].error.code).toBe("TOO_MANY_FILES");
  });
});
