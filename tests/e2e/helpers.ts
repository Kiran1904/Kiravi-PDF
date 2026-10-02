import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { expect, type Download, type Page } from "@playwright/test";

export const fixtures = join(process.cwd(), "tests", "fixtures");
export const fixture = (name: string) => join(fixtures, name);

/** For mixing with in-memory files: setInputFiles cannot mix paths and buffers. */
export async function fixtureBuffer(name: string, mimeType: string) {
  return { name, mimeType, buffer: await readFile(fixture(name)) };
}

/** Fails the test on any console error or any request that could carry a file off the device. */
export function guardPage(page: Page) {
  const errors: string[] = [];
  const uploads: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method()) && !request.url().includes("__nextjs")) {
      uploads.push(`${request.method()} ${request.url()}`);
    }
  });

  return {
    assertClean() {
      expect(errors, "console errors").toEqual([]);
      expect(uploads, "no file should ever be sent to a server").toEqual([]);
    },
  };
}

export async function readDownload(download: Download): Promise<Buffer> {
  const path = await download.path();
  if (!path) throw new Error("download has no path");
  return readFile(path);
}

export async function pdfPageCount(bytes: Buffer): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  return (await PDFDocument.load(bytes)).getPageCount();
}

export function pngSize(bytes: Buffer): { width: number; height: number } {
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

export function hasMagic(bytes: Buffer, text: string, offset = 0): boolean {
  return bytes.subarray(offset, offset + text.length).toString("latin1") === text;
}

export const isPng = (bytes: Buffer) => bytes[0] === 0x89 && hasMagic(bytes, "PNG", 1);
export const isJpeg = (bytes: Buffer) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
export const isWebp = (bytes: Buffer) => hasMagic(bytes, "RIFF") && hasMagic(bytes, "WEBP", 8);

export async function zipEntries(bytes: Buffer): Promise<string[]> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(bytes);
  return Object.keys(zip.files).sort();
}

/** A real JPEG, produced by the browser itself, for tools that need one. */
export async function jpegFixture(page: Page) {
  const buffer = await page.screenshot({
    type: "jpeg",
    quality: 80,
    scale: "css",
    clip: { x: 0, y: 0, width: 300, height: 200 },
  });
  return { name: "shot.jpg", mimeType: "image/jpeg", buffer };
}

export async function clickDownload(page: Page, name = "Download"): Promise<Download> {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name, exact: true }).click();
  return pending;
}

export const ready = (page: Page) => page.getByRole("heading", { name: /is ready|are ready/ });
