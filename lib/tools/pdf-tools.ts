import type { Tool } from "./types";

const PDF_ACCEPT = "application/pdf,.pdf";
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export const pdfTools: Tool[] = [
  {
    slug: "merge-pdf",
    category: "pdf",
    name: "Merge PDF",
    seoTitle: "Merge PDF — Combine PDF Files Online Free",
    description: "Combine multiple PDF files into one document.",
    metaDescription:
      "Combine multiple PDF files into a single document, in any order you choose. Free, no sign-up, and your files never leave your browser.",
    intro:
      "Pick the PDFs you want to join, drag them into the order you want, and download one combined file. Nothing is uploaded — the merge happens on your device.",
    what: "Merging a PDF means taking the pages of two or more documents and writing them into a single new file, one after another. It is the usual way to turn a stack of separate scans, invoices or chapters into one document that is easy to email, print or archive. Page content, fonts and embedded images are copied across unchanged, so the merged file looks exactly like the originals.",
    icon: "FileStack",
    keywords: ["combine", "join", "concat", "append", "merge pdf files", "pdf joiner"],
    accept: PDF_ACCEPT,
    acceptLabel: "PDF files",
    outputFormat: "A single PDF",
    multiple: true,
    clientSide: true,
    featured: true,
    howTo: [
      "Add two or more PDF files using the drop zone below.",
      "Drag the files, or use the arrow buttons, to set the page order.",
      "Select Merge PDF and wait a moment while the file is built.",
      "Download your combined PDF.",
    ],
    features: [
      "Unlimited number of files per merge",
      "Reorder by dragging, or with keyboard-accessible arrow buttons",
      "Remove a file without starting over",
      "Original page size and quality are preserved",
    ],
    faqs: [
      {
        q: "Does merging reduce the quality of my PDFs?",
        a: "No. The pages are copied byte-for-byte into the new document, so text stays selectable and images keep their original resolution. The merged file is roughly the sum of the input sizes.",
      },
      {
        q: "Can I merge a password-protected PDF?",
        a: "Not directly. A PDF with an open password has to be unlocked before its pages can be read. Remove the password in your PDF reader first, then merge the unprotected copy.",
      },
      {
        q: "How many PDFs can I merge at once?",
        a: "There is no fixed limit on the number of files. The practical ceiling is your device's memory, since the whole document is assembled in the browser. Very large batches work better split into a few merges.",
      },
      {
        q: "Will bookmarks and form fields survive the merge?",
        a: "Page content, annotations and links are carried over. Document-level structures such as the bookmark outline and interactive form fields are not combined, so expect a merged file without them.",
      },
    ],
    related: ["split-pdf", "extract-pages", "delete-pages", "compress-pdf"],
  },
  {
    slug: "split-pdf",
    category: "pdf",
    name: "Split PDF",
    seoTitle: "Split PDF — Separate PDF Pages Online Free",
    description: "Split one PDF into separate files or page ranges.",
    metaDescription:
      "Split a PDF by page ranges or into one file per page. Free, runs entirely in your browser, and no sign-up is needed.",
    intro:
      "Upload a PDF, choose the ranges you want, and get back separate documents. Your file is read locally and never sent to a server.",
    what: "Splitting a PDF produces new, smaller documents from the pages of an existing one. It is useful when a single scan holds several unrelated documents, when you only need to share a chapter, or when a file is too large to send in one piece. You can cut at specific ranges — pages 1–4 and 5–12, for example — or break the document into one file per page.",
    icon: "Scissors",
    keywords: ["separate", "divide", "cut", "page range", "split pdf pages", "pdf splitter"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "PDF files (ZIP for multiple)",
    multiple: false,
    clientSide: true,
    featured: true,
    howTo: [
      "Add the PDF you want to split.",
      "Choose custom ranges such as 1-3, 7, 9-12, or split every page into its own file.",
      "Select Split PDF.",
      "Download the files individually, or all of them as a ZIP.",
    ],
    features: [
      "Custom ranges, mixed with single pages",
      "One-file-per-page mode for quick separation",
      "Page count shown as soon as the file loads",
      "Download results one by one or as a single ZIP",
    ],
    faqs: [
      {
        q: "How do I write page ranges?",
        a: "Use commas to separate the parts and a hyphen for a range: 1-3, 7, 10-12 creates three documents. Spaces are ignored, and page numbers start at 1.",
      },
      {
        q: "Can I split a PDF without losing quality?",
        a: "Yes. Splitting copies the existing pages rather than re-rendering them, so text, fonts and images in the result are identical to the source.",
      },
      {
        q: "Why is the sum of the split files larger than the original?",
        a: "Each output document needs its own copy of the resources its pages use — fonts especially. If a font is shared across the whole original, it gets embedded once per output file.",
      },
      {
        q: "Is there a page limit?",
        a: "No page limit is enforced. Documents of a few thousand pages split fine; past that, the browser may run short on memory, so splitting in two passes is safer.",
      },
    ],
    related: ["merge-pdf", "extract-pages", "delete-pages", "rotate-pdf"],
  },
  {
    slug: "compress-pdf",
    category: "pdf",
    name: "Compress PDF",
    seoTitle: "Compress PDF — Reduce PDF File Size Online Free",
    description: "Reduce PDF file size while keeping it readable.",
    metaDescription:
      "Shrink a PDF so it fits an email or upload limit. Choose a compression level, see the exact saving, and download — all in your browser.",
    intro:
      "Choose how hard to compress, and see the before and after sizes before you download. How much you save depends entirely on what is inside the PDF.",
    what: "A PDF's size is usually dominated by the images inside it. Compressing one means re-encoding those images at a lower resolution or quality, and stripping data the viewer does not need. A scanned document full of photographs can often shrink by 70% or more. A text-only PDF produced by a word processor holds almost no image data, so there is very little to remove and the saving will be small.",
    icon: "Minimize2",
    keywords: ["reduce", "shrink", "smaller", "optimise", "optimize", "file size", "compress pdf online"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "A smaller PDF",
    multiple: false,
    clientSide: true,
    featured: true,
    howTo: [
      "Add the PDF you want to make smaller.",
      "Pick a compression level — stronger levels trade visual quality for size.",
      "Select Compress PDF.",
      "Check the reported saving, then download the compressed file.",
    ],
    features: [
      "Three levels, from light optimisation to maximum reduction",
      "Original size, new size and percentage saved all shown",
      "Keeps the original if compression would make the file bigger",
      "No upload — the document is processed on your device",
    ],
    faqs: [
      {
        q: "Why did my PDF barely get smaller?",
        a: "Because there was little to remove. Text, vector drawings and already-compressed images leave almost no slack. Files built from scans or photographs are the ones that shrink dramatically.",
      },
      {
        q: "Will the text still be selectable after compressing?",
        a: "On the light and balanced levels, yes — text is left untouched and only images are re-encoded. The strong level rasterises pages, which produces the smallest file but turns text into pixels.",
      },
      {
        q: "Is compression lossy?",
        a: "Image re-encoding is lossy: once quality is discarded it cannot be recovered. Keep your original file, and compare the result before you replace it.",
      },
      {
        q: "What is a realistic target size?",
        a: "For a scanned document, 100–300 KB per page is comfortable for screen reading and email. Going much below that starts to make small print hard to read.",
      },
    ],
    related: ["merge-pdf", "pdf-to-jpg", "split-pdf", "compress-image"],
  },
  {
    slug: "pdf-to-jpg",
    category: "pdf",
    name: "PDF to JPG",
    seoTitle: "PDF to JPG — Convert PDF Pages to JPG Images Free",
    description: "Turn each PDF page into a JPG image.",
    metaDescription:
      "Convert PDF pages into JPG images at the quality you choose. Preview every page, download one image or all of them as a ZIP.",
    intro:
      "Each page is rendered to a JPG in your browser. Pick the pages and the quality, preview the result, then download.",
    what: "Converting a PDF to JPG renders each page as a flat photograph of itself. That makes pages easy to drop into a slide, a chat message or a web page, anywhere a PDF would be awkward. The trade-off is that the result is pixels: the text is no longer selectable or searchable, and the image has a fixed resolution rather than scaling cleanly.",
    icon: "FileImage",
    keywords: ["convert", "pdf to image", "pdf to jpeg", "export pages", "pdf page as picture"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "JPG images (ZIP for multiple)",
    multiple: false,
    clientSide: true,
    featured: true,
    howTo: [
      "Add a PDF file.",
      "Choose which pages to convert and set the image quality.",
      "Select Convert to JPG and wait while the pages render.",
      "Download a single image, or take everything as a ZIP.",
    ],
    features: [
      "Per-page selection, or convert the whole document",
      "Adjustable resolution and JPG quality",
      "Thumbnail preview of every converted page",
      "Download images individually or bundled as a ZIP",
    ],
    faqs: [
      {
        q: "What resolution are the images?",
        a: "Pages are rendered at roughly 150 DPI on the balanced setting, which suits screens and ordinary printing. The high setting renders at about 300 DPI for larger, sharper files.",
      },
      {
        q: "Should I pick JPG or PNG?",
        a: "JPG for scanned pages and anything photographic — far smaller files. PNG for pages of sharp text, line art or screenshots, where JPG compression leaves visible fuzz around the edges.",
      },
      {
        q: "Will the text be searchable in the images?",
        a: "No. A JPG holds no text, only pixels. If you need searchable output, use PDF to Text instead, or keep the original PDF.",
      },
      {
        q: "Why do transparent areas turn white?",
        a: "JPG has no transparency channel, so anything transparent is flattened onto a white background. Convert to PNG if you need transparency preserved.",
      },
    ],
    related: ["pdf-to-png", "jpg-to-pdf", "pdf-to-text", "compress-image"],
  },
  {
    slug: "jpg-to-pdf",
    category: "pdf",
    name: "JPG to PDF",
    seoTitle: "JPG to PDF — Convert Images to PDF Online Free",
    description: "Combine JPG and PNG images into one PDF.",
    metaDescription:
      "Turn photos and scans into a single PDF. Set the page size, orientation and margins, reorder the images, then download.",
    intro:
      "Add your images, put them in the right order, choose a page layout, and get one tidy PDF. Everything happens in your browser.",
    what: "A PDF is the sensible container when several images belong together — a set of receipts, a photographed contract, a passport and a visa page. Each image becomes one page, scaled to fit the page size you choose without being stretched. The result is a single file that opens the same way on every device and prints predictably.",
    icon: "Images",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "photos to pdf", "scan to pdf", "convert"],
    accept: IMAGE_ACCEPT,
    acceptLabel: "JPG, PNG or WebP images",
    outputFormat: "A single PDF",
    multiple: true,
    clientSide: true,
    featured: true,
    howTo: [
      "Add the images you want in the PDF.",
      "Drag them into the order the pages should appear.",
      "Choose a page size, orientation and margin.",
      "Select Create PDF and download the result.",
    ],
    features: [
      "A4, Letter and fit-to-image page sizes",
      "Portrait, landscape or automatic orientation per image",
      "Adjustable margins",
      "Thumbnail previews with drag or keyboard reordering",
    ],
    faqs: [
      {
        q: "Are my images re-compressed?",
        a: "JPGs are embedded exactly as they are, so there is no second round of quality loss. PNG and WebP images are converted to a lossless or near-lossless form first, since PDF cannot embed those formats directly.",
      },
      {
        q: "What does the fit-to-image page size do?",
        a: "It makes each page exactly the size of the image it holds, so nothing is scaled and there are no borders. Useful for screenshots; less useful if you intend to print on paper.",
      },
      {
        q: "Will my photos be rotated correctly?",
        a: "Yes. Orientation recorded by the camera is applied when the image is read, so portrait photos stay portrait in the PDF.",
      },
      {
        q: "How many images can I add?",
        a: "As many as your device can hold in memory at once. A few hundred ordinary photos is routine; very large batches of high-resolution scans are better done in groups.",
      },
    ],
    related: ["image-to-pdf", "pdf-to-jpg", "merge-pdf", "compress-pdf"],
  },
  {
    slug: "pdf-to-png",
    category: "pdf",
    name: "PDF to PNG",
    seoTitle: "PDF to PNG — Convert PDF Pages to PNG Images Free",
    description: "Export PDF pages as lossless PNG images.",
    metaDescription:
      "Convert PDF pages to PNG images with crisp text and no compression artefacts. Choose pages and resolution, download one or all as a ZIP.",
    intro:
      "PNG keeps every pixel exactly as rendered, which makes it the right choice for pages of text, diagrams and screenshots.",
    what: "PNG is a lossless image format: what the renderer draws is what the file stores, with no compression artefacts. For a PDF page full of sharp-edged content — body text, tables, line drawings, UI screenshots — that means clean edges where a JPG would show faint grey halos. The cost is file size, often several times larger than the equivalent JPG.",
    icon: "FileType",
    keywords: ["convert", "pdf to image", "lossless", "transparent", "export pages", "pdf page to png"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "PNG images (ZIP for multiple)",
    multiple: false,
    clientSide: true,
    howTo: [
      "Add a PDF file.",
      "Select the pages you need and the output resolution.",
      "Select Convert to PNG.",
      "Download individual images or a ZIP of all of them.",
    ],
    features: [
      "Lossless output — no compression artefacts",
      "Resolution presets from screen to print",
      "Page selection with thumbnail previews",
      "ZIP download for multi-page documents",
    ],
    faqs: [
      {
        q: "When is PNG better than JPG here?",
        a: "Whenever the page is mostly text, tables or line art. JPG compression blurs sharp edges; PNG leaves them exact. For scanned photographs, JPG gives a far smaller file at the same apparent quality.",
      },
      {
        q: "Why are my PNG files so large?",
        a: "Lossless compression cannot discard detail, so a full-page render at 300 DPI easily reaches several megabytes. Dropping to the screen resolution preset is the quickest way to cut the size.",
      },
      {
        q: "Do the PNGs have transparent backgrounds?",
        a: "No. PDF pages are rendered onto a white page background, matching what you see in a PDF reader. The PNG therefore has an opaque white background.",
      },
      {
        q: "Can I convert only one page?",
        a: "Yes. Clear the selection and pick just the page you want — only that page is rendered, which is also much faster than converting the whole file.",
      },
    ],
    related: ["pdf-to-jpg", "pdf-to-text", "jpg-to-pdf", "png-to-jpg"],
  },
  {
    slug: "pdf-to-text",
    category: "pdf",
    name: "PDF to Text",
    seoTitle: "PDF to Text — Extract Text From PDF Online Free",
    description: "Pull the text out of a PDF as plain text.",
    metaDescription:
      "Extract selectable text from a PDF and copy it or download a .txt file. Works in your browser; scanned PDFs are clearly flagged.",
    intro:
      "Extracts the text layer a PDF already contains. If a document is a scan with no text layer, we tell you rather than returning an empty file.",
    what: "Most PDFs store their words as text alongside instructions for drawing them, which is why you can select and copy from them in a reader. Extraction reads that layer and writes it out as plain text, page by page. A scanned document is different: it contains only a photograph of the page, with no words recorded anywhere. Getting text out of a scan needs optical character recognition, which is a separate process.",
    icon: "FileText",
    keywords: ["extract", "copy text", "pdf to txt", "text layer", "get text from pdf"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "Plain text (.txt)",
    multiple: false,
    clientSide: true,
    howTo: [
      "Add a PDF file.",
      "Select Extract Text.",
      "Read the extracted text in the preview.",
      "Copy it to the clipboard or download a .txt file.",
    ],
    features: [
      "Page-by-page extraction with page markers",
      "Copy to clipboard or download as .txt",
      "Scanned, image-only PDFs are detected and reported",
      "Character and word count for the result",
    ],
    faqs: [
      {
        q: "I got no text back. What happened?",
        a: "The PDF almost certainly has no text layer — it is a scan or an export of images. Try selecting text in a PDF reader: if you cannot, there is nothing to extract and you need OCR.",
      },
      {
        q: "Do you support OCR for scanned documents?",
        a: "Not yet. This tool reads text that is already in the file. OCR is on the roadmap and will be offered as a separate tool when it lands.",
      },
      {
        q: "Why is the layout of the extracted text messy?",
        a: "A PDF records where each run of characters is drawn, not that it belongs to a column or a table cell. Multi-column pages and tables therefore come out interleaved. The reading order of ordinary single-column prose is usually correct.",
      },
      {
        q: "Are ligatures and accents handled?",
        a: "Usually. Text is decoded through the document's own character mapping, so accented letters and ligatures come through when the PDF embeds that mapping. Badly produced PDFs can omit it, which yields garbled characters.",
      },
    ],
    related: ["pdf-to-jpg", "pdf-to-png", "split-pdf", "merge-pdf"],
  },
  {
    slug: "rotate-pdf",
    category: "pdf",
    name: "Rotate PDF",
    seoTitle: "Rotate PDF — Turn PDF Pages Online Free",
    description: "Rotate single pages or the whole document.",
    metaDescription:
      "Fix sideways or upside-down PDF pages. Rotate one page or all of them in 90° steps, preview the result, and download.",
    intro:
      "Scanned a page sideways? Rotate individual pages or the entire document in 90° steps and save a corrected copy.",
    what: "Every page in a PDF carries a rotation value that tells the viewer which way up to draw it. Rotating a page changes that value rather than redrawing the content, so the operation is lossless and instant — text stays selectable and image quality is untouched. It is the standard fix for pages that came out of a scanner or a phone camera in the wrong orientation.",
    icon: "RotateCw",
    keywords: ["turn", "orientation", "sideways", "landscape", "upside down", "rotate pages"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "A single PDF",
    multiple: false,
    clientSide: true,
    howTo: [
      "Add the PDF you want to fix.",
      "Rotate individual pages from their thumbnails, or rotate every page at once.",
      "Check the previews.",
      "Select Save PDF and download the corrected file.",
    ],
    features: [
      "Thumbnail of every page, updated as you rotate",
      "Rotate one page, a selection, or all pages",
      "90°, 180° and 270° in either direction",
      "Lossless — page content is never re-rendered",
    ],
    faqs: [
      {
        q: "Does rotating reduce quality?",
        a: "No. Only the page's rotation attribute changes. The drawing instructions, fonts and images are copied across untouched.",
      },
      {
        q: "Why does a page look rotated in one app but not another?",
        a: "A few older viewers ignore the page rotation attribute. This is rare, but if a file must display correctly everywhere, converting the pages to images is the safe fallback.",
      },
      {
        q: "Can I rotate only the even pages?",
        a: "Yes — select those thumbnails and apply the rotation to the selection. This is the usual fix for a double-sided scan where alternate sheets fed in upside down.",
      },
      {
        q: "Is the original file changed?",
        a: "Never. A new PDF is produced for download, and the file on your device is left exactly as it was.",
      },
    ],
    related: ["delete-pages", "extract-pages", "split-pdf", "merge-pdf"],
  },
  {
    slug: "delete-pages",
    category: "pdf",
    name: "Delete PDF Pages",
    seoTitle: "Delete PDF Pages — Remove Pages From a PDF Free",
    description: "Remove unwanted pages from a PDF.",
    metaDescription:
      "Delete blank, duplicate or confidential pages from a PDF. Pick pages from thumbnails and download the trimmed document.",
    intro: "Select the pages you do not want from the thumbnail view and download a PDF without them.",
    what: "Deleting pages writes a new document containing only the pages you kept. Blank sheets from a duplex scan, a cover page you do not need, an internal appendix that should not be shared — removing them makes the file smaller and the document cleaner. Because the kept pages are copied rather than re-rendered, quality is unaffected.",
    icon: "Trash2",
    keywords: ["remove pages", "delete page", "trim", "drop pages", "erase pages"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "A single PDF",
    multiple: false,
    clientSide: true,
    howTo: [
      "Add a PDF file.",
      "Click the thumbnails of the pages you want to remove.",
      "Select Delete Pages.",
      "Download the trimmed PDF.",
    ],
    features: [
      "Visual thumbnail picker with page numbers",
      "Select all, invert selection, or pick by range",
      "Running count of pages kept and removed",
      "Remaining pages keep their original quality",
    ],
    faqs: [
      {
        q: "Can the deleted pages be recovered from the new file?",
        a: "No. Only the pages you kept are written into the output, so the removed content is genuinely absent — not merely hidden. That matters when you are stripping confidential pages before sharing.",
      },
      {
        q: "Does the file get smaller?",
        a: "Usually, roughly in proportion to how much content you removed. The saving is smaller if the deleted pages shared fonts or images with the pages you kept, since those resources are still needed.",
      },
      {
        q: "Can I delete every page?",
        a: "No. A PDF must keep at least one page, so the button stays disabled until at least one page is unselected.",
      },
      {
        q: "What if I only want to keep a handful of pages?",
        a: "Use Extract PDF Pages instead — selecting the few you want is quicker than deselecting all the rest.",
      },
    ],
    related: ["extract-pages", "split-pdf", "rotate-pdf", "merge-pdf"],
  },
  {
    slug: "extract-pages",
    category: "pdf",
    name: "Extract PDF Pages",
    seoTitle: "Extract PDF Pages — Save Selected Pages as a New PDF",
    description: "Pick specific pages and save them as a new PDF.",
    metaDescription:
      "Select the pages you need from a PDF and save them as a new document. Thumbnail picker, free, and processed in your browser.",
    intro:
      "Choose the pages worth keeping and download them as a new PDF. The original file stays untouched.",
    what: "Extraction is the opposite of deleting: you name the pages you want and everything else is left behind. It is how you pull one chapter out of a report, lift a signature page out of a contract, or share a single invoice from a monthly batch — without sending the rest of the document to anyone.",
    icon: "FileOutput",
    keywords: ["select pages", "save pages", "copy pages", "pick pages", "new pdf from pages"],
    accept: PDF_ACCEPT,
    acceptLabel: "A single PDF file",
    outputFormat: "A single PDF",
    multiple: false,
    clientSide: true,
    howTo: [
      "Add a PDF file.",
      "Select the pages you want to keep, from thumbnails or by typing a range.",
      "Select Extract Pages.",
      "Download the new PDF.",
    ],
    features: [
      "Thumbnail selection plus range input such as 2-5, 9",
      "Extracted pages stay in document order",
      "Option to save each extracted page as its own file",
      "Lossless page copying",
    ],
    faqs: [
      {
        q: "Are the extracted pages in the order I clicked them?",
        a: "No — they keep their original document order, which is almost always what you want. To change the order, extract first and then merge the single-page files in the order you prefer.",
      },
      {
        q: "What is the difference from Split PDF?",
        a: "Split is for cutting a document into several files at once. Extract is for pulling one specific set of pages into a single new file.",
      },
      {
        q: "Do links and annotations come across?",
        a: "Annotations on an extracted page come with it. A link that pointed at a page you did not extract no longer has a destination and will stop working.",
      },
      {
        q: "Can I extract pages from several PDFs at once?",
        a: "Not in one pass. Extract from each document separately, then use Merge PDF to combine the results.",
      },
    ],
    related: ["delete-pages", "split-pdf", "merge-pdf", "rotate-pdf"],
  },
];
