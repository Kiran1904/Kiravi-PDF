import { PdfToPng } from "@/components/pdf/PdfToImages";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("pdf-to-png");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <PdfToPng tool={tool} />
    </ToolPageShell>
  );
}
