# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) for anyone working in this repository.

## What this repo is

Source for [www.leptris.org](https://www.leptris.org) — the public site for
the **leptris** project (formerly *taurus*): **libleptris**, a C99 XML 1.0
parser / XPath 1.0 engine / SAX feed with hard memory bounds, plus the
**leptris** Ruby gem, **pyleptris** Python binding, and a CLI.

This repo contains **only the website**. The product lives in:

- C core: `~/src/leptris/leptris` → `github.com/leptris/leptris`
- Ruby gem: `~/src/leptris/leptris-ruby` → `github.com/leptris/leptris-ruby`
- Python package: `~/src/leptris/leptris-py` → `github.com/leptris/leptris-py` (PyPI package `leptris`, formerly pyleptris)

The site is a **curated** view of those repos' documentation. The repos are
canonical: every docs page links back to the source file, and content facts
(numbers, API names, versions) must match the repos' READMEs and CHANGELOGs.

## Tech stack (do not silently change)

- **Astro 7** — site framework, islands
- **Vite 8** — bundled by Astro
- **Tailwind 4** via `@tailwindcss/vite` — CSS-first config, no `tailwind.config.js`
- **Vue 3** via `@astrojs/vue` — interactive islands only (`CodeTabs.vue`, `BenchBars.vue`); most pages are static
- **TypeScript** strict
- **Vitest** — data-integrity tests (nav ↔ pages, versions, repo links)

If a contributor wants React/Svelte/Solid, push back: Vue islands cover the
interactive surface.

## Commands

```bash
npm install              # install deps
npm run dev              # dev server at http://localhost:4321
npm run build            # production build to ./dist
npm run preview          # serve the built site
npm run check            # astro check (type diagnostics for .astro)
npm run lint             # eslint
npm test                 # vitest run (one-shot)
npm run test:watch       # vitest watch
```

## Architecture

### Data is the source of truth for site chrome

`src/data/site.ts` holds versions (`VERSIONS`), repo URLs (`SITE`), the top
nav (`NAV`), and the docs nav (`DOCS_NAV`). Components import from it; never
hardcode versions or nav links in pages. `test/site.spec.ts` verifies every
nav entry resolves to a page in `src/pages/` — keep that green when adding
pages.

### Brand tokens live in `src/styles/brand.css`

Tailwind 4 `@theme` defines the pastel palette (sourced from the mark's own
tones) as both CSS variables (`--color-rose`, `--color-periwinkle`,
`--color-sage`, `--color-paper`, `--color-ink`, `--color-night`, …) and
utility classes. **Pastels carry surfaces and accents; the `-deep` variants
(rose-deep, periwinkle-deep) carry text** — never set body text in a plain
pastel. Dark mode swaps the same variables to the mark's dark-variant tones
(salmon, periwinkle, pale lime) under `prefers-color-scheme: dark` and
`[data-theme='dark']`. The hero/stats/CTA band colors live in the
`--hero-*`/`--stat-*` custom properties, overridden in the same dark blocks.
Fonts are self-hosted via Fontsource (Fraunces Variable + IBM Plex
Sans/Mono) — no Google Fonts CDN.

Beyond tokens, `brand.css` carries the shared section styles (`.hero`,
`.stats`, `.feat-grid`, `.bench-*`, `.doc-table`, `.prose`, `.docs-layout`,
`.callout`, `.card`, `.reveal`). Component `.astro` files add only what is
unique to them.

### Theme system

Light is the default. Dark mode is opted into via either
`prefers-color-scheme: dark` (system) or `[data-theme="dark"]` (manual).
`[data-theme="light"]` overrides a dark system preference back to light.
`src/components/ThemeToggle.astro` persists the choice in
`localStorage['leptris-theme']`; `BaseLayout.astro` has a pre-paint
`<script is:inline>` that applies the stored theme before first paint (no
FOUC) and swaps theme-aware favicons.

### Logo rules

Canonical assets live in `~/src/leptris/branding/` (never delete; the PDF is
the designer's source). The site serves from `public/` only:

- `logo-leptris_icon-{light,dark}.svg` — the **everyday mark**: masthead, favicon, footer, hero medallion
- `logo-leptris_full-{light,dark}.svg` — the **full artwork**: ONLY where the three-hares motif itself is the subject (the about page, and the homepage's "the name" section)
- favicon set (SVG + 96px PNG + 180px Apple touch) and PWA manifest icons, in both palettes

`src/components/Logo.astro` is the **only** place that decides which variant
renders. Use `<Logo size={N} variant="icon|full" />`; never hardcode
`<img src="/logo-...">`. The SVGs shipped here have the C2PA metadata
stripped; regenerate by copying from branding and removing the
`<metadata>` element — never edit artwork by hand.

### Pages

- `/` — landing: hero, stats, the name, features, benchmarks (BenchBars island), memory table, code tabs (CodeTabs island), install, CTA
- `/about` — the three-hares story (the only page that explains the full logo), the name, the promises, the mark's usage rules
- `/docs` — hub; `/docs/{getting-started,ruby,python,cli,xpath,internals}` — curated guides over `DocsShell.astro` (sidebar + canonical-links notice)
- `/changelog` — headlines per component, canonical links
- `/404` — the hares ran off with it

### Blog

Posts live in `src/content/blog/` as markdown or MDX with the filename
pattern **`{YYYY-MM-DD}-{slug}.md`** (or `.mdx`) — e.g.
`2026-08-24-beating-lxml-at-everything.md`. The date prefix is stripped
from the URL (`/blog/{slug}/`), so links stay stable; frontmatter
(`title`, `description`, `pubDate`, `author`, `tags`) is validated by
the zod schema in `src/content.config.ts`, and `test/site.spec.ts`
enforces the filename pattern — keep both green when adding posts.

Code blocks are Shiki-highlighted (single `github-dark` theme — panels are
lapis in both modes): `<CodeBlock lang code title />` wraps Astro's `Code`
component; `CodeTabs.vue` receives pre-rendered Shiki HTML as props (built
in the page frontmatter via `codeToHtml`).

### Legacy files at the repo root

`index.html`, `about.html`, `assets/`, and the root `CNAME` are the **v1
static site** (pre-Astro). They are kept as historical source and are
ignored by the build (`astro build` emits only `src/pages` + `public/`).
Do not delete them; the deployable copy of CNAME lives in `public/CNAME`.

## Deploy

GitHub Pages via Actions (`.github/workflows/deploy.yml`): build on push to
`main`, deploy `dist/` with `actions/deploy-pages`. The Pages source must be
set to **GitHub Actions** (not "deploy from branch") in repo settings.
CI (`.github/workflows/ci.yml`) lints, typechecks, tests, and builds on
every push/PR to main.
