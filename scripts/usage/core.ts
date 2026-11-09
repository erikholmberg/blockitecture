/**
 * Spec 018: Claude usage per house. Pure (no file system, no git), so it's tested directly in tests/usage.test.ts;
 * scripts/usage.ts feeds it the transcripts, the git log, the specs and the ledger.
 */
export interface Usage {
  input: number;
  cacheWrite: number;
  cacheRead: number;
  output: number;
}

export interface Message {
  id: string;
  time: number; // ms since epoch
  usage: Usage;
}

export interface Commit {
  hash: string;
  time: number;
  subject: string;
}

/** Usage up to one commit (hash null: since the last commit). The ledger stores these. */
export interface CommitRow {
  hash: string | null;
  date: string; // YYYY-MM-DD
  specs: string[];
  messages: number;
  usage: Usage;
}

export interface HouseRow {
  house: string;
  messages: number;
  usage: Usage;
}

export const SHARED = 'shared';
export const IN_PROGRESS = 'in progress';

const zero = (): Usage => ({ input: 0, cacheWrite: 0, cacheRead: 0, output: 0 });
const add = (a: Usage, b: Usage, f = 1) => {
  a.input += b.input * f;
  a.cacheWrite += b.cacheWrite * f;
  a.cacheRead += b.cacheRead * f;
  a.output += b.output * f;
};
export const totalTokens = (u: Usage) => u.input + u.cacheWrite + u.cacheRead + u.output;

/**
 * Assistant messages with usage from transcript texts (JSONL). Claude Code writes one line per content block, all with the
 * same message id and usage, so each id counts once. Subagent transcripts are just more texts.
 */
export function collectMessages(texts: string[]): Message[] {
  const byId = new Map<string, Message>();
  for (const text of texts) {
    for (const raw of text.split('\n')) {
      if (!raw.trim()) continue;
      let o: any;
      try {
        o = JSON.parse(raw);
      } catch {
        continue;
      }
      const m = o?.message;
      const u = m?.usage;
      if (!u || m.role !== 'assistant' || typeof o.timestamp !== 'string') continue;
      const id: string = m.id ?? o.uuid;
      if (!id || byId.has(id)) continue;
      byId.set(id, {
        id,
        time: Date.parse(o.timestamp),
        usage: {
          input: u.input_tokens ?? 0,
          cacheWrite: u.cache_creation_input_tokens ?? 0,
          cacheRead: u.cache_read_input_tokens ?? 0,
          output: u.output_tokens ?? 0,
        },
      });
    }
  }
  return [...byId.values()];
}

/** "(spec 017)", "(specs 010b, 011, 012)" → ['017'] / ['010', '011', '012']; step letters fold into their spec. */
export function parseSpecIds(subject: string): string[] {
  const ids: string[] = [];
  for (const m of subject.matchAll(/\bspecs?\s+((?:\d{3}[a-z]?)(?:\s*(?:,|and|&)\s*\d{3}[a-z]?)*)/gi)) {
    for (const id of m[1].matchAll(/\d{3}/g)) if (!ids.includes(id[0])) ids.push(id[0]);
  }
  return ids;
}

/** The house a spec belongs to, from its `- **House:** <slug>` line; null for shared work. */
export function parseHouse(spec: string): string | null {
  const m = spec.match(/^- \*\*House:\*\*\s*([a-z0-9-]+)/m);
  return m ? m[1] : null;
}

/** Each message goes to the first commit at or after it (commits in any order); later messages are in progress. */
export function attribute(messages: Message[], commits: Commit[]): CommitRow[] {
  const sorted = [...commits].sort((a, b) => a.time - b.time);
  const rows = new Map<string | null, CommitRow>();
  const row = (c: Commit | null) => {
    const key = c?.hash ?? null;
    let r = rows.get(key);
    if (!r) {
      r = {
        hash: key,
        date: new Date(c?.time ?? Date.now()).toISOString().slice(0, 10),
        specs: c ? parseSpecIds(c.subject) : [],
        messages: 0,
        usage: zero(),
      };
      rows.set(key, r);
    }
    return r;
  };
  for (const m of messages) {
    // first commit at or after the message (binary search)
    let lo = 0, hi = sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid].time < m.time) lo = mid + 1;
      else hi = mid;
    }
    const r = row(sorted[lo] ?? null);
    r.messages++;
    add(r.usage, m.usage);
  }
  const order = new Map(sorted.map((c, i) => [c.hash, i]));
  return [...rows.values()].sort((a, b) => (order.get(a.hash!) ?? Infinity) - (order.get(b.hash!) ?? Infinity));
}

/** Totals per house; a commit naming several specs splits evenly; no spec or no House line → shared. */
export function byHouse(rows: CommitRow[], specHouse: Record<string, string | null>): HouseRow[] {
  const out = new Map<string, HouseRow>();
  const put = (house: string, r: CommitRow, f: number) => {
    let h = out.get(house);
    if (!h) out.set(house, (h = { house, messages: 0, usage: zero() }));
    h.messages += r.messages * f;
    add(h.usage, r.usage, f);
  };
  for (const r of rows) {
    if (r.hash === null) put(IN_PROGRESS, r, 1);
    else if (!r.specs.length) put(SHARED, r, 1);
    else for (const s of r.specs) put(specHouse[s] ?? SHARED, r, 1 / r.specs.length);
  }
  return [...out.values()];
}

/** Totals per spec (a commit's usage splits evenly among its specs). */
export function bySpec(rows: CommitRow[]): HouseRow[] {
  const out = new Map<string, HouseRow>();
  for (const r of rows) {
    const keys = r.hash === null ? [IN_PROGRESS] : r.specs.length ? r.specs.map((s) => `spec ${s}`) : ['(no spec)'];
    for (const k of keys) {
      let h = out.get(k);
      if (!h) out.set(k, (h = { house: k, messages: 0, usage: zero() }));
      h.messages += r.messages / keys.length;
      add(h.usage, r.usage, 1 / keys.length);
    }
  }
  return [...out.values()];
}

/** The ledger plus every committed live row it doesn't have yet. Idempotent. */
export function recordLedger(ledger: CommitRow[], live: CommitRow[]): CommitRow[] {
  const have = new Set(ledger.map((r) => r.hash));
  return [...ledger, ...live.filter((r) => r.hash !== null && !have.has(r.hash))];
}

/** What the table shows: the ledger (survives transcript cleanup), then live rows it lacks, incl. in progress. */
export function mergeLedger(ledger: CommitRow[], live: CommitRow[]): CommitRow[] {
  const have = new Set(ledger.map((r) => r.hash));
  return [...ledger, ...live.filter((r) => !have.has(r.hash))];
}
