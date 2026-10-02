# Kiravi PDF

**Simple, Fast & Free PDF Tools**

Free online PDF and image tools that run entirely in your browser. Files are read from your
device, processed in the tab, and handed back as a download — nothing is uploaded, and there is
no account to create.

## Tools

**PDF** — Merge · Split · Compress · PDF to JPG · PDF to PNG · JPG to PDF · PDF to Text · Rotate ·
Delete pages · Extract pages

**Image** — Compress · Resize · JPG to PNG · PNG to JPG · WebP converter · Image to PDF · Crop ·
Rotate · Remove metadata

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · pdf-lib · pdf.js ·
Canvas API · Vitest · Playwright

Heavy processing libraries load on demand only — the homepage ships none of them.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm test             # unit + component tests
npm run test:e2e     # Playwright, desktop + mobile (reuses a server on $PORT, default 3000)
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the deployed origin; it
drives canonical URLs, the sitemap and link-preview images.

## Adding a tool

1. Add an entry to `lib/tools/pdf-tools.ts` or `lib/tools/image-tools.ts`.
2. Add a client component under `components/pdf/` or `components/image/`.
3. Add `app/<category>/<slug>/page.tsx` — nine lines, copy any existing one.

Routes, metadata, structured data, sitemap, search and related-tool links all derive from the
registry. `tests/unit/registry.test.ts` fails if a tool lacks a page or its related slugs are wrong.

## Privacy

Every tool processes files locally. The "processed in your browser" notice renders only for tools
where that is true, and analytics (off by default) never see file names or contents.
