import { CompressImage } from "@/components/image/CompressImage";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("compress-image");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <CompressImage tool={tool} />
    </ToolPageShell>
  );
}
