import { WebpConverter } from "@/components/image/ConvertImage";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolMetadata } from "@/lib/seo";
import { requireTool } from "@/lib/tools/registry";

const tool = requireTool("webp-converter");

export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <WebpConverter tool={tool} />
    </ToolPageShell>
  );
}
