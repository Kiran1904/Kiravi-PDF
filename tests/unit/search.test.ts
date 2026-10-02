import { describe, expect, it } from "vitest";

import { getToolIndex } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";

const index = getToolIndex();
const names = (query: string) => searchTools(index, query).map((tool) => tool.name);

describe("searchTools", () => {
  it('"compress" finds both compress tools', () => {
    expect(names("compress")).toEqual(expect.arrayContaining(["Compress PDF", "Compress Image"]));
    expect(names("compress").slice(0, 2)).toEqual(expect.arrayContaining(["Compress PDF", "Compress Image"]));
  });

  it('"convert" finds the conversion tools', () => {
    expect(names("convert")).toEqual(
      expect.arrayContaining(["PDF to JPG", "JPG to PDF", "JPG to PNG", "PNG to JPG", "WebP Converter"]),
    );
  });

  it("ranks an exact name first", () => {
    expect(names("merge pdf")[0]).toBe("Merge PDF");
    expect(names("resize image")[0]).toBe("Resize Image");
  });

  it("matches keywords and category", () => {
    expect(names("exif")).toContain("Remove Image Metadata");
    expect(names("image tools").length).toBeGreaterThan(5);
  });

  it("requires every term to match", () => {
    expect(names("compress zebra")).toEqual([]);
  });

  it("is case-insensitive and ignores empty input", () => {
    expect(names("SPLIT")).toContain("Split PDF");
    expect(names("   ")).toEqual([]);
  });
});
