import type { Tool } from "./types";

const ANY_IMAGE = "image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp";
const JPG_ONLY = "image/jpeg,.jpg,.jpeg";
const PNG_ONLY = "image/png,.png";

export const imageTools: Tool[] = [
  {
    slug: "compress-image",
    category: "image",
    name: "Compress Image",
    seoTitle: "Compress Image — Reduce JPG & PNG File Size Free",
    description: "Make images smaller without obvious quality loss.",
    metaDescription:
      "Compress JPG, PNG and WebP images in your browser. Pick a quality level, compare the before and after sizes, and download.",
    intro:
      "Re-encode your images at a lower quality to cut their file size. You see the original and new size for every image before downloading.",
    what: "Image compression discards detail the eye is least likely to notice, then stores what is left more efficiently. At moderate settings the difference is invisible on screen while the file is a fraction of its original size — which is why compression is the single most effective thing you can do for page load times. Photographs tolerate it well; flat graphics and screenshots with sharp edges show artefacts sooner.",
    icon: "ImageDown",
    keywords: [
      "reduce",
      "shrink",
      "optimise",
      "optimize",
      "smaller",
      "file size",
      "compress jpg",
      "compress png",
    ],
    accept: ANY_IMAGE,
    acceptLabel: "JPG, PNG, WebP, GIF or BMP images",
    outputFormat: "Compressed images (ZIP for multiple)",
    multiple: true,
    clientSide: true,
    featured: true,
    howTo: [
      "Add one or more images.",
      "Choose a quality level, or set a target size.",
      "Select Compress Images.",
      "Download them individually or as a ZIP.",
    ],
    features: [
      "Batch compression of many images at once",
      "Per-image original size, new size and percentage saved",
      "Optional maximum width to cut size further",
      "WebP output for the smallest files",
    ],
    faqs: [
      {
        q: "What quality setting should I use?",
        a: "Around 80% is the usual sweet spot for photographs — a large size reduction with no visible difference at normal viewing size. Below 60% you start to see blocking in smooth areas such as skies.",
      },
      {
        q: "My PNG got bigger. Why?",
        a: "PNG is lossless, so re-encoding a well-optimised PNG can add bytes rather than remove them. For screenshots and flat graphics, converting to WebP gives a genuine saving; for photographs, convert to JPG.",
      },
      {
        q: "Does compressing remove EXIF data?",
        a: "Yes. Re-encoding through the browser canvas drops the original metadata, including camera details and GPS coordinates. That is good for privacy but means date-taken information is lost.",
      },
      {
        q: "Can I compress the same image twice?",
        a: "You can, but avoid it. Each lossy pass throws away more detail, and the damage compounds. Always start from the original file.",
      },
    ],
    related: ["resize-image", "webp-converter", "png-to-jpg", "compress-pdf"],
  },
  {
    slug: "resize-image",
    category: "image",
    name: "Resize Image",
    seoTitle: "Resize Image — Change Image Dimensions Online Free",
    description: "Change image dimensions by pixels or percentage.",
    metaDescription:
      "Resize JPG, PNG and WebP images to exact pixel dimensions or by percentage, with the aspect ratio locked if you want it.",
    intro:
      "Set a width, a height, or a percentage. Lock the aspect ratio to avoid distortion, and download the resized images.",
    what: "Resizing changes how many pixels an image contains. Making an image smaller is safe and is the right fix for a photo that is far larger than the space it will be displayed in — a 6000-pixel-wide camera file inside a 1200-pixel column is wasted bandwidth. Making an image larger cannot invent detail that was never captured, so enlarging always costs sharpness.",
    icon: "Scaling",
    keywords: ["scale", "dimensions", "width", "height", "pixels", "resize jpg", "resize png", "thumbnail"],
    accept: ANY_IMAGE,
    acceptLabel: "JPG, PNG, WebP, GIF or BMP images",
    outputFormat: "Resized images (ZIP for multiple)",
    multiple: true,
    clientSide: true,
    featured: true,
    howTo: [
      "Add the images you want to resize.",
      "Enter a width and height in pixels, or a percentage.",
      "Keep the aspect ratio locked unless you want the image stretched.",
      "Select Resize and download the result.",
    ],
    features: [
      "Resize by exact pixels or by percentage",
      "Aspect ratio lock to prevent distortion",
      "Batch resize with one set of dimensions",
      "High-quality downscaling",
    ],
    faqs: [
      {
        q: "Will resizing blur my image?",
        a: "Reducing size keeps it sharp, and often looks crisper than before. Enlarging interpolates between existing pixels, which softens the result — there is no way around that.",
      },
      {
        q: "What does locking the aspect ratio do?",
        a: "It keeps the original proportions: type a width and the height follows automatically. Unlock it only when you deliberately want to stretch or squash the picture.",
      },
      {
        q: "What size should a web image be?",
        a: "Roughly twice the width it will be displayed at, to stay sharp on high-density screens. A full-width hero is typically 1920–2400 pixels; an in-article photograph 1200–1600.",
      },
      {
        q: "Does resizing also reduce file size?",
        a: "Substantially, since there are far fewer pixels to store. Halving the width and height leaves about a quarter as many pixels. Combine it with Compress Image for the smallest files.",
      },
    ],
    related: ["compress-image", "crop-image", "webp-converter", "rotate-image"],
  },
  {
    slug: "jpg-to-png",
    category: "image",
    name: "JPG to PNG",
    seoTitle: "JPG to PNG — Convert JPG Images to PNG Free",
    description: "Convert JPG photos to lossless PNG files.",
    metaDescription:
      "Convert JPG images to PNG in your browser. Lossless output, batch conversion and no upload required.",
    intro:
      "Convert JPG files to PNG, the format to use when you need lossless storage or a transparency channel.",
    what: "PNG stores pixels losslessly and supports transparency; JPG does neither. Converting to PNG is the right move when an image will be edited and re-saved repeatedly, or when it needs a transparent background added. Be clear about what the conversion cannot do: the compression artefacts already baked into the JPG stay exactly where they are. PNG preserves them faithfully rather than removing them.",
    icon: "ArrowRightLeft",
    keywords: ["convert", "jpeg to png", "lossless", "transparency", "format change"],
    accept: JPG_ONLY,
    acceptLabel: "JPG / JPEG images",
    outputFormat: "PNG images (ZIP for multiple)",
    multiple: true,
    clientSide: true,
    howTo: [
      "Add your JPG images.",
      "Select Convert to PNG.",
      "Check the previews.",
      "Download each PNG, or all of them as a ZIP.",
    ],
    features: [
      "Lossless PNG output",
      "Batch conversion",
      "Camera orientation applied automatically",
      "Original metadata is not carried over",
    ],
    faqs: [
      {
        q: "Does converting to PNG improve the image?",
        a: "No. It stops further quality loss from here on, but the detail the JPG already discarded is gone and cannot be restored.",
      },
      {
        q: "Why is the PNG so much bigger than the JPG?",
        a: "Lossless compression cannot throw anything away. For photographs, a PNG is routinely three to five times the size of the JPG it came from. That is the price of the format.",
      },
      {
        q: "Will my JPG gain a transparent background?",
        a: "Not by itself. The conversion produces an opaque PNG; the format can hold transparency, but adding it requires an editor to remove the background.",
      },
      {
        q: "When should I keep JPG instead?",
        a: "For any photograph you are simply publishing or sharing. JPG is smaller at equivalent visual quality, and converting to PNG only inflates it.",
      },
    ],
    related: ["png-to-jpg", "webp-converter", "compress-image", "image-to-pdf"],
  },
  {
    slug: "png-to-jpg",
    category: "image",
    name: "PNG to JPG",
    seoTitle: "PNG to JPG — Convert PNG Images to JPG Free",
    description: "Convert PNG files to smaller JPG images.",
    metaDescription:
      "Convert PNG images to JPG with adjustable quality and a background colour for transparent areas. Free and browser-based.",
    intro:
      "Turn PNGs into much smaller JPGs. Choose the quality, and the colour that fills any transparent areas.",
    what: "JPG compresses photographic content far more efficiently than PNG, so converting is usually about size: a screenshot-sized PNG can drop by 80% with no visible change. The one thing to decide first is transparency. JPG has no alpha channel, so transparent pixels must be filled with a solid colour — white by default, which suits most documents but can look wrong against a dark page.",
    icon: "ArrowRightLeft",
    keywords: ["convert", "png to jpeg", "smaller", "flatten", "remove transparency", "format change"],
    accept: PNG_ONLY,
    acceptLabel: "PNG images",
    outputFormat: "JPG images (ZIP for multiple)",
    multiple: true,
    clientSide: true,
    howTo: [
      "Add your PNG images.",
      "Set the JPG quality and pick a background colour for transparent areas.",
      "Select Convert to JPG.",
      "Download individually or as a ZIP.",
    ],
    features: [
      "Adjustable JPG quality with a live size estimate",
      "Choose the fill colour for transparent regions",
      "Batch conversion",
      "Typically 70–90% smaller than the source PNG",
    ],
    faqs: [
      {
        q: "What happens to transparent areas?",
        a: "They are filled with the background colour you choose, because JPG cannot store transparency. White is the default; pick something else if the image will sit on a coloured background.",
      },
      {
        q: "Will I notice the quality drop?",
        a: "Rarely on photographs at 85% quality. On screenshots and flat graphics with hard edges and text, JPG artefacts show up much sooner — WebP is the better conversion target for those.",
      },
      {
        q: "How much smaller will the file be?",
        a: "Commonly 70–90% smaller for photographic content. Images that are mostly one flat colour compress extremely well in PNG already, so the gain there is smaller.",
      },
      {
        q: "Is the conversion reversible?",
        a: "You can convert back to PNG, but the quality lost in the JPG step does not come back. Keep the PNG original if the image still needs editing.",
      },
    ],
    related: ["jpg-to-png", "compress-image", "webp-converter", "image-to-pdf"],
  },
  {
    slug: "webp-converter",
    category: "image",
    name: "WebP Converter",
    seoTitle: "WebP Converter — Convert To and From WebP Free",
    description: "Convert images to WebP, or WebP back to JPG and PNG.",
    metaDescription:
      "Convert JPG and PNG images to WebP for much smaller files, or convert WebP back to JPG or PNG. Free and browser-based.",
    intro:
      "Convert in either direction. WebP gives noticeably smaller files than JPG or PNG at the same visual quality.",
    what: "WebP is a modern image format supported by every current browser. At matched visual quality it is typically 25–35% smaller than JPG and much smaller than PNG for graphics, and it supports transparency, which JPG does not. Converting a site's images to WebP is one of the cheapest page-speed wins available. Converting back to JPG or PNG is still worth having for older software that cannot open WebP.",
    icon: "Repeat",
    keywords: ["webp", "convert", "to webp", "from webp", "modern format", "smaller images", "page speed"],
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    acceptLabel: "JPG, PNG or WebP images",
    outputFormat: "WebP, JPG or PNG images",
    multiple: true,
    clientSide: true,
    featured: true,
    howTo: [
      "Add your images — WebP, JPG or PNG.",
      "Choose the output format and quality.",
      "Select Convert.",
      "Download the converted files individually or as a ZIP.",
    ],
    features: [
      "Convert to WebP, or from WebP to JPG or PNG",
      "Lossy or highest-quality WebP output",
      "Transparency preserved when converting to WebP",
      "Size comparison for every file",
    ],
    faqs: [
      {
        q: "Is WebP supported everywhere?",
        a: "In browsers, yes — Chrome, Safari, Firefox and Edge have supported it for years. Some older desktop applications and a few email clients still cannot open it, so keep a JPG copy for attachments.",
      },
      {
        q: "How much smaller is WebP really?",
        a: "About 25–35% smaller than a JPG of equivalent quality, and often far smaller than PNG for flat graphics and screenshots. The exact figure depends on the image.",
      },
      {
        q: "Which WebP quality should I pick?",
        a: "Around 80% for photographs — it is the setting the format is designed around. For logos, icons and screenshots push the quality to the top, where WebP still usually beats PNG on size.",
      },
      {
        q: "Does WebP keep transparency?",
        a: "Yes. Converting a transparent PNG to WebP keeps the alpha channel intact. Converting to JPG does not, because JPG has no way to store it.",
      },
    ],
    related: ["compress-image", "jpg-to-png", "png-to-jpg", "resize-image"],
  },
  {
    slug: "image-to-pdf",
    category: "image",
    name: "Image to PDF",
    seoTitle: "Image to PDF — Convert Images to a PDF Document Free",
    description: "Turn any images into a single PDF document.",
    metaDescription:
      "Convert JPG, PNG and WebP images into one PDF. Set page size, orientation and margins, reorder pages, then download.",
    intro:
      "Add images in any supported format, arrange them, and download a single PDF — one image per page.",
    what: "Bundling images into a PDF is the usual way to submit photographed paperwork: receipts for an expense claim, a signed form, pages of a passport. One file is easier to attach and read than a folder of pictures, page order is fixed, and it prints the same way everywhere. Each image becomes one page, scaled to fit the page size without distortion.",
    icon: "FileDown",
    keywords: ["images to pdf", "photo to pdf", "picture to pdf", "scan to pdf", "convert", "webp to pdf"],
    accept: ANY_IMAGE,
    acceptLabel: "JPG, PNG, WebP, GIF or BMP images",
    outputFormat: "A single PDF",
    multiple: true,
    clientSide: true,
    howTo: [
      "Add your images.",
      "Drag them into the order you want the pages.",
      "Choose a page size, orientation and margin.",
      "Select Create PDF and download it.",
    ],
    features: [
      "Accepts WebP, GIF and BMP as well as JPG and PNG",
      "A4, Letter or fit-to-image page sizes",
      "Per-image or fixed orientation",
      "Reorder by dragging or with keyboard controls",
    ],
    faqs: [
      {
        q: "How is this different from JPG to PDF?",
        a: "It is the same builder with a wider set of accepted inputs. Use this one when your images are WebP, GIF or BMP; either tool handles JPG and PNG.",
      },
      {
        q: "Can I get one PDF per image instead?",
        a: "Not from this tool — it always produces a single document. Build the combined PDF and then use Split PDF if you need the pages as separate files.",
      },
      {
        q: "Why is my PDF so large?",
        a: "Because the images are embedded at full resolution. Run them through Compress Image or Resize Image first; a 4000-pixel photograph is far more detail than an A4 page needs.",
      },
      {
        q: "Will the PDF be searchable?",
        a: "No. The pages hold pictures of text, not text, so nothing is searchable. That needs OCR, which is not part of this tool.",
      },
    ],
    related: ["jpg-to-pdf", "compress-image", "resize-image", "pdf-to-jpg"],
  },
  {
    slug: "crop-image",
    category: "image",
    name: "Crop Image",
    seoTitle: "Crop Image — Cut and Trim Images Online Free",
    description: "Trim an image to the area you want to keep.",
    metaDescription:
      "Crop JPG, PNG and WebP images by dragging a selection, with optional fixed aspect ratios. Free and runs in your browser.",
    intro:
      "Drag a selection over the part you want to keep, or lock it to a ratio such as 1:1 or 16:9, then download the cropped image.",
    what: "Cropping removes the outer parts of an image to tighten the composition or to fit a required shape. It is a lossless operation in the sense that the pixels you keep are unchanged — only the discarded edges are gone. Fixed ratios matter in practice: a 1:1 square for an avatar, 16:9 for a video thumbnail, 4:5 for a portrait post.",
    icon: "Crop",
    keywords: ["cut", "trim", "crop jpg", "crop png", "square", "aspect ratio", "cut image"],
    accept: ANY_IMAGE,
    acceptLabel: "A single JPG, PNG, WebP, GIF or BMP image",
    outputFormat: "A cropped image",
    multiple: false,
    clientSide: true,
    howTo: [
      "Add an image.",
      "Drag the handles to frame the area you want to keep.",
      "Optionally lock the selection to a fixed aspect ratio.",
      "Select Crop and download the result.",
    ],
    features: [
      "Draggable, resizable selection with keyboard nudging",
      "Fixed ratio presets — 1:1, 4:3, 16:9, 3:2 — or free form",
      "Exact pixel dimensions shown while you drag",
      "Output in the same format as the input",
    ],
    faqs: [
      {
        q: "Does cropping lose quality?",
        a: "The kept pixels are not resampled, so the detail is identical. JPG files are re-encoded on save, which adds one light compression pass; PNG output stays lossless.",
      },
      {
        q: "What size should a profile picture be?",
        a: "Square, and at least 400×400 pixels. Most platforms display avatars as circles, so keep the face centred and leave a little room at the edges.",
      },
      {
        q: "Can I crop to an exact pixel size?",
        a: "Yes. Drag roughly into place and then type the exact width and height; the live dimension readout shows what you have selected.",
      },
      {
        q: "Can I crop several images at once?",
        a: "No — cropping is a per-image judgement, so this tool works on one image at a time. For a uniform size across many files, use Resize Image.",
      },
    ],
    related: ["resize-image", "rotate-image", "compress-image", "remove-metadata"],
  },
  {
    slug: "rotate-image",
    category: "image",
    name: "Rotate Image",
    seoTitle: "Rotate Image — Turn and Flip Images Online Free",
    description: "Rotate or flip images in a couple of clicks.",
    metaDescription:
      "Rotate images by 90°, 180° or 270°, or flip them horizontally and vertically. Batch support, free, no upload.",
    intro:
      "Rotate in 90° steps or mirror an image, preview the result, and download. Works on several images at once.",
    what: "Phone photographs often arrive sideways because the orientation is recorded as metadata rather than applied to the pixels, and not every application reads it. Rotating bakes the correct orientation into the image itself, so it displays the same way everywhere. Flipping mirrors the image, which is occasionally needed for scanned transparencies or for matching a layout.",
    icon: "RotateCcw",
    keywords: ["turn", "flip", "mirror", "orientation", "sideways", "rotate jpg", "rotate png"],
    accept: ANY_IMAGE,
    acceptLabel: "JPG, PNG, WebP, GIF or BMP images",
    outputFormat: "Rotated images (ZIP for multiple)",
    multiple: true,
    clientSide: true,
    howTo: [
      "Add one or more images.",
      "Rotate left or right, or flip horizontally or vertically.",
      "Check the previews.",
      "Download the corrected images.",
    ],
    features: [
      "90°, 180° and 270° rotation",
      "Horizontal and vertical flipping",
      "Applies the same transform across a batch",
      "Orientation is written into the pixels, not just the metadata",
    ],
    faqs: [
      {
        q: "Why does my photo look sideways in some apps but not others?",
        a: "The camera stored the rotation as an EXIF tag instead of rotating the pixels. Apps that read the tag display it correctly; those that ignore it do not. Rotating here fixes the pixels, so every app agrees.",
      },
      {
        q: "Does rotating lose quality?",
        a: "Rotation in 90° steps moves pixels without resampling them. JPG output is re-encoded once on save, which is a very small loss; PNG and WebP lossless output lose nothing.",
      },
      {
        q: "What is the difference between rotating and flipping?",
        a: "Rotation turns the image around its centre and keeps the content readable. Flipping mirrors it, so text comes out backwards.",
      },
      {
        q: "Can I rotate by an arbitrary angle?",
        a: "Not here — only quarter turns, which stay lossless and need no cropping. A five-degree correction to a crooked scan requires resampling and a crop, so it belongs in an image editor.",
      },
    ],
    related: ["crop-image", "resize-image", "compress-image", "rotate-pdf"],
  },
  {
    slug: "remove-metadata",
    category: "image",
    name: "Remove Image Metadata",
    seoTitle: "Remove Image Metadata — Strip EXIF Data Online Free",
    description: "Strip EXIF, GPS and camera data from images.",
    metaDescription:
      "Remove EXIF metadata, including GPS location and camera details, from JPG and PNG images before you share them. Browser-based and free.",
    intro:
      "Photographs often carry the location and time they were taken. This strips that data out, leaving just the picture.",
    what: "Cameras and phones attach metadata to every photograph: the model of the device, the exposure settings, the date and time, and very often the exact GPS coordinates. That information travels with the file when you post or send it. Stripping metadata rewrites the image with the pixels alone, so nothing about where or when it was taken goes with it.",
    icon: "ShieldOff",
    keywords: ["exif", "gps", "privacy", "location", "strip metadata", "clean image", "anonymise"],
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    acceptLabel: "JPG, PNG or WebP images",
    outputFormat: "Cleaned images (ZIP for multiple)",
    multiple: true,
    clientSide: true,
    howTo: [
      "Add the images you want to clean.",
      "Review what metadata was found in each one.",
      "Select Remove Metadata.",
      "Download the cleaned images.",
    ],
    features: [
      "Removes EXIF, GPS, IPTC and XMP data",
      "Shows what was found before you strip it",
      "Visible image quality is preserved",
      "Batch processing for several images",
    ],
    faqs: [
      {
        q: "What exactly gets removed?",
        a: "Everything outside the pixels: camera make and model, lens and exposure settings, date and time, software history, copyright fields and GPS coordinates. The visible image is unchanged.",
      },
      {
        q: "Do social networks not strip this already?",
        a: "Most large platforms do strip EXIF on upload. But files sent by email or chat, uploaded to a forum, or attached to a listing frequently keep it. Strip it yourself and you do not have to rely on the platform.",
      },
      {
        q: "Does removing metadata recompress the image?",
        a: "The image is rewritten, which for JPG means one encoding pass at high quality. The change is not visible at normal viewing size, though the file size will shift slightly.",
      },
      {
        q: "How do I check that it worked?",
        a: "Open the file's properties or details panel in your operating system, or re-add the cleaned file here — the metadata summary should come back empty.",
      },
    ],
    related: ["compress-image", "resize-image", "crop-image", "rotate-image"],
  },
];
