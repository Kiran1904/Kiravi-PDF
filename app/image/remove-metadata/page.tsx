import { RemoveMetadata } from "@/components/image/RemoveMetadata";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("remove-metadata");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <RemoveMetadata tool={tool} />
    </ToolPageShell>
  );
}
