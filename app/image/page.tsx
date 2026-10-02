import { CategoryPage } from "@/components/tools/CategoryPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Image Tools — Compress, Resize & Convert Images Free",
  description:
    "Nine free image tools that run in your browser: compress, resize, crop, rotate, convert between JPG, PNG and WebP, build PDFs and strip EXIF data.",
  path: "/image",
});

export default function ImageToolsPage() {
  return (
    <CategoryPage
      category="image"
      intro="Compress, resize, crop, rotate and convert images without uploading them anywhere. Your browser does the work, so your photos — and the location data in them — stay on your device."
    />
  );
}
