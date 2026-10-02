import { expect, test } from "@playwright/test";

import {
  clickDownload,
  fixture,
  fixtureBuffer,
  guardPage,
  jpegFixture,
  pdfPageCount,
  readDownload,
  ready,
  zipEntries,
  isPng,
} from "./helpers";

const upload = (
  page: import("@playwright/test").Page,
  files: Parameters<import("@playwright/test").Locator["setInputFiles"]>[0],
) => page.locator('input[type="file"]').setInputFiles(files);

test.describe("Split PDF", () => {
  test("splits every page into its own file and zips them", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/split-pdf");
    await upload(page, fixture("c-12pages.pdf"));
    await expect(page.getByText("12 pages")).toBeVisible();

    await page.getByLabel("Every page").check();
    await expect(page.getByText("This will create 12 files.")).toBeVisible();
    await page.getByRole("button", { name: "Split PDF", exact: true }).click();
    await expect(ready(page)).toHaveText(/12 files are ready/);

    const download = await clickDownload(page, "Download all as ZIP");
    expect(download.suggestedFilename()).toBe("split-pdf.zip");
    const entries = await zipEntries(await readDownload(download));
    expect(entries).toHaveLength(12);
    expect(entries).toContain("c-12pages-page-7.pdf");
    guard.assertClean();
  });

  test("custom ranges produce the right documents and bad ranges are flagged", async ({ page }) => {
    await page.goto("/pdf/split-pdf");
    await upload(page, fixture("c-12pages.pdf"));
    const ranges = page.getByLabel("Page ranges");
    await expect(ranges).toHaveValue("1-6, 7-12");

    await ranges.fill("1-3, 10-12");
    await expect(page.getByText("This will create 2 files.")).toBeVisible();

    await ranges.fill("1-3, 99");
    await expect(page.getByText("That range isn't valid — check the page numbers.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Split PDF", exact: true })).toBeDisabled();

    await ranges.fill("4-5");
    await page.getByRole("button", { name: "Split PDF", exact: true }).click();
    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("c-12pages-pages-4-5.pdf");
    expect(await pdfPageCount(await readDownload(download))).toBe(2);
  });
});

test.describe("Compress PDF", () => {
  test("re-encodes a scanned PDF and reports the saving honestly", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/compress-pdf");
    await upload(page, fixture("scan-2pages.pdf"));
    await expect(page.getByText(/original size/)).toBeVisible();
    await expect(page.getByText("This level re-encodes pages as images")).toBeVisible();

    await page.getByRole("button", { name: "Compress PDF", exact: true }).click();
    await expect(ready(page)).toBeVisible();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();

    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("scan-2pages-compressed.pdf");
    const bytes = await readDownload(download);
    expect(await pdfPageCount(bytes)).toBe(2);
    expect(bytes.length).toBeLessThanOrEqual(1626674);
    guard.assertClean();
  });

  test("light mode never returns a bigger file than the original", async ({ page }) => {
    await page.goto("/pdf/compress-pdf");
    await upload(page, fixture("a-3pages.pdf"));
    await page.getByLabel("Light").check();
    await expect(page.getByText(/Light mode rewrites the file/)).toBeVisible();
    await page.getByRole("button", { name: "Compress PDF", exact: true }).click();
    await expect(ready(page)).toBeVisible();
    const bytes = await readDownload(await clickDownload(page));
    expect(bytes.length).toBeLessThanOrEqual(1776);
    expect(await pdfPageCount(bytes)).toBe(3);
  });
});

test.describe("PDF to Text", () => {
  test("extracts the text layer with page markers and downloads a .txt", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/pdf-to-text");
    await upload(page, fixture("a-3pages.pdf"));
    await page.getByRole("button", { name: "Extract Text", exact: true }).click();

    const text = page.getByRole("textbox", { name: "Extracted text" });
    await expect(text).toHaveValue(/Document A — page 1 of 3/);
    await expect(text).toHaveValue(/--- Page 3 ---/);
    await expect(page.getByText(/3 pages · \d+ words/)).toBeVisible();

    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("a-3pages.txt");
    expect((await readDownload(download)).toString("utf8")).toContain("page 2 of 3");
    guard.assertClean();
  });

  test("tells the user plainly when a PDF is a scan with no text layer", async ({ page }) => {
    await page.goto("/pdf/pdf-to-text");
    await upload(page, fixture("scan-2pages.pdf"));
    await page.getByRole("button", { name: "Extract Text", exact: true }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "No text could be found in this PDF" }),
    ).toBeVisible();
    await expect(page.getByText("Scanned pages need optical character recognition")).toBeVisible();
  });
});

test.describe("Images to PDF", () => {
  test("builds one page per image in order", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/jpg-to-pdf");
    await upload(page, [await fixtureBuffer("photo.png", "image/png"), await jpegFixture(page)]);
    await expect(page.getByText("2 images · one page each")).toBeVisible();
    await page.getByLabel("Page size").selectOption("letter");
    await page.getByRole("button", { name: "Create PDF", exact: true }).click();
    await expect(ready(page)).toBeVisible();

    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("images.pdf");
    expect(await pdfPageCount(await readDownload(download))).toBe(2);
    guard.assertClean();
  });

  test("the image-tools route accepts the wider format set", async ({ page }) => {
    await page.goto("/image/image-to-pdf");
    await upload(page, fixture("photo.png"));
    await page.getByRole("button", { name: "Create PDF", exact: true }).click();
    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("photo.pdf");
    expect(await pdfPageCount(await readDownload(download))).toBe(1);
  });
});

test.describe("PDF to JPG / PNG", () => {
  test("renders selected pages to JPG with previews and a ZIP", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/pdf-to-jpg");
    await upload(page, fixture("a-3pages.pdf"));
    await expect(page.getByText("3 of 3 pages selected")).toBeVisible();

    const grid = page.locator('ul[aria-label="Pages"]');
    await grid.scrollIntoViewIfNeeded();
    await expect(grid.locator("img").first()).toBeVisible();

    await page.getByRole("checkbox", { name: "Page 2, selected", exact: true }).click();
    await expect(page.getByText("2 of 3 pages selected")).toBeVisible();

    await page.getByRole("button", { name: "Convert to JPG", exact: true }).click();
    await expect(ready(page)).toHaveText(/2 files are ready/);
    await expect(page.getByRole("img", { name: "Preview of a-3pages-page-1.jpg" })).toBeVisible();

    const download = await clickDownload(page, "Download all as ZIP");
    expect(await zipEntries(await readDownload(download))).toEqual([
      "a-3pages-page-1.jpg",
      "a-3pages-page-3.jpg",
    ]);
    guard.assertClean();
  });

  test("renders a single page to PNG via a typed range", async ({ page }) => {
    await page.goto("/pdf/pdf-to-png");
    await upload(page, fixture("a-3pages.pdf"));
    await expect(page.getByText("3 of 3 pages selected")).toBeVisible();
    await page.getByRole("button", { name: "None", exact: true }).click();
    await expect(page.getByRole("button", { name: "Convert to PNG", exact: true })).toBeDisabled();
    await page.getByLabel("Pages to convert").fill("2");
    await expect(page.getByText("1 of 3 pages selected")).toBeVisible();
    await page.getByRole("button", { name: "Convert to PNG", exact: true }).click();
    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("a-3pages-page-2.png");
    expect(isPng(await readDownload(download))).toBe(true);
  });
});

test.describe("Rotate PDF", () => {
  test("rotates one page and writes the rotation into the PDF", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/rotate-pdf");
    await upload(page, fixture("a-3pages.pdf"));
    await expect(page.getByRole("button", { name: "Save PDF", exact: true })).toBeDisabled();

    await page.getByRole("button", { name: "Rotate page 2 right", exact: true }).click();
    await expect(page.locator('ul[aria-label="Pages"]').getByText("90°")).toBeVisible();
    await page.getByRole("button", { name: "Save PDF", exact: true }).click();
    await expect(ready(page)).toBeVisible();

    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("a-3pages-rotated.pdf");
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(await readDownload(download));
    expect(doc.getPages().map((p) => p.getRotation().angle)).toEqual([0, 90, 0]);
    guard.assertClean();
  });

  test("rotate all applies to every page", async ({ page }) => {
    await page.goto("/pdf/rotate-pdf");
    await upload(page, fixture("a-3pages.pdf"));
    await page.getByRole("button", { name: "Rotate left", exact: true }).click();
    await page.getByRole("button", { name: "Save PDF", exact: true }).click();
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(await readDownload(await clickDownload(page)));
    expect(doc.getPages().map((p) => p.getRotation().angle)).toEqual([270, 270, 270]);
  });
});

test.describe("Delete / Extract pages", () => {
  test("deletes a selected page", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/delete-pages");
    await upload(page, fixture("a-3pages.pdf"));
    await expect(page.getByText("0 of 3 pages selected")).toBeVisible();

    await page.getByRole("checkbox", { name: "Page 1", exact: true }).click();
    await expect(page.getByText("2 pages will be kept.")).toBeVisible();
    await page.getByRole("button", { name: "Delete 1 page", exact: true }).click();
    await expect(ready(page)).toBeVisible();

    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("a-3pages-trimmed.pdf");
    expect(await pdfPageCount(await readDownload(download))).toBe(2);
    guard.assertClean();
  });

  test("refuses to delete every page", async ({ page }) => {
    await page.goto("/pdf/delete-pages");
    await upload(page, fixture("a-3pages.pdf"));
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.getByText("A PDF needs at least one page")).toBeVisible();
    await expect(page.getByRole("button", { name: /Delete 3 pages/ })).toBeDisabled();
  });

  test("extracts a typed range into a new PDF, or into separate files", async ({ page }) => {
    await page.goto("/pdf/extract-pages");
    await upload(page, fixture("c-12pages.pdf"));
    await page.getByLabel("Pages to extract").fill("2-4");
    await expect(page.getByText("3 pages will be saved to a new PDF.")).toBeVisible();
    await page.getByRole("button", { name: "Extract Pages", exact: true }).click();
    const download = await clickDownload(page);
    expect(download.suggestedFilename()).toBe("c-12pages-extracted.pdf");
    expect(await pdfPageCount(await readDownload(download))).toBe(3);

    await page.getByRole("button", { name: "Start over", exact: true }).click();
    await upload(page, fixture("c-12pages.pdf"));
    await page.getByLabel("Pages to extract").fill("2-4");
    await page.getByLabel("Save each page as its own PDF").check();
    await expect(page.getByText("3 pages will be saved as separate files.")).toBeVisible();
    await page.getByRole("button", { name: "Extract Pages", exact: true }).click();
    await expect(ready(page)).toHaveText(/3 files are ready/);
  });
});
