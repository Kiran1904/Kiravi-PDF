import { expect, test } from "@playwright/test";

import { fixture, guardPage, pdfPageCount, readDownload } from "./helpers";

test.describe("Merge PDF", () => {
  test("merges two PDFs into one download with all pages", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/merge-pdf");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Merge PDF");
    await expect(page.getByText("processed in your browser", { exact: false }).first()).toBeVisible();

    const mergeButton = page.getByRole("button", { name: "Merge PDF", exact: true });
    await expect(mergeButton).toBeHidden();

    await page
      .locator('input[type="file"]')
      .setInputFiles([fixture("a-3pages.pdf"), fixture("b-2pages.pdf")]);

    await expect(page.getByText("a-3pages.pdf", { exact: true })).toBeVisible();
    await expect(page.getByText("b-2pages.pdf", { exact: true })).toBeVisible();
    await expect(page.getByText(/KB · 3 pages/)).toBeVisible();
    await expect(mergeButton).toBeEnabled();

    await mergeButton.click();
    await expect(page.getByRole("heading", { name: /your file is ready/i })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download", exact: true }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("a-3pages-merged.pdf");
    expect(await pdfPageCount(await readDownload(download))).toBe(5);
    guard.assertClean();
  });

  test("reorders files with the keyboard-accessible buttons", async ({ page }) => {
    await page.goto("/pdf/merge-pdf");
    await page
      .locator('input[type="file"]')
      .setInputFiles([fixture("a-3pages.pdf"), fixture("b-2pages.pdf")]);

    await page.getByRole("button", { name: "Move b-2pages.pdf up", exact: true }).click();
    const names = await page
      .getByRole("list", { name: "Selected files" })
      .getByRole("listitem")
      .allInnerTexts();
    expect(names[0]).toContain("b-2pages.pdf");

    await page.getByRole("button", { name: "Merge PDF", exact: true }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download", exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe("b-2pages-merged.pdf");
  });

  test("rejects a renamed text file and an empty file with friendly messages", async ({ page }) => {
    const guard = guardPage(page);
    await page.goto("/pdf/merge-pdf");

    await page.locator('input[type="file"]').setInputFiles([fixture("not-a-pdf.pdf"), fixture("empty.pdf")]);

    await expect(page.getByText("2 files were skipped")).toBeVisible();
    await expect(page.getByText(/isn't supported\. Please choose a PDF file/)).toBeVisible();
    await expect(page.getByText(/This file is empty/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Merge PDF", exact: true })).toBeHidden();
    guard.assertClean();
  });

  test("removing a file disables merge again", async ({ page }) => {
    await page.goto("/pdf/merge-pdf");
    await page
      .locator('input[type="file"]')
      .setInputFiles([fixture("a-3pages.pdf"), fixture("b-2pages.pdf")]);
    await page.getByRole("button", { name: "Remove b-2pages.pdf", exact: true }).click();
    await expect(page.getByRole("button", { name: "Merge PDF", exact: true })).toBeDisabled();
    await expect(page.getByText("Add at least one more PDF to merge.")).toBeVisible();
  });
});
