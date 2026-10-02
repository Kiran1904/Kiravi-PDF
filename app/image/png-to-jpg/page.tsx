import { PngToJpg } from "@/components/image/ConvertImage";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("png-to-jpg");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <PngToJpg tool={tool} />
    </ToolPageShell>
  );
}
