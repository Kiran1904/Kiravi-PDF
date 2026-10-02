@AGENTS.md

# Kiravi PDF

Browser-first PDF & image tools. Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4,
shadcn/ui (base-nova / `@base-ui/react`). No backend, no DB, no auth: every tool runs in the tab.
`PLAN.md` is the build contract (risks, architecture, phases).

## Commands

- `npm run dev` — dev server (Next 16 allows one dev server per project; if routes 404 after adding
  files, restart it — Turbopack's watcher has missed new route directories before)
- `npm run build && npm start` — production
- `npm run typecheck` · `npm run lint` · `npm run format`
- `npm test` — Vitest unit + component tests (`tests/unit`)
- `npm run test:e2e` — Playwright, desktop + Pixel 7. Reuses a server on `$PORT` (default 3000);
  to test the production build: `npm run build && npx next start -p 3001 &` then `PORT=3001 npm run test:e2e`
- `npm run fixtures` — regenerate `tests/fixtures/*` (deterministic PDFs/PNGs)

## Architecture

- `lib/tools/registry.ts` (+ `pdf-tools.ts`, `image-tools.ts`) is the single source of truth: routes,
  SEO copy, FAQ, limits, related tools. Homepage grids, nav, search, sitemap, metadata all read it.
- A tool = one registry entry + one client component + one 9-line `app/<category>/<slug>/page.tsx`
  that renders `<ToolPageShell tool={tool}><ToolClient tool={tool} /></ToolPageShell>`.
- `components/upload/useFileTool.ts` owns the shared state machine (validate → ready → processing →
  done | error) and all analytics events. Tools only supply a `process(files, ctx)` function.
- `lib/pdf/*` and `lib/image/*` are pure processing functions (no React). `lib/files/validate.ts`
  checks magic bytes — never trust `File.type`.
- `lib/errors.ts`: closed set of `AppError` codes → one friendly sentence each. Library errors never
  reach the DOM.

## Hard rules

- `pdfjs-dist`, `pdf-lib`, `jszip` are imported **only** via `await import()` and only from
  `lib/pdf/pdfjs.ts` / `lib/pdf/pdf-lib.ts` / `lib/files/download.ts`.
  `tests/unit/bundle-discipline.test.ts` fails the build on a static import.
- The privacy claim renders only when `tool.clientSide === true`. Do not add a server-processed
  tool with that flag set.
- Every tile/button in a tool has a keyboard path; drag-and-drop is an enhancement, never the only way.
- Prefer native controls (`<select>`, `<input type="range|color|checkbox">`) over composite widgets.
- React 19 lint: no `setState` directly in effects — tag state with the file/pageCount it belongs to
  and derive, or key the component (see `usePdfPages`, `usePageSelection`, `CropEditor`).

## Known limitations (stated in UI copy — keep them honest)

- Compress PDF "light" is lossless and saves little; "balanced/strong" rasterise pages (text layer lost).
- PDF to Text reads the existing text layer only; no OCR.
