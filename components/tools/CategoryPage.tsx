import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { CATEGORY_LABELS, getToolsByCategory, toolHref, type ToolCategory } from "@/lib/tools/registry";

export function CategoryPage({ category, intro }: { category: ToolCategory; intro: string }) {
  const tools = getToolsByCategory(category);
  const label = CATEGORY_LABELS[category];

  return (
    <>
      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label }]} />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{label}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">{intro}</p>
        <div className="mt-10">
          <ToolGrid tools={tools} />
        </div>
      </Container>

      <JsonLd
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${label} — ${site.name}`,
            url: `${site.url}/${category}`,
            hasPart: tools.map((tool) => ({
              "@type": "WebApplication",
              name: tool.name,
              url: `${site.url}${toolHref(tool)}`,
              applicationCategory: "UtilitiesApplication",
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: label, item: `${site.url}/${category}` },
            ],
          },
        ]}
      />
    </>
  );
}
