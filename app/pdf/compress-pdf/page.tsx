import { CompressPdf } from "@/components/pdf/CompressPdf";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("compress-pdf");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <CompressPdf tool={tool} />
    </ToolPageShell>
  );
}
