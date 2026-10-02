export type ToolCategory = "pdf" | "image";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface Tool {
  /** URL segment, e.g. "merge-pdf" -> /pdf/merge-pdf */
  slug: string;
  category: ToolCategory;
  /** Short display name used in cards, nav and breadcrumbs */
  name: string;
  /** <title> content, without the brand suffix */
  seoTitle: string;
  /** Card / grid description. One sentence. */
  description: string;
  /** <meta name="description"> */
  metaDescription: string;
  /** Lead paragraph under the H1 */
  intro: string;
  /** Body of the "What is ...?" section */
  what: string;
  /** Lucide icon name, resolved by components/tools/ToolIcon.tsx */
  icon: string;
  /** Search keywords beyond name/description */
  keywords: string[];
  /** Accepted input, as an `accept` attribute value */
  accept: string;
  /** What the tool produces, e.g. "PDF", "JPG images". Shown in the UI. */
  outputFormat: string;
  /** Override the category default size ceiling (bytes) */
  maxBytes?: number;
  /** Override the category default page ceiling, for PDF tools */
  maxPages?: number;
  /** Human-readable list of supported inputs shown in the dropzone */
  acceptLabel: string;
  multiple: boolean;
  /** True when every byte stays in the browser. Drives the privacy badge. */
  clientSide: boolean;
  featured?: boolean;
  howTo: string[];
  features: string[];
  faqs: ToolFaq[];
  /** Slugs of related tools */
  related: string[];
}

/** File extensions a tool accepts, derived from its `accept` string. */
export function inputExtensions(tool: Pick<Tool, "accept">): string[] {
  return tool.accept
    .split(",")
    .filter((part) => part.startsWith("."))
    .map((part) => part.slice(1).toUpperCase());
}

export function toolHref(tool: Pick<Tool, "category" | "slug">): string {
  return `/${tool.category}/${tool.slug}`;
}
