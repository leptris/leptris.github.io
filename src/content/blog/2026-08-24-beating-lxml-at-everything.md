---
title: 'Beating lxml at everything — the 1.6.1 accelerator'
description: 'Cost accounting said the whole remaining gap to lxml was Python object construction. A ~180-line abi3 C accelerator closed it — every operation in the matrix now wins.'
pubDate: 2026-08-24
author: 'the leptris team'
tags: ['python', 'benchmarks', 'release']
---

This morning the [race, per language][race] read like this in Python: six
of nine operations won, three honestly lost — plain node-set queries,
unions, and traversal, each within striking distance after the 1.4/1.5
batch-accessor sprint, but lost. As of **leptris 1.6.1**, the matrix has
no losses left: **every operation beats lxml.**

| operation | leptris 1.6.1 | lxml 6.0.2 | margin |
|---|---:|---:|---|
| parse medium (12 KB) | **15.2 µs** | 121 µs | 8× |
| `count(//book)` | **1.7 µs** | 8.1 µs | 4.7× |
| `//book[@id='50']` | **3.8 µs** | 37 µs | 10× |
| `//book[price > 50]` | **9.7 µs** | 52 µs | 5.3× |
| serialize | **18.4 µs** | 67 µs | 3.7× |
| `//book` (100 elems) | **6.4 µs** | 12.0 µs | 1.9× |
| union (200 elems) | **19.2 µs** | 27.9 µs | 1.5× |
| traversal (401 elems) | **18.0 µs** | 21.6 µs | 1.2× |

(macOS arm64, Python 3.10, libleptris 1.3.0 — same harness as the Ruby
matrix, run in CI, artifacts canonical.)

## Where the last gap actually was

The engine underneath already beat libxml2 on every XPath benchmark —
lxml *is* libxml2 — so whatever remained had to live in the binding.
Cost accounting found it in one place: **Python object construction**,
about 0.10 µs per `Element`. Every nodeset query, every iteration,
paid it per node — and on operations that touch hundreds of nodes, that
was the entire deficit.

So allocation moved into C. The whole accelerator is **~180 lines of
abi3** (`_leptrisaccel`): a C heap type that constructs elements at
**0.026 µs** each — a 4× cut — while the *entire API surface stays in
Python*, its methods attached onto the C type. No API was re-expressed
in C; only the one measured hotspot was. And because a build toolchain
shouldn't be a runtime requirement, the package carries a tested
pure-Python fallback — same class, same behavior, `LEPTRIS_PURE=1`
forces it — with the wheels shipping the compiled accelerator.

## Wheels, all of them

1.6.1 also closed the packaging story: **five cp39-abi3 wheels plus the
sdist are on PyPI** — macOS arm64 and x86_64, manylinux x86_64 and
aarch64, and Windows. The manylinux aarch64 wheel had silently gone
missing in 1.6.0 (the emulated build skipped it); it now builds natively
on an arm runner, and the accelerator is confirmed inside every wheel.
`pip install leptris` is the whole setup.

## The ledger stays honest

The scoreboard page keeps its [ledger of losses][ledger] — attr-heavy
parse still trails pugixml, and Ox still holds the Ruby traversal crown —
but the Python rows are gone from it, replaced by a note that they fell,
and when. If you want to see exactly how, the harness is in the tree:
`benchmarks/matrix.py` in [leptris-py][py], same fixtures as the Ruby
matrix. Run it yourself.

[race]: /blog/leptris-1-2-0-the-race-per-language/
[ledger]: /benchmarks#ledger
[py]: https://github.com/leptris/leptris-py
