import { MergePdf } from "@/components/pdf/MergePdf";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("merge-pdf");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <MergePdf tool={tool} />
    </ToolPageShell>
  );
}
