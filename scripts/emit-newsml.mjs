// Emits the spoke NewsML-G2 tree (hub import contract):
//   dist/news-data/newsml.xml                       index NewsMessage
//   dist/news-data/articles/<YYYY-MM-DD>-<slug>/
//     newsml.xml   full NewsItem (inline XHTML + source rendition)
//     body.md      the markdown source rendition
// Additive only: the site's own pages are untouched.
// The GUID's date is always the filename date (the same source as the
// article directory), so consumers can rebuild this path from the GUID.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildNewsItem, buildNewsMessage } from 'newsmlg2-ts'
import matter from 'gray-matter'
import { marked } from 'marked'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BLOG = join(root, 'src/content/blog')
const OUT = join(root, 'dist/news-data')
const SPOKE = { id: 'leptris', name: 'Leptris', base: 'https://www.leptris.org' }

const posts = readdirSync(BLOG)
  .filter((f) => /^\d{4}-\d{2}-\d{2}-.*\.md$/.test(f))
  .map((f) => {
    const stem = f.replace(/\.md$/, '')
    const raw = readFileSync(join(BLOG, f), 'utf8')
    const { data: fm, content } = matter(raw)
    return {
      stem,
      date: stem.slice(0, 10),
      slug: stem.slice(11),
      title: String(fm.title ?? stem.slice(11)),
      author: String(fm.author ?? `${SPOKE.name} team`),
      description: String(fm.description ?? ''),
      draft: fm.draft === true,
      body: content,
    }
  })
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

const itemDir = (p) => join(OUT, 'articles', p.stem)
const guid = (p) => `urn:ribose:news:${p.date}:${SPOKE.id}:${p.slug}`

const toItemModel = (p, full) => ({
  itemMeta: {
    guid: guid(p), lang: 'en', version: 1, itemClass: 'ninat:text',
    canonical: `${SPOKE.base}/blog/${p.stem}`,
    provider: { qcode: `nprov:${SPOKE.id}`, name: SPOKE.name },
    versionCreated: `${p.date}T00:00:00+00:00`,
  },
  contentMeta: {
    headline: p.title,
    description: p.description || undefined,
    by: p.author,
    contentCreated: `${p.date}T00:00:00+00:00`,
    ...(full ? { bodyXhtml: marked.parse(p.body), renditions: [{ href: 'body.md', rendition: 'rnd:main' }] } : {}),
  },
})

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'newsml.xml'), buildNewsMessage({
  header: { sent: new Date().toISOString(), sender: 'Ribose' },
  items: posts.map((p) => toItemModel(p, false)),
}).toXml())

for (const p of posts) {
  mkdirSync(itemDir(p), { recursive: true })
  writeFileSync(join(itemDir(p), 'newsml.xml'), buildNewsItem(toItemModel(p, true)).toXml())
  writeFileSync(join(itemDir(p), 'body.md'), p.body)
}
console.log(`newsml spoke: ${posts.length} articles emitted`)
