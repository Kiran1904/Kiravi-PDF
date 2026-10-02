import { ToolCard } from "@/components/tools/ToolCard";
import type { Tool } from "@/lib/tools/registry";

export function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.slug} className="h-full">
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  );
}
