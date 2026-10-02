import { describe, expect, it } from "vitest";

import { allPages, formatPageRanges, parsePageRanges, parseRangeGroups } from "@/lib/pdf/page-ranges";

describe("parsePageRanges", () => {
  it("parses mixed ranges and singles, sorted and de-duplicated", () => {
    expect(parsePageRanges("3, 1-2, 3, 5", 10)).toEqual([1, 2, 3, 5]);
  });
  it("tolerates whitespace and trailing separators", () => {
    expect(parsePageRanges(" 1 - 2 ,  4 , ", 10)).toEqual(null); // "1 - 2" splits into "1", "-", "2"
    expect(parsePageRanges("1-2,4,", 10)).toEqual([1, 2, 4]);
  });
  it("rejects out-of-range, reversed and malformed input", () => {
    expect(parsePageRanges("0", 5)).toBeNull();
    expect(parsePageRanges("6", 5)).toBeNull();
    expect(parsePageRanges("4-2", 5)).toBeNull();
    expect(parsePageRanges("a-b", 5)).toBeNull();
  });
  it("returns an empty list for empty input", () => {
    expect(parsePageRanges("", 5)).toEqual([]);
  });
});

describe("parseRangeGroups", () => {
  it("keeps comma-separated groups separate", () => {
    expect(parseRangeGroups("1-2, 4, 6-7", 10)).toEqual([[1, 2], [4], [6, 7]]);
  });
  it("fails the whole input on one bad group", () => {
    expect(parseRangeGroups("1-2, x", 10)).toBeNull();
  });
});

describe("formatPageRanges", () => {
  it("collapses runs", () => {
    expect(formatPageRanges([7, 1, 2, 3, 10, 11, 12])).toBe("1-3, 7, 10-12");
    expect(formatPageRanges([])).toBe("");
    expect(formatPageRanges([4])).toBe("4");
  });
  it("round-trips through parsePageRanges", () => {
    const pages = [1, 2, 5, 8, 9];
    expect(parsePageRanges(formatPageRanges(pages), 20)).toEqual(pages);
  });
});

it("allPages enumerates 1..n", () => {
  expect(allPages(3)).toEqual([1, 2, 3]);
  expect(allPages(0)).toEqual([]);
});
