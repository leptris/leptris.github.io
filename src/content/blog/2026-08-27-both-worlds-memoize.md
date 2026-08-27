---
title: 'Both worlds memoize — the gem 1.9.x performance arc'
description: 'Readonly documents were 13–36× faster by memoizing everything. Writable documents got the same treatment through a mutation-version cache — 29× on namespace inspection, readonly parity across the board. Here is how invalidation works, and what it cost.'
pubDate: 2026-08-27
author: 'the leptris team'
tags: ['ruby', 'benchmarks', 'release']
---

For most of the gem's life there were two performance worlds. Parse with
`readonly: true` and reads were memoized aggressively — they cannot go
stale, because mutation is forbidden. Parse writable — the default, the
DOM-editing shape Nokogiri users know — and every read paid full freight,
every time. Measured honestly: **namespace inspection on a 300-element
writable document ran 47× slower than the same readonly loop.**

This week's gem line (1.9.2 → 1.9.17) closed that gap, then kept going.

## The invalidation insight

Reads can't memoize on writable documents because any mutation might
stale them — that was the whole premise. But staleness has another cure:
**invalidate**. Every node-level mutation in the binding already passes
through one gate (`ensure_writable!` — an audit confirmed it), plus two
document-level mutators (`root=`, `add_pi`). A per-document **mutation
version** advanced at those three points makes writable memoization
sound: each memoized read stores the version it was computed under; any
bump discards it.

The first implementation used one shared version stamp per node — and
the mutation-invalidation test matrix killed it before any benchmark
could flatter it: one field's recompute restamps the node, resurrecting
every *other* field's stale memo. The shipped design gives each memoized
field its own stamp.

## The numbers (published-gem A/B, committed harness)

| loop | before | after | |
|---|---|---|---|
| namespaces (readonly) | 0.62 s | 0.017 s | 36× |
| attributes (readonly) | 0.63 s | 0.048 s | 13× |
| namespaces (writable) | 0.37 s | 0.013 s | **29× — readonly parity** |
| children (writable) | 0.15 s | 0.014 s | **11× — readonly parity** |
| `at_xpath` loop | 0.011 s | 0.0045 s | 2.5× |

Every number reproduces from the repo:
`bundle exec ruby benchmark/read_paths.rb`. The harness is committed —
it caught its own PR's regression the day it landed.

## What else rode along

- **Single-node queries** (`at_xpath`/`at_css`) got a container-free
  seam — no NodeSet, no result handle, one fewer dispatch.
- **Element-hinted batch materialization**: the XPath batch API fills a
  node-kind array the binding used to discard; element entries now skip
  the per-node type dispatch. (The kind enum folds CDATA into TEXT —
  XPath's data model — so only ELEMENT is hintable; the spec caught
  that.)
- **UTF-8 everywhere**: both faces of the C boundary — returns *and*
  SAX callbacks.
- **A lifetime contract**: freed-document reads and mutations raise
  `UseAfterFreeError` instead of reading freed memory.
- The lockstep symbol audit is a rake task, CI-gated.

## Honest floors

Both memo worlds now sit at the Ruby dispatch floor (~7 method calls per
read); SAX and NodeSet unions sit at the C floor. The next real jumps
live upstream: [batch-context XPath eval][560] and the pull-attribute
batch. Two asks, filed, waiting.

[race]: /benchmarks 'The race, per language'
[560]: https://github.com/leptris/leptris/issues/560 'leptris#560'
