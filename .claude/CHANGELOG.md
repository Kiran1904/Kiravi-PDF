# Changelog (Claude's working notes)

## [2026-10-02] — MVP built end to end

### Added

- Project scaffold: Next.js 16.3.8 (App Router, Turbopack), React 19.2, TS strict, Tailwind v4,
  shadcn/ui base-nova, ESLint 9 flat config, Prettier + tailwind plugin.
- `lib/tools/` registry with all 19 tools and individually written SEO copy/FAQs.
- Processing libs: `lib/pdf/{pdfjs,pdf-lib,edit,rasterize,compress,from-images,extract-text,page-ranges}.ts`,
  `lib/image/{decode,transform,output,metadata}.ts`, `lib/files/{validate,limits,download,format,kinds}.ts`,
  `lib/errors.ts`, `lib/analytics/index.ts`, `lib/seo.tsx`, `lib/site.ts`.
- Shared UI: dropzone, file list (HTML5 drag + arrow buttons), previews, progress, processing,
  download result, tool feedback, page thumbnail grid (IntersectionObserver-lazy), page selection.
- 19 tool pages, homepage, category pages, static pages, sitemap, robots, 404.
- Tests: Vitest (50) + Playwright (37 specs, desktop + Pixel 7); deterministic fixtures generator.

### Decisions

- No drag library: native HTML5 drag + always-visible arrow buttons satisfy the keyboard requirement.
- Native `<select>/<input type=range|color>` over shadcn composite controls (unverified base-ui APIs).
- pdfjs worker per opened document via `workerSrc` + `loadingTask.destroy()`; shared `workerPort`
  caused re-initialisation risk after destroy.
- Compress PDF implemented honestly: lossless rewrite vs raster re-encode, original kept when no gain.
- E2E runs against the production build on :3001 when the single allowed dev server is stale.

### Fixed

- React 19 `set-state-in-effect` lint: replaced reset-effects with file/pageCount-tagged derived state
  (`usePdfPages`, `usePageSelection`, `SplitPdf`) and a keyed `CropEditor`.
