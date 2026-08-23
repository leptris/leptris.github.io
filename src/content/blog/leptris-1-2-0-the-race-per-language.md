---
title: 'leptris 1.2.0 — the race, per language'
description: 'One C core, four language surfaces, three races. What 1.2.0 shipped, what the benchmarks say in C, Ruby, and Python — and where we still lose.'
pubDate: 2026-08-23
author: 'the leptris team'
tags: ['release', 'benchmarks']
---

Three hares chase each other in a circle, sharing three ears — each hare
looks fully equipped, yet nothing in the pattern is redundant. That image,
from the Dunhuang cave ceilings to parish churches across Europe, is the
design brief of this library in seven letters: **speed** in the chase,
**containment** in the circle. Today, with libleptris and the leptris gem
at **v1.2.0**, it's a good moment to show what that buys you in each
language — and where it doesn't.

## What 1.2.0 shipped

The headline is **namespace-bound XPath**: `leptris_xpath_eval_ns` with a
`LeptrisXPathNsSet` resolves prefixed name tests by *namespace*, so an
element matches when it carries the bound namespace through any prefix or
the default namespace. Alongside it: a fix for `//t:*`, which was
namespace-blind and matched everything; serializer round-trip fixes (CDATA
sections containing `]]>` now split the way libxml2 does, and names emit
`prefix:name` so bindings survive a reparse); and a use-after-free on
programmatic roots found through [moxml][moxml]'s adapter contract — the
kind of bug you only meet when someone actually embeds you.

The Ruby gem, in lockstep, gained `Leptris::XML::Document.create` — an
empty document with its own pool, no sentinel parse — plus `Document#root=`
and `Attr#to_xml`. And the Python binding moved into its own home,
[leptris-py][leptris-py], publishing to PyPI as **`leptris`** (`pip
install leptris`) — and then, in its first real release (1.3.x), it
adopted an **lxml-shaped API**: the Ruby binding mirrors Nokogiri, so the
Python binding mirrors lxml; read-path code ports with an import change.
With the Rust crate that shipped in 1.1.2, that makes four bindings over
one ABI, every one of them gated in CI against drift from the C surface.

## The race, per language

Different audiences race against different libraries, so we publish the
numbers that way — the full detail is on [the benchmarks page][bench],
and every number reproduces from a harness in the tree.

**C and C++ — the embedder's race**, against libxml2 (the de facto
standard under Chrome, Firefox, and lxml) and pugixml (the C++ speed
king): 2.5–3.6× faster SAX than libxml2, 1.4–3.6× on parse and DOM reads,
ahead on *all ten* XPath benchmarks, and since 1.1.2, union deduplication
is ~140× faster on large merged sets.

**Ruby — the migrant's race**, against Nokogiri, Ox, and Oga. The current
matrix: leptris wins 8 of 9 operations — 4.5× on small parses, 16× on
medium, 18× on ID predicates, 3× on serialize — and now wins traversal
against Nokogiri too. Ox keeps the traversal crown; its C-level walk is
unbeaten.

**Python — the incumbent's race**, against lxml, ElementTree, and
minidom. The binding ships its own matrix (the Python twin of the Ruby
harness), and the 1.3.1 release was tuned against it — nodeset
materialization ~1.6× faster, traversal −45%. Current numbers
(Python 3.10, arm64, lxml 6.0):

| operation | leptris | lxml | ElementTree | winner |
|---|---:|---:|---:|---|
| parse small (431 B) | **2.2 µs** | 5.8 µs | 7.9 µs | leptris |
| parse medium (12 KB) | **14.9 µs** | 119.4 µs | 158.1 µs | leptris |
| `count(//book)` | **1.7 µs** | 8.0 µs | — | leptris |
| `//book[@id='50']` | **3.4 µs** | 37.9 µs | 12.8 µs | leptris |
| serialize | **74.6 µs** | 271.2 µs | 1109.8 µs | leptris |
| `//book` (100 nodes) | 31.2 µs | 12.0 µs | **9.9 µs** | ElementTree |
| `//author \| //title` | 63.1 µs | **28.0 µs** | — | lxml |
| traverse | 299.0 µs | 19.8 µs | **3.4 µs** | ElementTree |

Six of nine, including a 15× serialize gap over the stdlib — with the
losses telling you exactly what the binding owes you next.

## The ledger of losses

A speed page that only lists wins is marketing. Where leptris loses
today, in public: attr-heavy parse is ~1.5× behind pugixml (the parse
wall is at a compiler-global optimum — eleven failed experiments say
so); raw child append pays 1.3× for the O(1) duplicate-rejecting
attribute index; in Python, plain nodeset queries materialize a wrapper
per node (`//book` loses to both lxml and ElementTree, ~0.29 µs per
element of gap, tracked upstream) and traversal is per-node FFI — 1.3.1
halved it, and the C-side batch accessors that close it are next on the
ledger. Each loss has a reason and
an owner; the tombstones of measured dead ends (32-byte split-stream
attributes, two-pass SIMD) are in the perf ledger for anyone tempted to
retry them.

Fast as hares. Contained as a circle. And when the hares stumble, you'll
read about it here.

[moxml]: https://github.com/lutaml/moxml
[leptris-py]: https://github.com/leptris/leptris-py
[bench]: /benchmarks
