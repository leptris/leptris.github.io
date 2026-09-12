import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAMPAIGNS,
  type Campaign,
  type Status,
  TECH_LABELS,
  type Tech,
} from '../src/data/benchmarks';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = join(root, 'src/data/benchmarks/results');

const TECHS = Object.keys(TECH_LABELS) as Tech[];
const LANGUAGES = ['c', 'ruby', 'python'] as const;
const STATUSES: Status[] = ['win', 'parity', 'loss'];

const loadCampaigns = (): Campaign[] =>
  readdirSync(resultsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) =>
      JSON.parse(
        readFileSync(join(resultsDir, f), 'utf8'),
      ) as unknown as Campaign,
    );

describe('benchmark campaigns conform to the results schema', () => {
  const onDisk = loadCampaigns();

  it('every results file is imported by the index', () => {
    const imported = new Set(CAMPAIGNS.map((c) => c.id));
    for (const campaign of onDisk) {
      expect(
        imported.has(campaign.id),
        `${campaign.id} should be listed in src/data/benchmarks/index.ts`,
      ).toBe(true);
    }
    expect(onDisk.length).toBe(CAMPAIGNS.length);
  });

  it('campaign ids are unique and slug-shaped', () => {
    const ids = CAMPAIGNS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it('required campaign fields present and well-formed', () => {
    for (const c of CAMPAIGNS) {
      expect(c.schema_version).toBe(1);
      expect(LANGUAGES).toContain(c.language);
      expect(c.subject.name.length).toBeGreaterThan(0);
      expect(c.subject.version.length).toBeGreaterThan(0);
      expect(c.harness.label.length).toBeGreaterThan(0);
      expect(c.harness.url).toMatch(
        /^https:\/\/github\.com\/(leptris|metanorma)\//,
      );
      expect(c.machine.length).toBeGreaterThan(0);
      expect(c.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.stat.length).toBeGreaterThan(0);
      expect(c.results.length).toBeGreaterThan(0);
    }
  });

  it('result rows carry tech, competitor, version, ratio, and a coherent status', () => {
    for (const c of CAMPAIGNS) {
      for (const r of c.results) {
        expect(TECHS, `${c.id}/${r.operation} tech`).toContain(r.tech);
        expect(STATUSES).toContain(r.status);
        expect(r.competitor).toMatch(/^[a-z0-9][a-z0-9.-]*$/);
        expect(r.competitor_version.length).toBeGreaterThan(0);
        expect(r.ratio).toBeGreaterThan(0);

        if (r.status === 'win') expect(r.ratio).toBeGreaterThan(1);
        if (r.status === 'loss') expect(r.ratio).toBeLessThan(1);
        if (r.status === 'parity') {
          expect(r.ratio).toBeGreaterThanOrEqual(0.85);
          expect(r.ratio).toBeLessThanOrEqual(1.15);
        }

        if (r.leptris_value !== undefined) {
          expect(r.unit, `${c.id}/${r.operation} needs a unit with values`).toBeDefined();
        }
      }
    }
  });

  it('ratios match their values where both are present (throughput rows are inverted)', () => {
    for (const c of CAMPAIGNS) {
      for (const r of c.results) {
        if (r.leptris_value === undefined || r.competitor_value === undefined) continue;
        const throughput = r.unit === 'MB/s';
        const derived = throughput
          ? r.leptris_value / r.competitor_value
          : r.competitor_value / r.leptris_value;
        expect(
          Math.abs(derived - r.ratio) / r.ratio,
          `${c.id}/${r.operation} ratio ${r.ratio} should match values (${derived.toFixed(2)})`,
        ).toBeLessThan(0.06);
      }
    }
  });

  it('artifact rows are marked and explained', () => {
    for (const c of CAMPAIGNS) {
      for (const r of c.results) {
        if (r.artifact || c.artifact) {
          expect(
            (r.note ?? '').length,
            `${c.id}/${r.operation} is an artifact and needs a note`,
          ).toBeGreaterThan(10);
        }
      }
    }
  });

  it('the frontier is never empty — losses stay in the data', () => {
    const losses = CAMPAIGNS.flatMap((c) =>
      c.results.filter((r) => r.status === 'loss'),
    );
    expect(losses.length).toBeGreaterThan(0);
  });
});

describe('matrix derivation', () => {
  it('the honest cell rule picks the weakest ratio per pair', async () => {
    const { cellFor } = await import('../src/data/benchmarks');
    const cell = cellFor('xml', 'c', 'pugixml');
    expect(cell).toBeDefined();
    // attr-heavy parse is the worst standing vs pugixml
    expect(cell!.result.operation).toBe('dom-parse-attr-heavy-5k');
  });

  it('frontier() surfaces every loss with provenance', async () => {
    const { frontier } = await import('../src/data/benchmarks');
    const rows = frontier();
    expect(rows.length).toBeGreaterThan(0);
    for (const { campaign } of rows) {
      expect(campaign.harness.url).toMatch(/^https:\/\//);
    }
  });
});
