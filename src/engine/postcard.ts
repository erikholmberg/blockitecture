/**
 * Spec 037: the postcard. Renders the current view once at the postcard's size, without the controls, draws the caption band
 * under it, and hands it over: the share sheet on phones that take files (so it can go to Photos), a download elsewhere.
 */
import * as THREE from 'three';
import { POSTCARD, postcardLayout } from '@/engine/share';

const PAPER = '#f7f5f0'; // the pages' off-white (spec 023)
const INK = '#1c1b19';
const MUTED = '#6f6b63';
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/** one render of the scene at the postcard's size, with the caption; the renderer is put back as it was */
export function renderPostcard(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, lines: string[]): Promise<Blob | null> {
  const { scene: S, band: B } = postcardLayout();
  const size = renderer.getSize(new THREE.Vector2());
  const ratio = renderer.getPixelRatio();
  const aspect = camera.aspect;
  renderer.setPixelRatio(1);
  renderer.setSize(S.w, S.h, false);
  camera.aspect = S.w / S.h;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const canvas = document.createElement('canvas');
  canvas.width = POSTCARD.width;
  canvas.height = POSTCARD.height;
  const g = canvas.getContext('2d')!;
  // copied in the same task as the render, while the drawing buffer still holds it
  g.drawImage(renderer.domElement, S.x, S.y, S.w, S.h);
  renderer.setPixelRatio(ratio);
  renderer.setSize(size.x, size.y, false);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  g.fillStyle = PAPER;
  g.fillRect(B.x, B.y, B.w, B.h);
  const [name, byline, site, credit] = lines;
  const pad = 44;
  g.textBaseline = 'alphabetic';
  g.fillStyle = INK;
  g.font = `700 32px ${FONT}`;
  g.fillText(name, pad, B.y + 46);
  g.fillStyle = MUTED;
  g.font = `400 19px ${FONT}`;
  g.fillText(byline, pad, B.y + 78);
  g.textAlign = 'right';
  g.fillStyle = INK;
  g.font = `600 17px ${FONT}`;
  g.fillText(site, B.w - pad, B.y + 46);
  g.fillStyle = MUTED;
  g.font = `400 13px ${FONT}`;
  g.fillText(credit, B.w - pad, B.y + 78);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** the share sheet where it takes files (phones), otherwise a download */
export async function deliverPostcard(blob: Blob, fileName: string, title: string, touch: boolean) {
  const file = new File([blob], fileName, { type: 'image/png' });
  if (touch && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); } catch { /* cancelled */ }
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
