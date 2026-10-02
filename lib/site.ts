export const site = {
  name: "Kiravi PDF",
  tagline: "Simple, Fast & Free PDF Tools",
  description:
    "Free online PDF and image tools. Merge, split, compress, convert and edit your files directly in your browser — no sign-up and no uploads.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiravipdf.com",
  email: "hello@kiravipdf.com",
  twitter: "@kiravipdf",
} as const;

export const mainNav = [
  { label: "PDF Tools", href: "/pdf" },
  { label: "Image Tools", href: "/image" },
  { label: "Compress", href: "/pdf/compress-pdf" },
  { label: "Convert", href: "/pdf/pdf-to-jpg" },
  { label: "About", href: "/about" },
] as const;

export const footerNav = {
  tools: [
    { label: "Merge PDF", href: "/pdf/merge-pdf" },
    { label: "Compress PDF", href: "/pdf/compress-pdf" },
    { label: "Split PDF", href: "/pdf/split-pdf" },
    { label: "PDF to JPG", href: "/pdf/pdf-to-jpg" },
    { label: "JPG to PDF", href: "/pdf/jpg-to-pdf" },
    { label: "Compress Image", href: "/image/compress-image" },
    { label: "Resize Image", href: "/image/resize-image" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;
