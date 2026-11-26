// Emits the spoke repository via the newsmlg2-ts library API.
import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { marked } from 'marked'
import { emitNewsml, loadMarkdownPosts } from 'newsmlg2-ts'

const cfg = parse(readFileSync('spoke.yaml', 'utf8'))
const n = emitNewsml({
  spoke: { id: cfg.id, name: cfg.name, base: cfg.base },
  posts: loadMarkdownPosts({ contentDir: cfg.contentDir }),
  outDir: cfg.outDir,
  renderBody: (md) => marked.parse(md, { async: false }),
})
console.log(`newsml: ${n} item(s) -> ${cfg.outDir}`)
