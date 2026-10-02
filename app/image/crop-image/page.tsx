import { CropImage } from "@/components/image/CropImage";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("crop-image");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <CropImage tool={tool} />
    </ToolPageShell>
  );
}
