import type { Tool, ToolCategory } from "@/lib/tools/types";

export interface ToolLimits {
  /** Largest single file, in bytes */
  maxBytes: number;
  /** Largest number of files in one batch */
  maxFiles: number;
  /** Largest PDF page count we will try to process */
  maxPages: number;
  /** Largest image, in pixels (width x height), before we downscale */
  maxPixels: number;
}

/**
 * These are browser-memory ceilings, not business rules — a premium tier would
 * raise them by swapping the resolved value, not by touching any tool.
 */
const DEFAULTS: Record<ToolCategory, ToolLimits> = {
  pdf: {
    maxBytes: 100 * 1024 * 1024,
    maxFiles: 30,
    maxPages: 1000,
    maxPixels: 40_000_000,
  },
  image: {
    maxBytes: 50 * 1024 * 1024,
    maxFiles: 50,
    maxPages: 0,
    maxPixels: 40_000_000,
  },
};

export function getToolLimits(tool: Tool): ToolLimits {
  const base = DEFAULTS[tool.category];
  return {
    ...base,
    maxBytes: tool.maxBytes ?? base.maxBytes,
    maxPages: tool.maxPages ?? base.maxPages,
  };
}
