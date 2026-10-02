# Kiravi PDF — Build Plan

**Brand:** Kiravi PDF · **Tagline:** Simple, Fast & Free PDF Tools
**Product:** Browser-first PDF & image tools. No account, no upload, no backend.

> This plan is the working contract for the build. Phases are checked off as they land.
> Section numbers below map to the product spec.

---

## Phase 1 — Analysis: risks and hard constraints

Recorded before implementation so the MVP does not promise what the stack cannot do.

### R1. PDF compression is the one genuinely hard requirement

`pdf-lib` cannot re-compress a PDF's content streams. It can only rewrite the
document (dropping unreferenced objects, using object streams). On a text PDF
that yields single-digit percentage savings; on a scanned PDF it yields almost
nothing.

**Honest implementation, two modes:**

- **Light (lossless)** — rewrite via `pdf-lib` with object streams. Text stays
  selectable. Saving is small and we say so in the UI.
- **Balanced / Strong (lossy)** — render each page with `pdfjs-dist` to a canvas
  at a reduced scale, re-encode as JPEG, rebuild the PDF from those images.
  This genuinely shrinks scanned documents by 60–90%. It **destroys the text
  layer**, which the UI states plainly before the user runs it.
- If the output is larger than the input, we keep the input and say so.

No fixed percentage is ever promised. (spec §7)

### R2. OCR is not in the MVP

`pdf-to-text` reads an existing text layer only. Image-only PDFs are detected
(zero extracted glyphs across sampled pages) and reported as such. No OCR claim
anywhere in copy. (spec §7)

### R3. Browser memory is the real file-size ceiling

Everything runs in a tab. A `Uint8Array` of the whole PDF plus a canvas per
rendered page is the peak. Mitigations:

- Per-tool `maxBytes` / `maxPages` in the registry, enforced before processing.
- Pages rendered and encoded **one at a time**, canvas released between pages.
- Images downscaled before any canvas work when they exceed a pixel budget
  (`maxPixels`), since a 50 MP photo is 200 MB of RGBA.
- `OutOfMemory` mapped to a friendly "file is too complex for your browser" error.

### R4. MIME types from the browser cannot be trusted

`File.type` comes from the OS extension map and is absent or wrong often enough
to matter — and a renamed `.exe` would sail through. Validation reads the first
bytes of the file and checks the actual signature (`%PDF-`, `\xFF\xD8\xFF`,
PNG's 8-byte magic, RIFF/WEBP, GIF, BMP). Extension and MIME are hints only. (spec §18)

### R5. Bundle weight

`pdfjs-dist` (~350 KB gz incl. worker) and `pdf-lib` (~200 KB gz) must never
reach the homepage. Rule: **no static import of either, anywhere.** Both are
loaded by `await import()` inside the function that needs them, and that rule is
enforced by a unit test that greps the source tree.

### R6. Web Workers

`pdfjs-dist` ships its own worker for parsing/rendering — enabled, so page
rendering is already off the main thread. For the remaining hot loop (canvas
encode + ZIP build) we `yield` to the event loop between pages and report
progress, which keeps the UI responsive without a second worker and without
shipping a worker bundle per tool. `ponytail:` upgrade path noted in code.

### R7. SEO risk — thin/duplicate pages

19 tool pages off one template is a doorway-page shape if the copy is generic.
Mitigation: every tool's `what`, `howTo`, `features` and `faqs` are written
individually, and FAQ structured data is emitted only from FAQs actually
rendered on that page. (spec §16)

---

## Phase 2 — Architecture

### Stack (verified at build time)

| Concern              | Choice                   | Version |
| -------------------- | ------------------------ | ------- |
| Framework            | Next.js, App Router      | 16.3.8  |
| React                | React                    | 19.2.8  |
| Styling              | Tailwind CSS             | v4      |
| Components           | shadcn/ui (base-nova)    | current |
| PDF write            | `pdf-lib`                | 1.17    |
| PDF read/render      | `pdfjs-dist`             | 6.3     |
| ZIP                  | `jszip`                  | 3.10    |
| Icons                | `lucide-react`           | 1.50    |
| Unit/component tests | Vitest + Testing Library | current |
| E2E                  | Playwright               | current |
| Deploy               | Vercel                   | —       |

No `sharp`. No DB, auth, payments, storage, cloud processing. (spec §4)
Reordering uses native HTML5 drag events plus keyboard arrow buttons — no drag
library, and the keyboard path is the accessible alternative §17 requires.

### Routes (spec §9)

```
/                        homepage
/pdf/<10 slugs>          merge-pdf split-pdf compress-pdf pdf-to-jpg jpg-to-pdf
                         pdf-to-png pdf-to-text rotate-pdf delete-pages extract-pages
/image/<9 slugs>         compress-image resize-image jpg-to-png png-to-jpg
                         webp-converter image-to-pdf crop-image rotate-image remove-metadata
/about /contact /privacy /terms
/sitemap.xml /robots.txt
```

One directory per tool (static import of that tool's client component only) so
code-splitting is exact and nothing is magic.

### Component architecture

```
components/
  layout/   Header, Footer, Logo, Container, MobileNav
  tools/    ToolCard, ToolGrid, ToolHeader, Breadcrumbs, Faq, RelatedTools,
            ToolSearch, ToolPageShell, ToolIcon, PrivacyNote, HowToUse, Features
  upload/   FileDropzone, FileList, FilePreview, ProcessingState,
            ProgressIndicator, DownloadResult, ErrorMessage
  pdf/      one client component per PDF tool
  image/    one client component per image tool
  ui/       shadcn primitives
```

`ToolPageShell` is a Server Component: breadcrumb → H1 → intro → `{children}`
(the tool's client island) → How to use → Features → FAQ → Related tools →
JSON-LD. A tool page is ~10 lines; all SEO chrome comes from the registry.

`useFileTool` hook owns the state machine every tool shares:
`idle → validating → ready → processing(progress) → done | error`
and the empty/invalid/failure branches. Tool components supply only a
`process(files, options)` function. (spec §12, §26.13)

### Tool registry (spec §13)

`lib/tools/` — `types.ts`, `pdf-tools.ts`, `image-tools.ts`, `registry.ts`.
Each entry carries: slug, category, name, SEO title/description, intro, `what`,
icon, keywords, accepted input formats + `accept` string, output format,
`maxBytes`, `maxPages`, `maxPixels`, `multiple`, `clientSide`, `featured`,
`howTo`, `features`, `faqs`, `related`.

It powers homepage grids, nav, search index, related tools, breadcrumbs,
per-page metadata, sitemap and footer links. Adding a tool = one registry entry
plus one client component.

`getToolIndex()` returns a trimmed projection for the client search box, so the
SEO prose never ships to the browser.

### Processing architecture

```
lib/pdf/     merge split compress rasterize from-images extract-text
             rotate delete-pages extract-pages  (+ pdfjs/pdf-lib loaders)
lib/image/   compress resize convert crop rotate strip-metadata decode
lib/files/   validate (magic bytes) · limits · download · format-bytes
lib/errors   AppError + code -> user message
lib/analytics  provider-agnostic track()
```

Pure functions over `File`/`ArrayBuffer`, no React, no DOM beyond canvas —
which is what makes them unit-testable. (spec §20)

### Error model (spec §21)

`AppError` with a closed set of codes:
`UNSUPPORTED_TYPE · CORRUPT_FILE · ENCRYPTED_PDF · FILE_TOO_LARGE ·
TOO_MANY_PAGES · EMPTY_FILE · TOO_MANY_FILES · NOT_ENOUGH_FILES ·
NO_TEXT_LAYER · OUT_OF_MEMORY · PROCESSING_FAILED · BROWSER_UNSUPPORTED`
Each maps to one friendly sentence, parameterised by the expected format where
useful. Unknown throwables become `PROCESSING_FAILED`. Nothing from a library
or a stack trace reaches the DOM; only the code is logged.

### SEO architecture (spec §16)

- `metadataBase` + per-page canonical, OG and Twitter from the registry.
- JSON-LD: `WebSite` + `SearchAction` on `/`; `WebApplication`,
  `BreadcrumbList` and `FAQPage` per tool page.
- `app/sitemap.ts` and `app/robots.ts` generated from the registry.
- Internal linking via `RelatedTools` and the footer.

### Accessibility (spec §17)

Dropzone is a real `<button>` wrapping a visually hidden `<input type="file">`;
drop is an enhancement, never the only path. Reorder has arrow buttons. Status
changes announced through one `aria-live="polite"` region per tool. Progress via
`role="progressbar"`. Status always carries an icon and a word, never colour
alone. Visible `:focus-visible` rings everywhere.

### Analytics (spec §19)

`track(event, props)` behind a pluggable provider; no-op unless
`NEXT_PUBLIC_ANALYTICS_PROVIDER` is set. Events: `tool_viewed`,
`file_selected` (count, total bytes, extension only), `processing_started`,
`processing_completed` (duration), `processing_failed` (error **code** only),
`download_clicked`. No file names, no contents, no PII.

---

## Phase 3 — Foundation

- [x] Next.js + TS + Tailwind v4 + shadcn/ui + ESLint
- [x] Prettier
- [x] Brand design tokens
- [x] Tool registry (19 tools, hand-written SEO copy)
- [x] errors · files/validate · limits · analytics
- [x] Layout: Header, Footer, Logo, MobileNav, Container
- [x] Shared tool components + `useFileTool`

## Phase 4 — Homepage

- [x] Hero + search, Popular / PDF / Image grids, Why, How it works,
      Privacy, FAQ, CTA, Footer
- [x] `/about` `/contact` `/privacy` `/terms`, sitemap, robots, 404

## Phase 5 — First complete tool

- [x] **Merge PDF** end to end; lock the reusable architecture against it

## Phase 6 — Remaining tools

- [x] 9 remaining PDF tools
- [x] 9 image tools

## Phase 7 — Validation

- [x] Unit: validation, registry integrity, search, errors, bundle discipline (50 tests)
- [x] Component: dropzone, file list, processing/error/empty states, download
- [x] E2E: every tool's real upload → process → download verified by parsing
      the output; invalid/empty/scanned files; links, metadata, sitemap, 404 (37 specs × desktop + mobile)
- [x] Mobile viewport pass (Pixel 7 project) · keyboard paths tested · bundle check (no PDF libs on `/`)

## Phase 8 — Final quality gate

- [x] `tsc --noEmit` clean · ESLint clean · tests green · `next build` clean
- [x] Metadata, sitemap, robots verified · no console errors · no dead buttons

---

## Out of scope for the MVP (spec §24)

OCR · PDF editor · signing · watermark · password protect/unlock · HTML/Word/
Excel to PDF · PDF to Word · AI summarise/chat · batch queues · auth · premium ·
cloud processing. The registry + shell + error model accommodate all of them
without refactoring.
