// Specs: specs/060-sonneveld-house.md, 061-trellick-tower.md, 062-unity-temple.md, 063-haus-am-horn.md, 073-glass-house.md, 074-villa-savoye.md, 072-habitat-67.md, 075-barcelona-pavilion.md, 076-bauhaus-dessau.md, 077-taliesin-west.md, 078-gropius-house.md, 079-salk-institute.md, 080-centre-pompidou.md, 081-schindler-house.md
// A named view must not start inside a neighbouring building the engine draws outside the lot (found in Chrome: two did).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood } from '../src/engine/scene/neighborhoodData';
import { HABITAT_67 } from '../src/houses/habitat-67/definition';
import { HAUS_AM_HORN } from '../src/houses/haus-am-horn/definition';
import { GLASS_HOUSE } from '../src/houses/glass-house/definition';
import { VILLA_SAVOYE } from '../src/houses/villa-savoye/definition';
import { BARCELONA_PAVILION } from '../src/houses/barcelona-pavilion/definition';
import { BAUHAUS_DESSAU } from '../src/houses/bauhaus-dessau/definition';
import { TALIESIN_WEST } from '../src/houses/taliesin-west/definition';
import { GROPIUS_HOUSE } from '../src/houses/gropius-house/definition';
import { SALK_INSTITUTE } from '../src/houses/salk-institute/definition';
import { CENTRE_POMPIDOU } from '../src/houses/centre-pompidou/definition';
import { SCHINDLER } from '../src/houses/schindler-house/definition';
import { SONNEVELD } from '../src/houses/sonneveld-house/definition';
import { TRELLICK } from '../src/houses/trellick-tower/definition';
import { UNITY_TEMPLE } from '../src/houses/unity-temple/definition';

describe('specs 060–063: views start in the open', () => {
  for (const h of [SONNEVELD, TRELLICK, UNITY_TEMPLE, HAUS_AM_HORN, GLASS_HOUSE, VILLA_SAVOYE, HABITAT_67, BARCELONA_PAVILION, BAUHAUS_DESSAU, TALIESIN_WEST, GROPIUS_HOUSE, SALK_INSTITUTE, CENTRE_POMPIDOU, SCHINDLER]) {
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
