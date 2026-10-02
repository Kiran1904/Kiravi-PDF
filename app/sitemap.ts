import type { MetadataRoute } from "next";

import { site } from "@/lib/site";
import { tools, toolHref } from "@/lib/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: site.url, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/pdf`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/image`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...tools.map((tool) => ({
      url: `${site.url}${toolHref(tool)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: tool.featured ? 0.9 : 0.8,
    })),
    ...["/about", "/contact", "/privacy", "/terms"].map((path) => ({
      url: `${site.url}${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
