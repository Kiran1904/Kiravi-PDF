import { CategoryPage } from "@/components/tools/CategoryPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "PDF Tools — Merge, Split, Compress & Convert PDFs Free",
  description:
    "Ten free PDF tools that run in your browser: merge, split, compress, rotate, delete and extract pages, and convert PDFs to JPG, PNG or text.",
  path: "/pdf",
  image: "/og/pdf",
});

export default function PdfToolsPage() {
  return (
    <CategoryPage
      category="pdf"
      intro="Everything here runs inside your browser — pick a tool, add a PDF, and download the result. Nothing is uploaded, so there is no queue and no file sitting on a server afterwards."
    />
  );
}
