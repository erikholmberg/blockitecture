import { Walker } from './walk';

/** Left half: virtual joystick. Right half: drag to look. */
export function attachTouch(root: HTMLElement, walker: Walker) {
  const pad = document.createElement('div');
  pad.className = 'joy';
  const knob = document.createElement('div');
  knob.className = 'joy-knob';
  pad.appendChild(knob);
  const jump = document.createElement('button');
  jump.className = 'jump-btn';
  jump.textContent = 'Jump';
  root.append(pad, jump);

  let stickId: number | null = null, lookId: number | null = null;
  let sx = 0, sy = 0, lx = 0, ly = 0;
  const R = 50;

  const area = root.querySelector('canvas')!;
  area.addEventListener('touchstart', (e) => {
    if (!walker.enabled) return;
    for (const t of Array.from(e.changedTouches)) {
      if (t.clientX < innerWidth / 2 && stickId === null) {
        stickId = t.identifier; sx = t.clientX; sy = t.clientY;
        pad.style.left = sx - 60 + 'px'; pad.style.top = sy - 60 + 'px';
        pad.classList.add('on');
      } else if (lookId === null) {
        lookId = t.identifier; lx = t.clientX; ly = t.clientY;
      }
    }
    e.preventDefault();
  }, { passive: false });
  area.addEventListener('touchmove', (e) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === stickId) {
        let dx = t.clientX - sx, dy = t.clientY - sy;
        const l = Math.hypot(dx, dy);
        if (l > R) { dx *= R / l; dy *= R / l; }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        walker.stick.x = dx / R;
        walker.stick.y = -dy / R;
      } else if (t.identifier === lookId) {
        walker.look(t.clientX - lx, t.clientY - ly, 0.005);
        lx = t.clientX; ly = t.clientY;
      }
    }
    e.preventDefault();
  }, { passive: false });
  const end = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === stickId) {
        stickId = null; walker.stick.x = walker.stick.y = 0;
        knob.style.transform = ''; pad.classList.remove('on');
      } else if (t.identifier === lookId) lookId = null;
    }
  };
  area.addEventListener('touchend', end);
  area.addEventListener('touchcancel', end);
  jump.addEventListener('touchstart', (e) => { walker.keys.add('Space'); e.preventDefault(); });
  jump.addEventListener('touchend', () => walker.keys.delete('Space'));

  return {
    show(v: boolean) { jump.style.display = v ? 'block' : 'none'; },
  };
}
