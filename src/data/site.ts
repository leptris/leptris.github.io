export const SITE = {
  name: 'leptris',
  title: 'leptris — the XML parser with hard memory bounds',
  description:
    'libleptris: a C99 XML 1.0 parser, W3C-conformant XPath 1.0 engine, and SAX feed. Fast as hares, contained as a circle — hard memory bounds, zero required dependencies.',
  url: 'https://www.leptris.org',
  githubOrg: 'https://github.com/leptris',
  githubC: 'https://github.com/leptris/leptris',
  githubRuby: 'https://github.com/leptris/leptris-ruby',
  githubPy: 'https://github.com/leptris/leptris-py',
  rubygems: 'https://rubygems.org/gems/leptris',
} as const;

export const VERSIONS = {
  lib: '1.3.0',
  libDate: '2026-08-23',
  gem: '1.3.0',
  gemDate: '2026-08-23',
  py: '1.5.0',
  pyDate: '2026-08-23',
} as const;

export interface NavEntry {
  href: string;
  label: string;
}

export const NAV: NavEntry[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/blog', label: 'Blog' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/about', label: 'About' },
];

export interface DocsEntry {
  href: string;
  label: string;
  blurb: string;
}

export const DOCS_NAV: DocsEntry[] = [
  {
    href: '/docs/getting-started',
    label: 'Getting started — C',
    blurb: 'Build, install, and link libleptris from source or vcpkg.',
  },
  {
    href: '/docs/ruby',
    label: 'Ruby',
    blurb: 'The leptris gem — Nokogiri-compatible parsing, XPath, SAX, C14N.',
  },
  {
    href: '/docs/python',
    label: 'Python',
    blurb: 'The leptris package via cffi — parse, navigate, query, serialize.',
  },
  {
    href: '/docs/cli',
    label: 'CLI',
    blurb: 'leptris parse · xpath · format — man pages and completions.',
  },
  {
    href: '/docs/xpath',
    label: 'XPath 1.0',
    blurb: 'All 13 axes, 27 functions, 15 operators — W3C-conformant.',
  },
  {
    href: '/docs/internals',
    label: 'Internals & FFI',
    blurb: 'Memory model, ABI stability, the binding contract.',
  },
];
