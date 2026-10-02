import { describe, expect, it } from "vitest";

import { formatBytes, reductionPercent, renameFile, safeFileName } from "@/lib/files/format";

describe("formatBytes", () => {
  it("picks the right unit", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatBytes(100 * 1024 * 1024, 0)).toBe("100 MB");
  });
  it("never crashes on bad input", () => {
    expect(formatBytes(-5)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
  });
});

it("reductionPercent", () => {
  expect(reductionPercent(1000, 250)).toBe(75);
  expect(reductionPercent(1000, 1200)).toBe(-20);
  expect(reductionPercent(0, 5)).toBe(0);
});

describe("renameFile", () => {
  it("adds a suffix and swaps the extension", () => {
    expect(renameFile("report.pdf", "-merged")).toBe("report-merged.pdf");
    expect(renameFile("scan.PDF", "-page-2", "jpg")).toBe("scan-page-2.jpg");
    expect(renameFile("noext", "-x", "pdf")).toBe("noext-x.pdf");
    expect(renameFile("archive.tar.gz", "", "pdf")).toBe("archive.tar.pdf");
  });
});

describe("safeFileName", () => {
  it("drops directories and odd characters", () => {
    expect(safeFileName("../../etc/passwd")).toBe("passwd");
    expect(safeFileName("C:\\Users\\me\\a b.pdf")).toBe("a b.pdf");
    expect(safeFileName('we"ird<>.png')).toBe("we_ird__.png");
    expect(safeFileName("")).toBe("file");
  });
});
