import { PHASES } from '../bricks/catalog';

export interface HudState {
  t: number;
  total: number;
  playing: boolean;
  speed: number;
  placed: number;
  pieces: number;
  phase: number;
}

export interface HudHandlers {
  onStart(): void;
  onPlayPause(): void;
  onSpeed(s: number): void;
  onSeek(t: number): void;
  onFinish(): void;
  onRestart(): void;
  onMode(m: 'orbit' | 'walk'): void;
  onLight(l: 'day' | 'dusk'): void;
  onRoof(on: boolean): void;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export class Hud {
  root: HTMLElement;
  private els: Record<string, HTMLElement> = {};
  private scrubbing = false;

  constructor(parent: HTMLElement, private h: HudHandlers, total: number, pieces: number) {
    this.root = document.createElement('div');
    this.root.className = 'hud';
    this.root.innerHTML = `
      <div class="intro" data-el="intro">
        <div class="card">
          <div class="eyebrow">Case Study House #22 · Pierre Koenig · 1959–60</div>
          <h1>The Stahl House,<br/>brick by brick</h1>
          <p>Steel, glass and a view over the whole of Los Angeles. Watch all
          <b>${pieces.toLocaleString()}</b> pieces snap into place on the Hollywood Hills.
          Fly around it, or walk in and look around while it goes up.</p>
          <button class="primary" data-el="start">Start building</button>
          <div class="hint">Drag to orbit · scroll to zoom · <b>Walk</b> mode for first person</div>
        </div>
      </div>
      <div class="top">
        <div class="title"><b>Stahl House</b><span>1635 Woods Drive, Los Angeles</span></div>
        <div class="toggles">
          <div class="seg" data-el="mode">
            <button data-v="orbit" class="on">Orbit</button><button data-v="walk">Walk</button>
          </div>
          <div class="seg" data-el="roof" title="Lift the roof off to see inside">
            <button data-v="on" class="on">Roof</button><button data-v="off">No roof</button>
          </div>
          <div class="seg" data-el="light">
            <button data-v="day" class="on">Day</button><button data-v="dusk">Dusk</button>
          </div>
        </div>
      </div>
      <div class="walkhint" data-el="walkhint"></div>
      <div class="bar">
        <button class="icon" data-el="play" title="Play / pause (P)">❚❚</button>
        <div class="seg small" data-el="speed">
          <button data-v="1" class="on">1×</button><button data-v="4">4×</button><button data-v="16">16×</button>
        </div>
        <div class="timeline">
          <div class="phase"><span data-el="phase"></span><span data-el="count"></span></div>
          <input type="range" min="0" max="${total}" step="0.01" value="0" data-el="scrub" aria-label="Build timeline"/>
          <div class="ticks" data-el="ticks"></div>
        </div>
        <span class="time" data-el="time">0:00</span>
        <button class="text" data-el="finish">Finish</button>
        <button class="text" data-el="restart">Restart</button>
      </div>`;
    parent.appendChild(this.root);
    this.root.querySelectorAll<HTMLElement>('[data-el]').forEach((e) => (this.els[e.dataset.el!] = e));

    const E = this.els;
    E.start.onclick = () => { E.intro.classList.add('gone'); h.onStart(); };
    E.play.onclick = () => h.onPlayPause();
    E.finish.onclick = () => h.onFinish();
    E.restart.onclick = () => h.onRestart();
    const seg = (el: HTMLElement, fn: (v: string) => void) => {
      el.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
        b.onclick = (ev) => {
          ev.stopPropagation();
          el.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
          fn(b.dataset.v!);
          b.blur();
        };
      });
    };
    seg(E.speed, (v) => h.onSpeed(+v));
    seg(E.mode, (v) => h.onMode(v as 'orbit' | 'walk'));
    seg(E.light, (v) => h.onLight(v as 'day' | 'dusk'));
    seg(E.roof, (v) => h.onRoof(v === 'on'));
    const scrub = E.scrub as HTMLInputElement;
    scrub.addEventListener('input', () => { this.scrubbing = true; h.onSeek(+scrub.value); });
    scrub.addEventListener('change', () => { this.scrubbing = false; scrub.blur(); });
  }

  setPhaseTicks(phaseStart: number[], total: number) {
    this.els.ticks.innerHTML = phaseStart
      .map((s, i) => `<i style="left:${(s / total) * 100}%" title="${PHASES[i].name}"></i>`)
      .join('');
  }

  setMode(m: 'orbit' | 'walk') {
    this.els.mode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === m));
  }

  setWalkHint(text: string) {
    this.els.walkhint.textContent = text;
    this.els.walkhint.style.display = text ? 'block' : 'none';
  }

  update(s: HudState) {
    const E = this.els;
    if (!this.scrubbing) (E.scrub as HTMLInputElement).value = String(s.t);
    E.play.textContent = s.playing ? '❚❚' : '▶';
    E.time.textContent = fmt(Math.min(s.t, s.total));
    const done = s.placed >= s.pieces;
    E.phase.textContent = done ? 'Complete. Welcome to Case Study House #22' : PHASES[s.phase].name;
    E.count.textContent = `${s.placed.toLocaleString()} / ${s.pieces.toLocaleString()} pieces`;
  }
}
