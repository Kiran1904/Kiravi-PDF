# Kiravi PDF — Dev Tasks

Status as of 2026-10-02. Spec: `PLAN.md`.

## Phase 3 — Foundation

- [x] Next 16 + TS + Tailwind v4 + shadcn + ESLint + Prettier
- [x] Brand tokens, Inter font, root layout, skip link, JSON-LD WebSite
- [x] Tool registry (19 tools, hand-written SEO copy, FAQ, limits)
- [x] Error model, magic-byte validation, limits, download/ZIP, analytics abstraction
- [x] Header (search sheet, mobile menu), Footer, Container, Logo

## Phase 4 — Homepage & static

- [x] Homepage (hero search, popular/PDF/image grids, why, how, privacy, FAQ, CTA)
- [x] /pdf, /image category pages · /about /contact /privacy /terms · 404
- [x] sitemap.xml, robots.txt from registry

## Phase 5 — First tool

- [x] Merge PDF end to end (drag + keyboard reorder, page counts, ZIP-free single download)

## Phase 6 — Remaining tools

- [x] Split · Compress (lossless + raster modes) · PDF→JPG · PDF→PNG · JPG→PDF · PDF→Text ·
      Rotate · Delete pages · Extract pages
- [x] Compress · Resize · JPG→PNG · PNG→JPG · WebP converter · Image→PDF · Crop · Rotate ·
      Remove metadata

## Phase 7 — Validation

- [x] 50 unit/component tests (Vitest)
- [x] 37 E2E specs × desktop + mobile (Playwright) — every tool verified by parsing its output
- [x] Production bundle check: heavy chunks not referenced by any page HTML

## Phase 8 — Quality gate

- [x] tsc · eslint · prettier · vitest · playwright · next build — all clean

## Next (not started — needs Kiran's go-ahead)

- [ ] Deploy to Vercel; set `NEXT_PUBLIC_SITE_URL`
- [ ] Real logo asset + OG image (`app/opengraph-image.tsx`)
- [ ] Analytics provider wiring (`components/layout/AnalyticsProviderSetup.tsx`)
- [ ] Git: initial commit on a branch (not done — no commit requested)
