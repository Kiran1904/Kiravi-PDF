import { expect, test } from "@playwright/test";

import {
  clickDownload,
  fixture,
  guardPage,
  isJpeg,
  isPng,
  isWebp,
  jpegFixture,
  pngSize,
  readDownload,
  ready,
} from "./helpers";

const upload = (
  page: import("@playwright/test").Page,
  files: Parameters<import("@playwright/test").Locator["setInputFiles"]>[0],
) => page.locator('input[type="file"]').setInputFiles(files);

test("Compress Image converts a PNG to a much smaller WebP", async ({ page }) => {
  const guard = guardPage(page);
  await page.goto("/image/compress-image");
  await upload(page, fixture("photo.png"));
  await page.getByLabel("Convert to WebP").check();
  await page.getByRole("button", { name: "Compress Images", exact: true }).click();
  await expect(ready(page)).toBeVisible();
  await expect(page.getByText(/% smaller than the original/)).toBeVisible();

  const download = await clickDownload(page);
  expect(download.suggestedFilename()).toBe("photo-compressed.webp");
  const bytes = await readDownload(download);
  expect(isWebp(bytes)).toBe(true);
  expect(bytes.length).toBeLessThan(357361);
  guard.assertClean();
});

test("Compress Image rejects a file that is not an image", async ({ page }) => {
  await page.goto("/image/compress-image");
  await upload(page, fixture("not-a-pdf.pdf"));
  await expect(
    page.getByText(/isn't supported\. Please choose a JPG, PNG, WebP, GIF or BMP file/),
  ).toBeVisible();
});

test("Resize Image scales by width keeping the aspect ratio", async ({ page }) => {
  await page.goto("/image/resize-image");
  await upload(page, fixture("photo.png"));
  await expect(page.getByText("800×600")).toBeVisible();
  await expect(page.getByRole("button", { name: "Resize Images", exact: true })).toBeDisabled();
  await expect(page.getByText("Enter a width, a height, or both.")).toBeVisible();

  await page.getByLabel("Width (px)").fill("400");
  await page.getByRole("button", { name: "Resize Images", exact: true }).click();
  const download = await clickDownload(page);
  expect(download.suggestedFilename()).toBe("photo-resized.png");
  expect(pngSize(await readDownload(download))).toEqual({ width: 400, height: 300 });
});

test("Resize Image by percentage", async ({ page }) => {
  await page.goto("/image/resize-image");
  await upload(page, fixture("photo.png"));
  await page.getByLabel("Percentage").check();
  await page.getByLabel("Scale (%)").fill("25");
  await page.getByRole("button", { name: "Resize Images", exact: true }).click();
  expect(pngSize(await readDownload(await clickDownload(page)))).toEqual({ width: 200, height: 150 });
});

test("JPG to PNG", async ({ page }) => {
  await page.goto("/image/jpg-to-png");
  await upload(page, await jpegFixture(page));
  await page.getByRole("button", { name: "Convert to PNG", exact: true }).click();
  const download = await clickDownload(page);
  expect(download.suggestedFilename()).toBe("shot.png");
  const bytes = await readDownload(download);
  expect(isPng(bytes)).toBe(true);
  expect(pngSize(bytes)).toEqual({ width: 300, height: 200 });
});

test("PNG to JPG fills transparency and encodes JPEG", async ({ page }) => {
  await page.goto("/image/png-to-jpg");
  await upload(page, fixture("photo.png"));
  await expect(page.getByText("#ffffff")).toBeVisible();
  await page.getByRole("button", { name: "Convert to JPG", exact: true }).click();
  const download = await clickDownload(page);
  expect(download.suggestedFilename()).toBe("photo.jpg");
  expect(isJpeg(await readDownload(download))).toBe(true);
});

test("WebP Converter goes to WebP and back to JPG", async ({ page }) => {
  await page.goto("/image/webp-converter");
  await upload(page, fixture("photo.png"));
  await page.getByRole("button", { name: "Convert to WebP", exact: true }).click();
  const webp = await clickDownload(page);
  expect(webp.suggestedFilename()).toBe("photo.webp");
  expect(isWebp(await readDownload(webp))).toBe(true);

  await page.getByRole("button", { name: "Start over", exact: true }).click();
  await upload(page, fixture("photo.png"));
  await page.getByLabel("Output format").selectOption("image/jpeg");
  await page.getByRole("button", { name: "Convert to JPG", exact: true }).click();
  expect(isJpeg(await readDownload(await clickDownload(page)))).toBe(true);
});

test("Rotate Image turns the pixels, not just metadata", async ({ page }) => {
  await page.goto("/image/rotate-image");
  await upload(page, fixture("photo.png"));
  await expect(page.getByRole("button", { name: "Apply & Download", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Rotate right", exact: true }).click();
  await expect(page.getByText("90°", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Apply & Download", exact: true }).click();
  const download = await clickDownload(page);
  expect(download.suggestedFilename()).toBe("photo-rotated.png");
  expect(pngSize(await readDownload(download))).toEqual({ width: 600, height: 800 });
});

test("Remove Metadata reports what it found and rewrites the file", async ({ page }) => {
  const guard = guardPage(page);
  await page.goto("/image/remove-metadata");
  await upload(page, fixture("photo.png"));
  await expect(page.getByText("no metadata found")).toBeVisible();
  await page.getByRole("button", { name: "Remove Metadata", exact: true }).click();
  const download = await clickDownload(page);
  expect(download.suggestedFilename()).toBe("photo-clean.png");
  expect(isPng(await readDownload(download))).toBe(true);
  guard.assertClean();
});

test("Crop Image crops to typed dimensions and previews the result", async ({ page }) => {
  const guard = guardPage(page);
  await page.goto("/image/crop-image");
  await upload(page, fixture("photo.png"));
  await expect(page.getByText("800×600")).toBeVisible();
  await expect(page.getByRole("group", { name: /Crop area/ })).toBeVisible();

  await page.getByLabel("Width", { exact: true }).fill("200");
  await page.getByLabel("Height", { exact: true }).fill("100");
  await page.getByLabel("X", { exact: true }).fill("50");
  await expect(page.getByRole("group", { name: /200 by 100 pixels at 50, 0/ })).toBeVisible();

  await page.getByRole("button", { name: "Crop Image", exact: true }).click();
  await expect(ready(page)).toBeVisible();
  await expect(page.getByRole("img", { name: "Preview of photo-cropped.png" })).toBeVisible();
  const download = await clickDownload(page);
  expect(pngSize(await readDownload(download))).toEqual({ width: 200, height: 100 });
  guard.assertClean();
});

test("Crop Image locks the aspect ratio and moves with the keyboard", async ({ page }) => {
  await page.goto("/image/crop-image");
  await upload(page, fixture("photo.png"));
  await page.getByLabel("Aspect ratio").selectOption("1:1");
  await expect(page.getByRole("group", { name: /600 by 600 pixels/ })).toBeVisible();
  const group = page.getByRole("group", { name: /Crop area/ });
  await group.focus();
  await page.keyboard.press("Shift+ArrowRight");
  await expect(page.getByRole("group", { name: /at 10, 0/ })).toBeVisible();
});
