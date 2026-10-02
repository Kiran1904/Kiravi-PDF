import { PdfToText } from "@/components/pdf/PdfToText";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("pdf-to-text");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <PdfToText tool={tool} />
    </ToolPageShell>
  );
}
