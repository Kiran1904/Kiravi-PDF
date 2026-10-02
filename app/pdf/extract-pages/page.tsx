import { ExtractPages } from "@/components/pdf/PickPages";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("extract-pages");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <ExtractPages tool={tool} />
    </ToolPageShell>
  );
}
