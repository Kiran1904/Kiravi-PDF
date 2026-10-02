import { JpgToPng } from "@/components/image/ConvertImage";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("jpg-to-png");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <JpgToPng tool={tool} />
    </ToolPageShell>
  );
}
