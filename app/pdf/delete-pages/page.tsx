import { DeletePages } from "@/components/pdf/PickPages";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("delete-pages");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <DeletePages tool={tool} />
    </ToolPageShell>
  );
}
