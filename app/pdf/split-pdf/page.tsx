import { SplitPdf } from "@/components/pdf/SplitPdf";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("split-pdf");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <SplitPdf tool={tool} />
    </ToolPageShell>
  );
}
