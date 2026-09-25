export const SITE = {
  name: 'leptris',
  title: 'leptris — the XML parser with hard memory bounds',
  description:
    'libleptris: a C99 XML 1.0 parser, W3C-conformant XPath 1.0 engine, and SAX feed. Fast as hares, contained as a circle — hard memory bounds, zero required dependencies.',
  url: 'https://www.leptris.org',
  githubOrg: 'https://github.com/leptris',
  githubC: 'https://github.com/leptris/leptris',
  githubYaml: 'https://github.com/leptris/yeptris',
  githubToml: 'https://github.com/leptris/teptris',
  githubRuby: 'https://github.com/leptris/leptris-ruby',
  githubPy: 'https://github.com/leptris/leptris-py',
  rubygems: 'https://rubygems.org/gems/leptris',
  githubTomlRuby: 'https://github.com/leptris/teptris-ruby',
  githubTomlPy: 'https://github.com/leptris/teptris-py',
  rubygemsTeptris: 'https://rubygems.org/gems/teptris',
  pypiTeptris: 'https://pypi.org/project/teptris/',
} as const;

export const VERSIONS = {
  lib: '1.9.156',
  libDate: '2026-09-13',
  gem: '1.9.156.0',
  gemDate: '2026-09-13',
  py: '1.9.156.0',
  pyDate: '2026-09-13',
  toml: '0.1.27',
  tomlDate: '2026-09-22',
  tomlRuby: '0.2.47',
  tomlRubyDate: '2026-09-23',
  tomlPy: '0.2.23',
  tomlPyDate: '2026-09-23',
} as const;

export interface NavEntry {
  href: string;
  label: string;
}

export const NAV: NavEntry[] = [
  { href: '/', label: 'Home' },
  { href: '/teptris', label: 'Teptris' },
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

  {
    href: '/docs/parsing',
    label: 'Parsing models',
    blurb: 'DOM, SAX, StAX-style pull, iterparse — when to pick each.',
  },

  {
    href: '/docs/teptris-getting-started',
    label: 'Teptris — getting started (C)',
    blurb: 'Build libteptris, install it via CMake or pkg-config, parse and emit TOML from C.',
  },
  {
    href: '/docs/teptris-ruby',
    label: 'Teptris — Ruby',
    blurb: 'The teptris gem — tomlib-shaped TOML with Time/Date datetimes, batch, lazy, schema plans.',
  },
  {
    href: '/docs/teptris-python',
    label: 'Teptris — Python',
    blurb: 'The teptris package — tomllib-shaped loads/dumps, abi3 wheels, batch and lazy paths.',
  },
];
