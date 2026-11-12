/**
 * Spec 066: how shiny the pieces are, and the light they're seen in. `gloss` is what every page shows; the others
 * are candidates, reachable only with `?finish=<key>` (like `?dpr=`), for comparing on /dev/design/.
 */
export interface Finish {
  label: string;
  /** one line for the design page: what changes */
  note: string;
  /** the plastic's roughness: 0 mirror, 1 chalk */
  roughness: number;
  /** if set, upward faces (and the studs on them) use this roughness, and the sides keep `roughness` */
  topRoughness?: number;
  /** multiplies the mirror reflection (sun highlight and sky), leaving the piece's own colour alone */
  specular: number;
  /** multiplies the sun's and the sky fill's strength */
  sun: number;
  hemi: number;
  /** how bright scene values are squeezed into what a screen can show */
  tone: 'aces' | 'neutral' | 'agx';
  /** multiplies the exposure, so curves with a different mid-grey come out as bright as `aces` */
  exposure: number;
}

const GLOSS: Finish = {
  label: 'Gloss (today)', note: 'What every page shows now.',
  roughness: 0.32, specular: 1, sun: 1, hemi: 1, tone: 'aces', exposure: 1,
};

export const FINISHES = {
  gloss: GLOSS,
  satin: { ...GLOSS, label: '1a. Satin', note: 'Less shiny plastic: roughness 0.32 → 0.5.', roughness: 0.5 },
  'soft-satin': { ...GLOSS, label: '1b. Soft satin', note: 'Less shiny still: roughness 0.65.', roughness: 0.65 },
  dim: { ...GLOSS, label: '2. Gloss, dimmer reflection', note: 'Same gloss, reflection at half strength.', specular: 0.5 },
  matte: { ...GLOSS, label: '3. Matte', note: 'No reflection at all.', roughness: 1, specular: 0 },
  tops: { ...GLOSS, label: '4. Satin tops, glossy sides', note: 'Upward faces at roughness 0.65; sides keep the gloss.', topRoughness: 0.65 },
  sun: { ...GLOSS, label: '5a. Softer sun', note: 'Same plastic; sun at 70%, sky fill at 135%.', sun: 0.7, hemi: 1.35 },
  neutral: { ...GLOSS, label: '5b. Neutral tone curve', note: 'Same plastic and sun; a curve that keeps colour in highlights.', tone: 'neutral', exposure: 1.65 },
  agx: { ...GLOSS, label: '5c. AgX tone curve', note: 'Same plastic and sun; a curve that rolls highlights off softly.', tone: 'agx', exposure: 1.65 },
} satisfies Record<string, Finish>;

export type FinishKey = keyof typeof FINISHES;
export const DEFAULT_FINISH: FinishKey = 'gloss';

/** the finish a `?finish=` value asks for; anything unknown (or nothing) is today's */
export const finishFromParam = (v: string | null): Finish =>
  (v && Object.hasOwn(FINISHES, v) ? FINISHES[v as FinishKey] : FINISHES[DEFAULT_FINISH]);
