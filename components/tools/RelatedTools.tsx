import { ToolCard } from "@/components/tools/ToolCard";
import type { Tool } from "@/lib/tools/registry";

export function RelatedTools({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">
        Related tools
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.slug} className="h-full">
            <ToolCard tool={tool} />
          </li>
        ))}
      </ul>
    </section>
  );
}
