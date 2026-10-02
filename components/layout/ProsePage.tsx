import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { Container } from "@/components/layout/Container";

export function ProsePage({
  title,
  lead,
  updated,
  children,
}: {
  title: string;
  lead?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {lead && <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{lead}</p>}
      {updated && <p className="text-muted-foreground mt-2 text-sm">Last updated {updated}</p>}

      <div
        className={[
          "mt-10 space-y-6 leading-relaxed",
          "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
          "[&_h3]:mt-6 [&_h3]:font-semibold",
          "[&_p]:text-muted-foreground",
          "[&_li]:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
          "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
          "[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2",
          "[&_strong]:text-foreground",
        ].join(" ")}
      >
        {children}
      </div>
    </Container>
  );
}
