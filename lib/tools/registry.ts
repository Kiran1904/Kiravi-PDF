import { imageTools } from "./image-tools";
import { pdfTools } from "./pdf-tools";
import type { Tool, ToolCategory } from "./types";

export type { Tool, ToolCategory, ToolFaq } from "./types";
export { toolHref } from "./types";

export const tools: Tool[] = [...pdfTools, ...imageTools];

const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export function getTool(slug: string): Tool | undefined {
  return bySlug.get(slug);
}

/** For tool pages: a typo in the slug fails the build instead of rendering an empty page. */
export function requireTool(slug: string): Tool {
  const tool = bySlug.get(slug);
  if (!tool) throw new Error(`Unknown tool slug: ${slug}`);
  return tool;
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function getFeaturedTools(): Tool[] {
  return tools.filter((tool) => tool.featured);
}

export function getRelatedTools(slug: string): Tool[] {
  const tool = bySlug.get(slug);
  if (!tool) return [];
  return tool.related
    .map((relatedSlug) => bySlug.get(relatedSlug))
    .filter((related): related is Tool => Boolean(related));
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  pdf: "PDF Tools",
  image: "Image Tools",
};

/** Minimal shape sent to the client for search — keeps SEO prose out of the bundle. */
export interface ToolIndexEntry {
  slug: string;
  category: ToolCategory;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
}

export function getToolIndex(): ToolIndexEntry[] {
  return tools.map(({ slug, category, name, description, icon, keywords }) => ({
    slug,
    category,
    name,
    description,
    icon,
    keywords,
  }));
}
