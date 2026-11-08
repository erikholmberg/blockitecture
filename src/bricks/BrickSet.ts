import * as THREE from 'three';
import { Brick, Kind, PLATE } from './catalog';
import { Stud } from '../model/voxel';
import { DROP_DUR } from '../build/sequencer';

const DROP_HEIGHT = 9;

/** When on, everything above the ceiling inside the roof outline is cut away. */
export const roofCut = { value: 0 };
const CUT_VERT_DECL = 'varying vec3 vCutPos;';
const CUT_VERT = 'vCutPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;';
const CUT_FRAG_DECL = 'varying vec3 vCutPos;\nuniform float uRoofCut;';
const CUT_FRAG = `if (uRoofCut > 0.5 && vCutPos.y > 11.65 && vCutPos.y < 14.0 &&
  ((vCutPos.x > -3.0 && vCutPos.x < 78.0 && vCutPos.z > 22.5 && vCutPos.z < 58.0) ||
   (vCutPos.x > -3.0 && vCutPos.x < 28.0 && vCutPos.z > -37.0 && vCutPos.z < 23.0))) discard;`;

function withRoofCut(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.uniforms.uRoofCut = roofCut;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\n' + CUT_VERT_DECL)
    .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + CUT_VERT);
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\n' + CUT_FRAG_DECL)
    .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + CUT_FRAG);
}

/** Darken box edges so each brick reads as a separate moulded piece. */
function addEdgeShading(mat: THREE.Material, strength: number, width: number) {
  mat.onBeforeCompile = (shader) => {
    withRoofCut(shader);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vLocalPos;\nvarying vec3 vBoxSize;',
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 iscale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vLocalPos = position * iscale;
        vBoxSize = iscale;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vLocalPos;\nvarying vec3 vBoxSize;',
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec3 dd = vBoxSize * 0.5 - abs(vLocalPos);
        float mn = min(dd.x, min(dd.y, dd.z));
        float mx = max(dd.x, max(dd.y, dd.z));
        float mid = dd.x + dd.y + dd.z - mn - mx;
        float edge = smoothstep(0.0, ${width.toFixed(3)}, mid);
        diffuseColor.rgb *= mix(${(1 - strength).toFixed(3)}, 1.0, edge);`,
      );
  };
  mat.customProgramCacheKey = () => 'edge' + strength + width;
}

/** Make emissive follow the per-instance colour. */
function emissiveFromInstanceColor(mat: THREE.MeshStandardMaterial) {
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec3 totalEmissiveRadiance = emissive;',
      'vec3 totalEmissiveRadiance = emissive * vColor.rgb;',
    );
  };
}

class Layer {
  mesh: THREE.InstancedMesh;
  start: Float32Array;
  base13: Float32Array;
  n: number;
  prevLo = 0;
  prevHi = 0;
  matrices: Float32Array;

  constructor(geo: THREE.BufferGeometry, mat: THREE.Material, n: number) {
    this.n = n;
    this.mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, n));
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.start = new Float32Array(n);
    this.base13 = new Float32Array(n);
    this.matrices = this.mesh.instanceMatrix.array as Float32Array;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, n) * 3), 3);
  }

  private fill = 0;
  push(t: number, px: number, py: number, pz: number, sx: number, sy: number, sz: number, color: THREE.Color) {
    const i = this.fill++;
    const m = this.matrices, o = i * 16;
    m[o] = sx; m[o + 1] = 0; m[o + 2] = 0; m[o + 3] = 0;
    m[o + 4] = 0; m[o + 5] = sy; m[o + 6] = 0; m[o + 7] = 0;
    m[o + 8] = 0; m[o + 9] = 0; m[o + 10] = sz; m[o + 11] = 0;
    m[o + 12] = px; m[o + 13] = py; m[o + 14] = pz; m[o + 15] = 1;
    this.base13[i] = py;
    this.start[i] = t;
    const c = this.mesh.instanceColor!.array as Float32Array;
    c[i * 3] = color.r; c[i * 3 + 1] = color.g; c[i * 3 + 2] = color.b;
  }

  private bound(t: number) {
    // first index with start > t
    let lo = 0, hi = this.n;
    const s = this.start;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (s[mid] <= t) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  update(t: number) {
    const count = this.bound(t);
    const lo = this.bound(t - DROP_DUR);
    const m = this.matrices;
    // restore pieces that left the animation window
    for (let i = this.prevLo; i < this.prevHi; i++) {
      if (i < lo || i >= count) m[i * 16 + 13] = this.base13[i];
    }
    for (let i = lo; i < count; i++) {
      const p = Math.min(1, (t - this.start[i]) / DROP_DUR);
      const e = 1 - p;
      // ease-out with a tiny settle
      const off = e * e * e * DROP_HEIGHT - Math.sin(p * Math.PI) * 0.06;
      m[i * 16 + 13] = this.base13[i] + off;
    }
    const a = Math.min(this.prevLo, lo), b = Math.max(this.prevHi, count);
    if (b > a) {
      const attr = this.mesh.instanceMatrix;
      attr.clearUpdateRanges();
      attr.addUpdateRange(a * 16, (b - a) * 16);
      attr.needsUpdate = true;
    }
    this.prevLo = lo;
    this.prevHi = count;
    this.mesh.count = count;
    return count;
  }
}

type LayerName = 'box' | 'round' | 'stud' | 'glass' | 'water' | 'light' | 'lamp';
const LAYER_OF: Record<Kind, LayerName> = {
  brick: 'box', plate: 'box', tile: 'box', round: 'round', bar: 'round',
  glass: 'glass', water: 'water', light: 'light', lamp: 'lamp',
};

export class BrickSet {
  group = new THREE.Group();
  layers: Record<LayerName, Layer>;
  lightMaterials: THREE.MeshStandardMaterial[] = [];
  total: number;

  constructor(bricks: Brick[], order: number[], start: Float32Array, studs: Stud[]) {
    this.total = order.length;
    const counts: Record<LayerName, number> = { box: 0, round: 0, stud: studs.length, glass: 0, water: 0, light: 0, lamp: 0 };
    for (const b of bricks) counts[LAYER_OF[b.kind]]++;

    const plastic = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.0 });
    addEdgeShading(plastic, 0.32, 0.06);
    const roundMat = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.0 });
    roundMat.onBeforeCompile = withRoofCut;
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.22,
      depthWrite: false, envMapIntensity: 1.6,
    });
    addEdgeShading(glassMat, 0.5, 0.05);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.03, metalness: 0.1, transparent: true, opacity: 0.55,
      depthWrite: false, envMapIntensity: 1.2,
    });
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.25 });
    emissiveFromInstanceColor(lightMat);
    const lampMat = lightMat.clone();
    emissiveFromInstanceColor(lampMat);
    this.lightMaterials.push(lightMat, lampMat);

    const box = new THREE.BoxGeometry(1, 1, 1);
    const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
    const stud = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10);
    const sphere = new THREE.SphereGeometry(0.5, 14, 10);

    this.layers = {
      box: new Layer(box, plastic, counts.box),
      round: new Layer(cyl, roundMat, counts.round),
      stud: new Layer(stud, roundMat, counts.stud),
      glass: new Layer(box, glassMat, counts.glass),
      water: new Layer(box, waterMat, counts.water),
      light: new Layer(box, lightMat, counts.light),
      lamp: new Layer(sphere, lampMat, counts.lamp),
    };
    const L = this.layers;
    L.box.mesh.castShadow = L.box.mesh.receiveShadow = true;
    L.round.mesh.castShadow = L.round.mesh.receiveShadow = true;
    L.stud.mesh.receiveShadow = true;
    L.glass.mesh.renderOrder = 2;
    L.water.mesh.renderOrder = 1;
    L.water.mesh.receiveShadow = true;

    const col = new THREE.Color();
    const G = 0.03; // gap between pieces
    for (const bi of order) {
      const b = bricks[bi];
      const t = start[bi];
      col.setHex(b.color);
      const h = b.h * PLATE;
      const px = b.x + b.w / 2, py = b.y * PLATE + h / 2, pz = b.z + b.d / 2;
      switch (LAYER_OF[b.kind]) {
        case 'box':
          L.box.push(t, px, py, pz, b.w - G, h - 0.012, b.d - G, col);
          break;
        case 'round': {
          const f = b.kind === 'bar' ? 0.32 : 0.96;
          L.round.push(t, px, py, pz, b.w * f, h - 0.01, b.d * f, col);
          break;
        }
        case 'glass': {
          const sx = b.thin === 0 ? 0.25 : b.w - G;
          const sz = b.thin === 2 ? 0.25 : b.d - G;
          L.glass.push(t, px, py, pz, sx, h - 0.012, sz, col);
          break;
        }
        case 'water':
          L.water.push(t, px, py, pz, b.w, h, b.d, col);
          break;
        case 'light':
          L.light.push(t, px, py, pz, b.w - G, h - 0.01, b.d - G, col);
          break;
        case 'lamp':
          L.lamp.push(t, px, py, pz, b.w * 0.95, h, b.d * 0.95, col);
          break;
      }
    }
    for (const s of studs) {
      col.setHex(bricks[s.brick].color);
      L.stud.push(start[s.brick], s.x + 0.5, s.y * PLATE + 0.1, s.z + 0.5, 1, 1, 1, col);
    }
    for (const l of Object.values(L)) {
      l.mesh.instanceMatrix.needsUpdate = true;
      l.mesh.instanceColor!.needsUpdate = true;
      this.group.add(l.mesh);
    }
  }

  /** Returns number of pieces started. */
  update(t: number) {
    let n = 0;
    for (const [k, l] of Object.entries(this.layers)) {
      const c = l.update(t);
      if (k !== 'stud') n += c;
    }
    return n;
  }

  setLightLevel(v: number) {
    for (const m of this.lightMaterials) m.emissiveIntensity = v;
  }
}
