import { ImagesToPdf } from "@/components/pdf/ImagesToPdf";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("jpg-to-pdf");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <ImagesToPdf tool={tool} />
    </ToolPageShell>
  );
}
