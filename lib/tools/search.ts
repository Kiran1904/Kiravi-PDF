import { CATEGORY_LABELS, type ToolIndexEntry } from "./registry";

/**
 * Deliberately simple substring scoring rather than a fuzzy-search dependency:
 * the corpus is 19 items, so this is instant and the ranking is predictable.
 */
export function searchTools(index: readonly ToolIndexEntry[], rawQuery: string): ToolIndexEntry[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const terms = query.split(/\s+/);

  // Ties keep registry order, so PDF tools and featured tools surface first.
  return index
    .map((tool, position) => ({ tool, position, score: scoreTool(tool, terms) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .map((match) => match.tool);
}

function scoreTool(tool: ToolIndexEntry, terms: readonly string[]): number {
  const name = tool.name.toLowerCase();
  const description = tool.description.toLowerCase();
  const category = CATEGORY_LABELS[tool.category].toLowerCase();

  let total = 0;
  for (const term of terms) {
    let best = 0;
    if (name === term) best = 100;
    else if (name.startsWith(term)) best = 60;
    else if (name.includes(term)) best = 40;
    else if (tool.keywords.some((keyword) => keyword.toLowerCase().startsWith(term))) best = 25;
    else if (tool.keywords.some((keyword) => keyword.toLowerCase().includes(term))) best = 15;
    else if (category.includes(term)) best = 10;
    else if (description.includes(term)) best = 8;

    // Every term has to hit something, so "compress image" cannot match a tool
    // that only knows about "compress".
    if (best === 0) return 0;
    total += best;
  }
  return total;
}
