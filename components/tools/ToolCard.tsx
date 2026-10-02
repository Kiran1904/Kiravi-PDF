import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ToolIcon } from "@/components/tools/ToolIcon";
import { toolHref, type Tool } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export function ToolCard({
  tool,
}: {
  tool: Pick<Tool, "slug" | "category" | "name" | "description" | "icon">;
}) {
  return (
    <Link
      href={toolHref(tool)}
      className={cn(
        "group bg-card hover:border-brand/40 focus-visible:ring-brand/40 relative flex h-full flex-col gap-3 rounded-2xl border p-5 transition-all hover:shadow-md focus-visible:ring-4 focus-visible:outline-none",
      )}
    >
      <span
        className={cn(
          "grid size-11 place-items-center rounded-xl transition-colors",
          tool.category === "pdf" ? "bg-pdf/10 text-pdf" : "bg-image/10 text-image",
        )}
      >
        <ToolIcon name={tool.icon} className="size-5.5" />
      </span>

      <h3 className="font-semibold tracking-tight">{tool.name}</h3>
      <p className="text-muted-foreground flex-1 text-sm leading-relaxed">{tool.description}</p>

      <span className="text-brand inline-flex items-center gap-1 text-sm font-medium">
        Use tool
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
