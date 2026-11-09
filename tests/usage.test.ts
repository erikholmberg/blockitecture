// Spec: specs/018-claude-usage-per-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  attribute,
  byHouse,
  collectMessages,
  mergeLedger,
  parseHouse,
  parseSpecIds,
  recordLedger,
  type CommitRow,
} from '../scripts/usage/core';

const line = (o: object) => JSON.stringify(o);
const asst = (id: string, ts: string, out: number, extra: object = {}) =>
  line({
    type: 'assistant',
    timestamp: ts,
    ...extra,
    message: {
      id,
      role: 'assistant',
      model: 'claude-opus-5-5',
      usage: { input_tokens: 1, cache_creation_input_tokens: 10, cache_read_input_tokens: 100, output_tokens: out },
    },
  });

describe('018: Claude usage per house', () => {
  it('A1: a message spanning several lines counts once; subagent transcripts are included', () => {
    const main = [
      line({ type: 'user', timestamp: '2026-11-09T10:00:00Z', message: { role: 'user', content: 'hi' } }),
      asst('m1', '2026-11-09T10:00:01Z', 5),
      asst('m1', '2026-11-09T10:00:02Z', 5), // same message, second content block
      'not json',
      asst('m2', '2026-11-09T10:01:00Z', 7),
    ].join('\n');
    const sub = asst('s1', '2026-11-09T10:00:30Z', 3, { isSidechain: true });
    const msgs = collectMessages([main, sub]);
    expect(msgs.map((m) => m.id).sort()).toEqual(['m1', 'm2', 's1']);
    expect(msgs.reduce((a, m) => a + m.usage.output, 0)).toBe(15);
    expect(msgs.find((m) => m.id === 'm1')!.usage).toEqual({ input: 1, cacheWrite: 10, cacheRead: 100, output: 5 });
  });

  const commits = [
    { hash: 'aaa', time: Date.parse('2026-11-09T10:00:10Z'), subject: 'Thing one (spec 001)' },
    { hash: 'bbb', time: Date.parse('2026-11-09T10:00:10Z'), subject: 'Record commit for spec 001' },
    { hash: 'ccc', time: Date.parse('2026-11-09T11:00:00Z'), subject: 'Two things (specs 010b, 011)' },
  ];
  const msgs = collectMessages([
    [
      asst('a', '2026-11-09T09:00:00Z', 1),
      asst('b', '2026-11-09T10:00:10Z', 2), // exactly at commit time: still that commit
      asst('c', '2026-11-09T10:30:00Z', 4),
      asst('d', '2026-11-09T12:00:00Z', 8),
    ].join('\n'),
  ]);

  it('A2: messages go to the first commit after them; later ones are in progress', () => {
    const rows = attribute(msgs, commits);
    const out = Object.fromEntries(rows.map((r) => [r.hash ?? 'in-progress', r.usage.output]));
    expect(out).toEqual({ aaa: 3, ccc: 4, 'in-progress': 8 });
    expect(rows.find((r) => r.hash === 'ccc')!.specs).toEqual(['010', '011']);
    expect(rows.find((r) => r.hash === 'aaa')!.messages).toBe(2);
  });

  it('A3: commit subjects parse to specs, specs map to houses, mixed commits split evenly', () => {
    expect(parseSpecIds('Eames House live (specs 010b, 011, 012)')).toEqual(['010', '011', '012']);
    expect(parseSpecIds('Multi-house engine (spec 010a)')).toEqual(['010']);
    expect(parseSpecIds('Plan the Eames House (spec 010), with furniture')).toEqual(['010']);
    expect(parseSpecIds('Ignore Vercel local env')).toEqual([]);
    expect(parseHouse('# 017\n\n- **Status:** Done\n- **House:** fallingwater\n')).toBe('fallingwater');
    expect(parseHouse('# 013\n\n- **Status:** Done\n')).toBeNull();

    const rows = attribute(msgs, commits);
    const houses = byHouse(rows, { '001': 'stahl-house', '010': 'eames-house', '011': null });
    const out = Object.fromEntries(houses.map((h) => [h.house, h.usage.output]));
    expect(out).toEqual({ 'stahl-house': 3, 'eames-house': 2, shared: 2, 'in progress': 8 });
    expect(houses.find((h) => h.house === 'eames-house')!.messages).toBeCloseTo(0.5);
  });

  it('A4: recording is idempotent and nothing is counted twice', () => {
    const live = attribute(msgs, commits);
    const once = recordLedger([], live);
    expect(once.map((r) => r.hash)).toEqual(['aaa', 'ccc']); // in progress isn't recorded
    expect(recordLedger(once, live)).toEqual(once);

    // a commit whose transcript is gone still counts from the ledger; one in both counts once
    const old: CommitRow = { hash: 'old', date: '2026-10-01', specs: ['001'], messages: 1, usage: { input: 0, cacheWrite: 0, cacheRead: 0, output: 100 } };
    const merged = mergeLedger([old, ...once], live);
    expect(merged.map((r) => r.hash ?? 'in-progress')).toEqual(['old', 'aaa', 'ccc', 'in-progress']);
    expect(merged.reduce((a, r) => a + r.usage.output, 0)).toBe(100 + 3 + 4 + 8);
  });

  it('A5: spec 017 and the template name the house', () => {
    expect(parseHouse(readFileSync('specs/017-fallingwater.md', 'utf8'))).toBe('fallingwater');
    expect(readFileSync('specs/_template.md', 'utf8')).toMatch(/^- \*\*House:\*\* /m);
  });
});
