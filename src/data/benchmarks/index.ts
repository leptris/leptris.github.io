export type Tech =
  | 'xml'
  | 'xpath'
  | 'xslt'
  | 'html'
  | 'validation'
  | 'c14n'
  | 'xquery'
  | 'yaml';

export type Language = 'c' | 'ruby' | 'python';

export type Status = 'win' | 'parity' | 'loss';

export interface BenchResult {
  tech: Tech;
  operation: string;
  operation_label?: string;
  competitor: string;
  competitor_version: string;
  leptris_value?: number;
  competitor_value?: number;
  unit?: string;
  ratio: number;
  status: Status;
  artifact?: boolean;
  note?: string;
}

export interface Campaign {
  schema_version: 1;
  id: string;
  language: Language;
  subject: { name: string; version: string };
  harness: { label: string; url: string };
  machine: string;
  date: string;
  stat: string;
  artifact?: boolean;
  results: BenchResult[];
}

import htmlC from './results/html-c.json';
import xmlCLanes from './results/xml-c-lanes.json';
import xmlCMatrix from './results/xml-c-matrix.json';
import xmlPython from './results/xml-python.json';
import xmlRuby from './results/xml-ruby.json';
import xmlRubyFrontier from './results/xml-ruby-frontier.json';
import xmlRubySerialbench from './results/xml-ruby-serialbench.json';
import xsltC from './results/xslt-c.json';
import yamlC from './results/yaml-c.json';

// JSON module inference widens `schema_version: 1` to number; the spec
// (test/benchmarks.spec.ts) enforces the literal against the raw files.
const imported = [
  xmlCMatrix,
  xmlCLanes,
  xsltC,
  htmlC,
  yamlC,
  xmlRuby,
  xmlRubyFrontier,
  xmlRubySerialbench,
  xmlPython,
] as unknown as Campaign[];

export const CAMPAIGNS: Campaign[] = imported;

export const TECH_LABELS: Record<Tech, string> = {
  xml: 'XML parse / DOM',
  xpath: 'XPath 1.0',
  xslt: 'XSLT',
  html: 'HTML (WHATWG)',
  c14n: 'Canonicalization',
  validation: 'Validation',
  xquery: 'XQuery',
  yaml: 'YAML',
};

export const TECH_ORDER: Tech[] = [
  'xml',
  'xpath',
  'xslt',
  'html',
  'c14n',
  'validation',
  'xquery',
  'yaml',
];

export interface Cell {
  result: BenchResult;
  campaign: Campaign;
}

/**
 * The standing cell for a tech × language × competitor pair: the honest
 * weakest number (minimum ratio) across campaigns — losses always surface.
 */
export function cellFor(
  tech: Tech,
  language: Language,
  competitor: string,
): Cell | undefined {
  let worst: Cell | undefined;
  for (const campaign of CAMPAIGNS) {
    if (campaign.language !== language) continue;
    for (const result of campaign.results) {
      if (result.tech !== tech || result.competitor !== competitor) continue;
      if (worst === undefined || result.ratio < worst.result.ratio) {
        worst = { result, campaign };
      }
    }
  }
  return worst;
}

type TechCells = Partial<Record<Tech, Cell>>;
type LanguageCells = Partial<Record<Language, TechCells>>;

export interface CompetitorRow {
  competitor: string;
  cells: LanguageCells;
}

export function matrixRows(languages: Language[]): CompetitorRow[] {
  const rows = new Map<string, CompetitorRow>();
  for (const campaign of CAMPAIGNS) {
    if (!languages.includes(campaign.language)) continue;
    for (const result of campaign.results) {
      let row = rows.get(result.competitor);
      if (!row) {
        row = { competitor: result.competitor, cells: {} };
        rows.set(result.competitor, row);
      }
      const existing = row.cells[campaign.language]?.[result.tech];
      if (!existing || result.ratio < existing.result.ratio) {
        row.cells[campaign.language] = {
          ...(row.cells[campaign.language] ?? {}),
          [result.tech]: { result, campaign },
        };
      }
    }
  }
  return [...rows.values()].sort((a, b) =>
    a.competitor.localeCompare(b.competitor),
  );
}

/** Every loss row across all campaigns, with its campaign provenance — the deficits. */
export function frontier(): Cell[] {
  const out: Cell[] = [];
  for (const campaign of CAMPAIGNS) {
    for (const result of campaign.results) {
      if (result.status === 'loss') out.push({ result, campaign });
    }
  }
  return out.sort((a, b) => a.result.ratio - b.result.ratio);
}

export interface TechCell {
  language: Language;
  competitor: string;
  tech: Tech;
  rows: Cell[];
}

/**
 * All rows for one technology, grouped by (language, competitor).
 * The standing of a pairing is summarized from every row in the group.
 */
export function techMatrix(tech: Tech): Map<string, TechCell> {
  const groups = new Map<string, TechCell>();
  for (const campaign of CAMPAIGNS) {
    for (const result of campaign.results) {
      if (result.tech !== tech) continue;
      const key = `${campaign.language}:${result.competitor}`;
      let group = groups.get(key);
      if (!group) {
        group = {
          language: campaign.language,
          competitor: result.competitor,
          tech,
          rows: [],
        };
        groups.set(key, group);
      }
      group.rows.push({ result, campaign });
    }
  }
  return groups;
}

export interface StandingSummary {
  kind: 'sweep' | 'mixed' | 'lost';
  floor: number;
  best: number;
  wins: number;
  losses: number;
  total: number;
  lostOps: string[];
  artifact: boolean;
}

/** Worst/best summary of one pairing's rows — the decision-level view. */
export function standingOf(rows: Cell[]): StandingSummary {
  const ratios = rows.map((r) => r.result.ratio);
  const losses = rows.filter((r) => r.result.status === 'loss');
  const wins = rows.filter((r) => r.result.status === 'win');
  return {
    kind: losses.length === 0 ? 'sweep' : wins.length > 0 ? 'mixed' : 'lost',
    floor: Math.min(...ratios),
    best: Math.max(...ratios),
    wins: wins.length,
    losses: losses.length,
    total: rows.length,
    lostOps: losses.map((r) => r.result.operation_label ?? r.result.operation),
    artifact: rows.some((r) => r.result.artifact),
  };
}

export interface FrontierFilter {
  language?: Language;
  only?: Tech[];
  exclude?: Tech[];
}

/** Loss rows narrowed by language and/or tech. */
export function frontierFor(filter: FrontierFilter = {}): Cell[] {
  return frontier().filter(({ result, campaign }) => {
    if (filter.language && campaign.language !== filter.language) return false;
    if (filter.only && !filter.only.includes(result.tech)) return false;
    if (filter.exclude?.includes(result.tech)) return false;
    return true;
  });
}

/** All rows for one tech + language, merged across campaigns. */
export function drillDown(tech: Tech, language: Language): Cell[] {
  const out: Cell[] = [];
  for (const campaign of CAMPAIGNS) {
    if (campaign.language !== language) continue;
    for (const result of campaign.results) {
      if (result.tech === tech) out.push({ result, campaign });
    }
  }
  return out;
}
