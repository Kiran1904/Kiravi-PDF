// Generates deterministic test files. Run: node tests/fixtures/make-fixtures.mjs
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

async function textPdf(name, pages, label) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i += 1) {
    const page = doc.addPage([595.28, 841.89]);
    page.drawText(`${label} — page ${i} of ${pages}`, { x: 60, y: 760, size: 24, font });
    page.drawText("The quick brown fox jumps over the lazy dog.", { x: 60, y: 720, size: 14, font });
    page.drawRectangle({
      x: 60,
      y: 100,
      width: 475,
      height: 560,
      borderColor: rgb(0.2, 0.3, 0.8),
      borderWidth: 2,
    });
    page.drawText(String(i), { x: 290, y: 60, size: 12, font });
  }
  writeFileSync(join(here, name), await doc.save());
}

// A PDF whose pages are only images: no text layer, like a scan.
async function scanPdf(name) {
  const doc = await PDFDocument.create();
  const width = 1240,
    height = 1754;
  // Build a noisy JPEG-ish PNG via raw RGBA so it's large and incompressible.
  const png = await makePng(width, height);
  const image = await doc.embedPng(png);
  for (let i = 0; i < 2; i += 1) {
    const page = doc.addPage([595.28, 841.89]);
    page.drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  writeFileSync(join(here, name), await doc.save());
}

// Minimal PNG encoder (stored, no zlib compression levels needed beyond stored blocks).
import { deflateSync } from "node:zlib";
async function makePng(width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let seed = 42;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const o = row + 1 + x * 4;
      const paper = 235 + rand() * 20;
      const ink = x > 100 && x < 1100 && y % 60 < 12 ? 40 : paper;
      raw[o] = ink;
      raw[o + 1] = ink;
      raw[o + 2] = ink;
      raw[o + 3] = 255;
    }
  }
  const chunks = [];
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td));
    chunks.push(len, td, crc);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  chunk("IHDR", ihdr);
  chunk("IDAT", deflateSync(raw));
  chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ...chunks]);
}
const table = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

await textPdf("a-3pages.pdf", 3, "Document A");
await textPdf("b-2pages.pdf", 2, "Document B");
await textPdf("c-12pages.pdf", 12, "Document C");
await scanPdf("scan-2pages.pdf");
writeFileSync(join(here, "photo.png"), await makePng(800, 600));
writeFileSync(join(here, "not-a-pdf.pdf"), Buffer.from("this is plain text pretending to be a pdf"));
writeFileSync(join(here, "empty.pdf"), Buffer.alloc(0));
console.log("fixtures written");
