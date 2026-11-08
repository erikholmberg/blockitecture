import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

interface Preset {
  elevation: number; azimuth: number; turbidity: number; rayleigh: number; mie: number;
  sun: number; sunColor: number; hemi: number; hemiSky: number; hemiGround: number;
  exposure: number; fog: number; fogNear: number; fogFar: number; lights: number; city: number;
  interior: number; env: number;
}

export const PRESETS: Record<'day' | 'dusk', Preset> = {
  day: {
    elevation: 38, azimuth: 215, turbidity: 2.2, rayleigh: 0.9, mie: 0.003,
    sun: 3.4, sunColor: 0xfff1dc, hemi: 0.75, hemiSky: 0xbcd6f5, hemiGround: 0x6d5f45,
    exposure: 0.42, fog: 0xa9bfd0, fogNear: 1500, fogFar: 20000, lights: 0.2, city: 0, interior: 0, env: 0.3,
  },
  dusk: {
    elevation: 2.2, azimuth: 250, turbidity: 8, rayleigh: 3, mie: 0.01,
    sun: 0.55, sunColor: 0xff9a5a, hemi: 0.42, hemiSky: 0x5a6ea8, hemiGround: 0x3a2a30,
    exposure: 0.62, fog: 0x3c3a58, fogNear: 1200, fogFar: 16000, lights: 3.2, city: 1, interior: 1, env: 0.35,
  },
};

export class Environment {
  sky = new Sky();
  sunLight = new THREE.DirectionalLight(0xffffff, 3);
  hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  interiorLights: THREE.PointLight[] = [];
  poolLight = new THREE.PointLight(0x7fe3ff, 0, 30, 1.5);
  /** the presets with the real sun positions for this house and day (spec 009) */
  private presets: Record<'day' | 'dusk', Preset>;
  current: Preset;
  private target: Preset;
  private pmrem: THREE.PMREMGenerator;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private skyScene = new THREE.Scene();
  private envDirty = true;
  private envTimer = 0;
  nightFactor = 0;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private scene: THREE.Scene,
    sun: Record<'day' | 'dusk', { theta: number; elevation: number }> | undefined,
    /** the house: shadow/sun centre and its lights (spec 010a) */
    private house: { center: { x: number; z: number }; lights: { interior: [number, number, number][]; pool?: [number, number, number] } },
  ) {
    this.presets = {
      day: { ...PRESETS.day, ...(sun && { azimuth: sun.day.theta, elevation: sun.day.elevation }) },
      dusk: { ...PRESETS.dusk, ...(sun && { azimuth: sun.dusk.theta, elevation: sun.dusk.elevation }) },
    };
    this.current = { ...this.presets.day };
    this.target = this.presets.day;
    this.sky.scale.setScalar(10000);
    scene.add(this.sky);
    this.skyScene.add(new Sky());
    (this.skyScene.children[0] as Sky).scale.setScalar(10000);

    const s = this.sunLight;
    s.castShadow = true;
    s.shadow.mapSize.set(4096, 4096);
    const cam = s.shadow.camera;
    cam.left = -120; cam.right = 120; cam.top = 120; cam.bottom = -120;
    cam.near = 10; cam.far = 600;
    s.shadow.bias = -0.0004;
    s.shadow.normalBias = 0.05;
    s.target.position.set(house.center.x, 0, house.center.z);
    scene.add(s, s.target, this.hemi);

    for (const [x, y, z] of house.lights.interior) {
      const l = new THREE.PointLight(0xffd9a0, 0, 45, 1.6);
      l.position.set(x, y, z);
      this.interiorLights.push(l);
      scene.add(l);
    }
    // underwater pool light
    if (house.lights.pool) {
      this.poolLight.position.set(...house.lights.pool);
      scene.add(this.poolLight);
    }
    scene.fog = new THREE.Fog(0xffffff, 300, 2000);
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.apply(this.current);
  }

  set(name: 'day' | 'dusk') {
    this.target = this.presets[name];
  }

  private apply(p: Preset) {
    const phi = THREE.MathUtils.degToRad(90 - p.elevation);
    const theta = THREE.MathUtils.degToRad(p.azimuth);
    const sun = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    for (const sky of [this.sky, this.skyScene.children[0] as Sky]) {
      const u = sky.material.uniforms;
      u.turbidity.value = p.turbidity;
      u.rayleigh.value = p.rayleigh;
      u.mieCoefficient.value = p.mie;
      u.mieDirectionalG.value = 0.8;
      u.sunPosition.value.copy(sun);
    }
    const lightDir = sun.clone();
    lightDir.y = Math.max(lightDir.y, 0.12);
    this.sunLight.position.set(this.house.center.x, 0, this.house.center.z).addScaledVector(lightDir.normalize(), 300);
    this.sunLight.intensity = p.sun;
    this.sunLight.color.setHex(p.sunColor);
    this.hemi.intensity = p.hemi;
    this.hemi.color.setHex(p.hemiSky);
    this.hemi.groundColor.setHex(p.hemiGround);
    this.renderer.toneMappingExposure = p.exposure;
    const fog = this.scene.fog as THREE.Fog;
    fog.color.setHex(p.fog);
    fog.near = p.fogNear; fog.far = p.fogFar;
    for (const l of this.interiorLights) l.intensity = p.interior * 220;
    this.poolLight.intensity = p.interior * 160;
    this.scene.environmentIntensity = p.env;
    this.nightFactor = p.city;
  }

  /** Smoothly blend toward target preset. Returns light level for emissive bricks. */
  update(dt: number) {
    const k = 1 - Math.exp(-dt * 1.6);
    const c = this.current, t = this.target;
    let moving = false;
    for (const key of Object.keys(c) as (keyof Preset)[]) {
      const a = c[key], b = t[key];
      if (key === 'sunColor' || key === 'hemiSky' || key === 'hemiGround' || key === 'fog') {
        if (a !== b) {
          const ca = new THREE.Color(a), cb = new THREE.Color(b);
          ca.lerp(cb, k);
          const hex = ca.getHex();
          c[key] = Math.abs(ca.r - cb.r) + Math.abs(ca.g - cb.g) + Math.abs(ca.b - cb.b) < 0.01 ? b : hex;
          moving = true;
        }
      } else if (Math.abs(a - b) > 1e-3) {
        c[key] = a + (b - a) * k;
        moving = true;
      } else c[key] = b;
    }
    if (moving) {
      this.apply(c);
      this.envDirty = true;
    }
    this.envTimer -= dt;
    if (this.envDirty && this.envTimer <= 0) {
      this.envRT?.dispose();
      this.envRT = this.pmrem.fromScene(this.skyScene, 0, 1, 20000);
      this.scene.environment = this.envRT.texture;
      this.envDirty = false;
      this.envTimer = 0.5;
    }
    return c.lights;
  }
}
