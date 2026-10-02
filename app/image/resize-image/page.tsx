import { ResizeImage } from "@/components/image/ResizeImage";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("resize-image");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <ResizeImage tool={tool} />
    </ToolPageShell>
  );
}
