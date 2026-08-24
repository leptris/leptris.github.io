import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS_NAV, NAV, SITE, VERSIONS } from '../src/data/site';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('site data', () => {
  it('versions are semver', () => {
    expect(VERSIONS.lib).toMatch(/^\d+\.\d+\.\d+$/);
    expect(VERSIONS.gem).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('github links point at the leptris org', () => {
    for (const url of [SITE.githubC, SITE.githubRuby]) {
      expect(url).toMatch(/^https:\/\/github\.com\/leptris\//);
    }
  });
});

describe('navigation resolves to pages', () => {
  const pageExists = (href: string) => {
    const rel = href === '/' ? 'index' : href.replace(/^\//, '');
    return [`${rel}.astro`, `${rel}/index.astro`].some((candidate) =>
      existsSync(join(root, 'src/pages', candidate)),
    );
  };

  it('every nav entry has a page', () => {
    for (const item of [...NAV, ...DOCS_NAV]) {
      expect(pageExists(item.href), `${item.href} should have a page`).toBe(true);
    }
  });

  it('every docs entry has a blurb', () => {
    for (const entry of DOCS_NAV) {
      expect(entry.blurb.length).toBeGreaterThan(10);
    }
  });
});

describe('blog posts', () => {
  const blogDir = join(root, 'src/content/blog');
  const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-[\w-]+\.(md|mdx)$/;

  it('filenames follow the {date}-{slug}.md(x) pattern', () => {
    for (const file of readdirSync(blogDir)) {
      expect(DATE_PREFIX.test(file), `${file} should match ${'{date}-{slug}.md(x)'}`).toBe(true);
    }
  });
});
