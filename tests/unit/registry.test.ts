import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { expectedLabel, kindsForTool } from "@/lib/files/kinds";
import { getRelatedTools, getTool, tools, toolHref } from "@/lib/tools/registry";
import { inputExtensions } from "@/lib/tools/types";

describe("tool registry integrity", () => {
  it("has 19 tools with unique slugs and routes", () => {
    expect(tools).toHaveLength(19);
    expect(new Set(tools.map((tool) => tool.slug)).size).toBe(19);
    expect(new Set(tools.map(toolHref)).size).toBe(19);
  });

  it("every related slug points at a real, different tool", () => {
    for (const tool of tools) {
      expect(tool.related.length, tool.slug).toBeGreaterThanOrEqual(3);
      expect(tool.related, tool.slug).not.toContain(tool.slug);
      expect(
        getRelatedTools(tool.slug).map((related) => related.slug),
        tool.slug,
      ).toEqual(tool.related);
    }
  });

  it("every tool has real, non-generic SEO content", () => {
    const seenQuestions = new Set<string>();
    for (const tool of tools) {
      expect(tool.seoTitle.length, tool.slug).toBeLessThanOrEqual(70);
      expect(tool.metaDescription.length, tool.slug).toBeGreaterThan(80);
      expect(tool.metaDescription.length, tool.slug).toBeLessThanOrEqual(170);
      expect(tool.what.length, tool.slug).toBeGreaterThan(200);
      expect(tool.howTo, tool.slug).toHaveLength(4);
      expect(tool.features.length, tool.slug).toBeGreaterThanOrEqual(3);
      expect(tool.faqs.length, tool.slug).toBeGreaterThanOrEqual(3);
      for (const faq of tool.faqs) {
        expect(seenQuestions.has(faq.q), `duplicate FAQ across tools: ${faq.q}`).toBe(false);
        seenQuestions.add(faq.q);
        expect(faq.a.length).toBeGreaterThan(60);
      }
    }
  });

  it("every tool's accept string resolves to at least one signature kind", () => {
    for (const tool of tools) {
      expect(kindsForTool(tool).length, tool.slug).toBeGreaterThan(0);
      expect(inputExtensions(tool).length, tool.slug).toBeGreaterThan(0);
    }
    expect(expectedLabel(getTool("merge-pdf")!)).toBe("a PDF file");
    expect(expectedLabel(getTool("jpg-to-pdf")!)).toBe("a JPG, PNG or WebP file");
  });

  it("every tool has a page directory matching its route", () => {
    for (const tool of tools) {
      const dir = join(process.cwd(), "app", tool.category, tool.slug);
      expect(() => readdirSync(dir), `${toolHref(tool)} has no app directory`).not.toThrow();
      expect(readdirSync(dir), toolHref(tool)).toContain("page.tsx");
    }
  });

  it("every icon name is mapped", () => {
    const source = readFileSync(join(process.cwd(), "components/tools/ToolIcon.tsx"), "utf8");
    for (const tool of tools)
      expect(source, `icon ${tool.icon} for ${tool.slug}`).toContain(`  ${tool.icon},`);
  });
});
