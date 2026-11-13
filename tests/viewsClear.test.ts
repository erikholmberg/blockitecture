// Specs: specs/060-sonneveld-house.md, 061-trellick-tower.md, 062-unity-temple.md, 063-haus-am-horn.md, 073-glass-house.md
// A named view must not start inside a neighbouring building the engine draws outside the lot (found in Chrome: two did).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood } from '../src/engine/scene/neighborhoodData';
import { HAUS_AM_HORN } from '../src/houses/haus-am-horn/definition';
import { GLASS_HOUSE } from '../src/houses/glass-house/definition';
import { SONNEVELD } from '../src/houses/sonneveld-house/definition';
import { TRELLICK } from '../src/houses/trellick-tower/definition';
import { UNITY_TEMPLE } from '../src/houses/unity-temple/definition';

describe('specs 060–063: views start in the open', () => {
  for (const h of [SONNEVELD, TRELLICK, UNITY_TEMPLE, HAUS_AM_HORN, GLASS_HOUSE]) {
    it(`${h.slug}: no view starts inside a neighbouring building`, () => {
      const file = readFileSync(`public/${h.data}`);
      const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
      const b = n.buildings;
      const inside: string[] = [];
      for (const [name, v] of Object.entries(h.views)) {
        const p = v.view.pos;
        for (let i = 0; i < b.count; i++) {
          if (p.y > b.top[i] + 15) continue; // the engine draws pitched roofs above `top`
          const ring: [number, number][] = [];
          for (let k = b.start[i]; k < b.start[i + 1]; k++) ring.push([b.xz[k * 2], b.xz[k * 2 + 1]]);
          const xs = ring.map((q) => q[0]), zs = ring.map((q) => q[1]);
          if (p.x < Math.min(...xs) - 3 || p.x > Math.max(...xs) + 3 || p.z < Math.min(...zs) - 3 || p.z > Math.max(...zs) + 3) continue;
          if (inPoly(p.x, p.z, ring)) inside.push(`${name} (top ${b.top[i].toFixed(0)} ft, x ${Math.min(...xs).toFixed(0)}…${Math.max(...xs).toFixed(0)}, z ${Math.min(...zs).toFixed(0)}…${Math.max(...zs).toFixed(0)})`);
        }
      }
      expect(inside).toEqual([]);
    });
  }
});
