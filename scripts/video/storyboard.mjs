/**
 * The LinkedIn video's shots (4:5, 30 fps). Each shot is a page of the running site and a camera; make-video.mjs renders it
 * frame by frame. Cameras are each house's thumbnail camera (its spec's Implementation notes), pulled back for the portrait
 * frame: `pull` scales the camera's distance from its target.
 */
export const FPS = 30;
export const SIZE = { width: 1080, height: 1350 };
export const SITE = 'blockitecture.vercel.app';

/** a camera: a named view of the house, or [x, y, z, tx, ty, tz] (the ?cam= values) */
const cam = (c) => c;

/** the tour, in order of the year each house was finished */
const TOUR = [
  ['rietveld-schroder-house', cam({ view: 'corner' })],
  ['ennis-house', cam({ view: 'below' })],
  ['lovell-health-house', cam({ view: 'below' })],
  ['casa-malaparte', cam({ view: 'sea' })],
  ['kaufmann-desert-house', cam({ view: 'pool' })],
  ['casa-luis-barragan', cam([-30, 58, 45, 60, 10, 110])],
  ['eames-house', cam({ view: 'meadow' })],
  ['rose-seidler-house', cam([-34, 18, 70, 22, 0, 24])],
  ['farnsworth-house', cam({ view: 'meadow' })],
  ['stahl-house', cam({ view: 'pool' })],
  ['sheats-goldstein-residence', cam([-30, 55, 100, 40, 2, -5])],
  ['douglas-house', cam([66, 6, 112, 22, 20, 14])],
  ['koshino-house', cam([118, 58, -40, 50, 6, 32])],
];

export const SHOTS = [
  { kind: 'home', seconds: 2.5, title: 'Famous buildings,\nbuilt block by block' },
  {
    kind: 'build', slug: 'fallingwater', seconds: 9.5, camera: { view: 'overview' }, pull: 1.25, orbitDeg: 110,
    caption: 'Watch it go up, block by block',
  },
  // the meadow views of the Eames and Farnsworth houses stand among trees: pulled back, a trunk fills the frame
  ...TOUR.map(([slug, camera]) => ({ kind: 'still', slug, seconds: 0.9, camera, pull: /eames|farnsworth/.test(slug) ? 1 : 1.3, push: 0.08, lowerThird: true })),
  { kind: 'still', slug: 'lovell-health-house', seconds: 1.5, camera: { view: 'city' }, pull: 1, push: 0.05, light: 'dusk', caption: 'Day or dusk' },
  // in the dining room, between two of the glass wall's mullions (every 4 ft) and clear of the table, stopping short of it
  { kind: 'walk', slug: 'douglas-house', seconds: 1.5, from: [18.5, 5.4, 16.5], to: [18.5, 5.4, 21.5], look: [18.5, 4, 80], caption: 'Walk inside' },
  { kind: 'end', seconds: 3 },
];
