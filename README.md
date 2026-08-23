# leptris — https://www.leptris.org

Public site for [leptris](https://github.com/leptris/leptris) — the XML
parser with hard memory bounds. Documents the C core (**libleptris**), the
Ruby gem (**leptris**), **pyleptris** for Python, and the CLI.

[![CI](https://github.com/leptris/leptris.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/leptris/leptris.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/leptris/leptris.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/leptris/leptris.github.io/actions/workflows/deploy.yml)

## Stack

- [Astro 7](https://astro.build) — site framework, islands
- [Vite 8](https://vite.dev) — bundled by Astro
- [Tailwind 4](https://tailwindcss.com) via `@tailwindcss/vite` (CSS-first, no JS config)
- [Vue 3](https://vuejs.org) via `@astrojs/vue` — interactive islands only (CodeTabs, BenchBars)
- TypeScript strict, Vitest for tests

## Development

```sh
npm install      # install deps
npm run dev      # dev server at http://localhost:4321
npm run build    # production build to ./dist
npm run preview  # serve the built site
npm run check    # astro check (type diagnostics)
npm run lint     # eslint
npm test         # vitest run
```

See [`CLAUDE.md`](./CLAUDE.md) for architecture and conventions.

## Brand

Canonical assets live in the local `~/src/leptris/branding/` directory
(source PDF + full/icon × light/dark SVG/PNG). The site keeps in `public/`
only what it serves: theme-aware logo variants, favicon set, and the web
manifest.

Usage rule: the **icon** is the everyday mark (masthead, favicon, footer);
the **full** logo appears only where the three-hares motif itself is the
subject (the about page). Both forms ship in light and dark palettes and
swap with the site theme.

The pastel palette is drawn from the mark's own tones — rose `#d8c2be`,
periwinkle `#b8b8e1`, sage `#afd3a5` in light mode; salmon `#e19f92`,
periwinkle `#abb2f6`, pale lime `#cfffa4` in dark mode — declared as
Tailwind 4 `@theme` tokens in `src/styles/brand.css`, with deep
text-safe variants for links and labels.

## Content policy

This site is a **curated guide**; the repositories are canonical:

- C core: `github.com/leptris/leptris` (README.adoc, docs/guide, docs/FFI.md, VALIDATION.md)
- Ruby gem: `github.com/leptris/leptris-ruby` (README.adoc, docs/man, docs/completion)

When this site and a repo disagree, the repo wins. Update
`src/data/site.ts` (versions, nav) when releases ship.

## License

MIT — same as the project it documents.
