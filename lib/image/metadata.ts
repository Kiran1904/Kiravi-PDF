/**
 * Lightweight scan of what metadata a file carries, so the user can see what
 * will be stripped. Reads segment markers only — never parses the payloads.
 */
export interface MetadataSummary {
  exif: boolean;
  gps: boolean;
  xmp: boolean;
  iptc: boolean;
  icc: boolean;
  /** Approximate bytes of metadata found */
  bytes: number;
}

export async function summarizeMetadata(file: File): Promise<MetadataSummary> {
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 512 * 1024)).arrayBuffer());
  const summary: MetadataSummary = { exif: false, gps: false, xmp: false, iptc: false, icc: false, bytes: 0 };

  if (head[0] === 0xff && head[1] === 0xd8) scanJpeg(head, summary);
  else if (head[0] === 0x89 && head[1] === 0x50) scanPng(head, summary);
  else if (head[0] === 0x52 && head[1] === 0x49) scanWebp(head, summary);

  return summary;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let out = "";
  for (let index = start; index < start + length && index < bytes.length; index += 1) {
    out += String.fromCharCode(bytes[index]);
  }
  return out;
}

function scanJpeg(bytes: Uint8Array, summary: MetadataSummary): void {
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda) break; // start of scan: image data follows
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const payloadStart = offset + 4;

    if (marker === 0xe1) {
      const tag = ascii(bytes, payloadStart, 29);
      if (tag.startsWith("Exif")) {
        summary.exif = true;
        summary.bytes += length;
        if (hasGpsIfd(bytes, payloadStart + 6, payloadStart + length - 2)) summary.gps = true;
      } else if (tag.startsWith("http://ns.adobe.com/xap")) {
        summary.xmp = true;
        summary.bytes += length;
      }
    } else if (marker === 0xed) {
      summary.iptc = true;
      summary.bytes += length;
    } else if (marker === 0xe2 && ascii(bytes, payloadStart, 11) === "ICC_PROFILE") {
      summary.icc = true;
      summary.bytes += length;
    }

    offset += 2 + length;
  }
}

/** Looks for the GPS IFD pointer tag (0x8825) in the first IFD of a TIFF header. */
function hasGpsIfd(bytes: Uint8Array, tiffStart: number, end: number): boolean {
  if (tiffStart + 8 > end) return false;
  const little = bytes[tiffStart] === 0x49;
  const read16 = (at: number) =>
    little ? bytes[at] | (bytes[at + 1] << 8) : (bytes[at] << 8) | bytes[at + 1];
  const read32 = (at: number) =>
    little
      ? (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0
      : ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;

  const ifdOffset = read32(tiffStart + 4);
  const ifdStart = tiffStart + ifdOffset;
  if (ifdStart + 2 > end) return false;
  const entries = read16(ifdStart);
  for (let index = 0; index < entries; index += 1) {
    const entry = ifdStart + 2 + index * 12;
    if (entry + 12 > end) return false;
    if (read16(entry) === 0x8825) return true;
  }
  return false;
}

function scanPng(bytes: Uint8Array, summary: MetadataSummary): void {
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const length =
      ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>>
      0;
    const type = ascii(bytes, offset + 4, 4);
    if (type === "IDAT" || type === "IEND") break;
    if (type === "eXIf") {
      summary.exif = true;
      summary.bytes += length;
    } else if (type === "iTXt" && ascii(bytes, offset + 8, 17) === "XML:com.adobe.xmp") {
      summary.xmp = true;
      summary.bytes += length;
    } else if (type === "tEXt" || type === "zTXt" || type === "iTXt") {
      summary.iptc = true;
      summary.bytes += length;
    } else if (type === "iCCP") {
      summary.icc = true;
      summary.bytes += length;
    }
    offset += 12 + length;
  }
}

function scanWebp(bytes: Uint8Array, summary: MetadataSummary): void {
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length =
      (bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24)) >>>
      0;
    if (type === "EXIF") {
      summary.exif = true;
      summary.bytes += length;
    } else if (type === "XMP ") {
      summary.xmp = true;
      summary.bytes += length;
    } else if (type === "ICCP") {
      summary.icc = true;
      summary.bytes += length;
    }
    offset += 8 + length + (length % 2);
  }
}

export function describeMetadata(summary: MetadataSummary): string[] {
  const found: string[] = [];
  if (summary.exif) found.push(summary.gps ? "EXIF (including GPS location)" : "EXIF camera data");
  if (summary.xmp) found.push("XMP");
  if (summary.iptc) found.push("IPTC / text fields");
  if (summary.icc) found.push("colour profile");
  return found;
}
