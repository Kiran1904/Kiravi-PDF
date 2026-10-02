import type { Metadata } from "next";

import { site } from "@/lib/site";
import { CATEGORY_LABELS, toolHref, type Tool } from "@/lib/tools/registry";

export function pageMetadata({
  title,
  description,
  path,
  image = "/og/home",
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  /** Path of the link-preview card, see app/og/[slug]/route.tsx */
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${site.url}${path}`;
  const fullTitle = path === "/" ? title : `${title} | ${site.name}`;
  const images = [{ url: image, width: 1200, height: 630, alt: fullTitle }];

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: fullTitle,
      description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitter,
      title: fullTitle,
      description,
      images,
    },
  };
}

export function toolMetadata(tool: Tool): Metadata {
  return pageMetadata({
    title: tool.seoTitle,
    description: tool.metaDescription,
    path: toolHref(tool),
    image: `/og/${tool.slug}`,
  });
}

type JsonLd = Record<string, unknown>;

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    alternateName: site.tagline,
    url: site.url,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function toolSchemas(tool: Tool): JsonLd[] {
  const url = `${site.url}${toolHref(tool)}`;

  const schemas: JsonLd[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${tool.name} — ${site.name}`,
      url,
      description: tool.metaDescription,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any browser",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        {
          "@type": "ListItem",
          position: 2,
          name: CATEGORY_LABELS[tool.category],
          item: `${site.url}/${tool.category}`,
        },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];

  // Only emitted because these exact questions and answers are rendered on the page.
  if (tool.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
  }

  return schemas;
}

export function howToSchema(tool: Tool): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    step: tool.howTo.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
  };
}

export function JsonLd({ schemas }: { schemas: JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema objects are built from our own registry, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas) }}
    />
  );
}
