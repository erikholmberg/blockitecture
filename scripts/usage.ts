/**
 * Spec 018: how much Claude usage each house took.
 *   npm run usage                 per house (+ shared, in progress)
 *   npm run usage -- --by-spec    per spec
 *   npm run usage -- --record     save committed totals to usage/ledger.json (transcripts are deleted after a while)
 * Reads this project's Claude Code transcripts on this machine (~/.claude/projects/<project>/**.jsonl).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  attribute, byHouse, bySpec, collectMessages, IN_PROGRESS, mergeLedger, parseHouse, recordLedger, SHARED, totalTokens,
  type CommitRow, type HouseRow,
} from './usage/core.ts';

const root = process.cwd();
const LEDGER = join(root, 'usage/ledger.json');

function jsonlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return jsonlFiles(p);
    return name.endsWith('.jsonl') ? [p] : [];
  });
}

const projectDir = join(homedir(), '.claude/projects', root.replace(/[^a-zA-Z0-9]/g, '-'));
const files = jsonlFiles(projectDir);
const messages = collectMessages(files.map((f) => readFileSync(f, 'utf8')));

const commits = execFileSync('git', ['log', '--format=%H %ct %s'], { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean)
  .map((l) => {
    const [hash, t, ...s] = l.split(' ');
    return { hash: hash.slice(0, 7), time: Number(t) * 1000, subject: s.join(' ') };
  });

const specHouse: Record<string, string | null> = {};
for (const f of readdirSync(join(root, 'specs'))) {
  const m = f.match(/^(\d{3})-/);
  if (m) specHouse[m[1]] = parseHouse(readFileSync(join(root, 'specs', f), 'utf8'));
}

const ledger: CommitRow[] = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : [];
const live = attribute(messages, commits);

if (process.argv.includes('--record')) {
  const next = recordLedger(ledger, live);
  mkdirSync(join(root, 'usage'), { recursive: true });
  writeFileSync(LEDGER, JSON.stringify(next, null, 2) + '\n');
  console.log(`usage/ledger.json: ${next.length - ledger.length} commit(s) added, ${next.length} in all.`);
  process.exit(0);
}

const rows = mergeLedger(ledger, live);
const table: HouseRow[] = process.argv.includes('--by-spec') ? bySpec(rows) : byHouse(rows, specHouse);
const rank = (h: string) => (h === IN_PROGRESS ? 2 : h === SHARED ? 1 : 0);
table.sort((a, b) => rank(a.house) - rank(b.house) || a.house.localeCompare(b.house, undefined, { numeric: true }));

const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(Math.round(n));
const grand = table.reduce((a, r) => a + totalTokens(r.usage), 0) || 1;
const head = ['', 'replies', 'input', 'cache write', 'cache read', 'output', 'share'];
const body = table.map((r) => [
  r.house, fmt(r.messages), fmt(r.usage.input), fmt(r.usage.cacheWrite), fmt(r.usage.cacheRead), fmt(r.usage.output),
  `${((100 * totalTokens(r.usage)) / grand).toFixed(1)}%`,
]);
const sum = table.reduce(
  (a, r) => ({ m: a.m + r.messages, i: a.i + r.usage.input, w: a.w + r.usage.cacheWrite, c: a.c + r.usage.cacheRead, o: a.o + r.usage.output }),
  { m: 0, i: 0, w: 0, c: 0, o: 0 },
);
body.push(['total', fmt(sum.m), fmt(sum.i), fmt(sum.w), fmt(sum.c), fmt(sum.o), '100%']);
const widths = head.map((_, i) => Math.max(...[head, ...body].map((r) => r[i].length)));
const show = (r: string[]) => r.map((c, i) => (i ? c.padStart(widths[i]) : c.padEnd(widths[i]))).join('  ');
console.log(show(head));
for (const [i, r] of body.entries()) {
  if (i === body.length - 1) console.log(widths.map((w) => '─'.repeat(w)).join('  '));
  console.log(show(r));
}
console.log(
  `\nTokens from ${files.length} transcript(s) on this machine + ${ledger.length} recorded commit(s). ` +
    'Share = of all tokens (cache reads included). The Stahl House was built before these logs; only its specs 001–009 count.',
);
