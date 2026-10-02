import { Check } from "lucide-react";

import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { Faq } from "@/components/tools/Faq";
import { PrivacyNote } from "@/components/tools/PrivacyNote";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { Container } from "@/components/layout/Container";
import { howToSchema, JsonLd, toolSchemas } from "@/lib/seo";
import { CATEGORY_LABELS, getRelatedTools, type Tool } from "@/lib/tools/registry";
import { inputExtensions } from "@/lib/tools/types";

export function ToolPageShell({ tool, children }: { tool: Tool; children: React.ReactNode }) {
  const related = getRelatedTools(tool.slug);

  return (
    <>
      <Container className="py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: CATEGORY_LABELS[tool.category], href: `/${tool.category}` },
            { label: tool.name },
          ]}
        />

        <header className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span
            className={
              tool.category === "pdf"
                ? "bg-pdf/10 text-pdf grid size-12 shrink-0 place-items-center rounded-xl"
                : "bg-image/10 text-image grid size-12 shrink-0 place-items-center rounded-xl"
            }
          >
            <ToolIcon name={tool.icon} className="size-6" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-base leading-relaxed">{tool.intro}</p>
          </div>
        </header>

        <dl className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="flex gap-1.5">
            <dt className="font-medium">Accepts:</dt>
            <dd>{inputExtensions(tool).join(", ")}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-medium">Produces:</dt>
            <dd>{tool.outputFormat}</dd>
          </div>
          {tool.clientSide && <PrivacyNote compact />}
        </dl>

        <div className="mt-8">{children}</div>
      </Container>

      <Container className="max-w-3xl space-y-12 pt-6 pb-16 sm:pt-10">
        <section aria-labelledby="what-heading">
          <h2 id="what-heading" className="text-2xl font-semibold tracking-tight">
            What is {tool.name}?
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">{tool.what}</p>
        </section>

        <section aria-labelledby="howto-heading">
          <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight">
            How to use {tool.name}
          </h2>
          <ol className="mt-4 space-y-3">
            {tool.howTo.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="bg-brand-muted text-brand grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-muted-foreground pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">
            Features
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {tool.features.map((feature) => (
              <li key={feature} className="flex gap-2.5">
                <Check aria-hidden className="text-success mt-0.5 size-4 shrink-0" />
                <span className="text-muted-foreground text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {tool.clientSide && <PrivacyNote />}

        <Faq items={tool.faqs} />

        <RelatedTools tools={related} />
      </Container>

      <JsonLd schemas={[...toolSchemas(tool), howToSchema(tool)]} />
    </>
  );
}
