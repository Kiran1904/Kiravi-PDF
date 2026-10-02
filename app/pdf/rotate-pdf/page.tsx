import { RotatePdf } from "@/components/pdf/RotatePdf";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("rotate-pdf");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <RotatePdf tool={tool} />
    </ToolPageShell>
  );
}
