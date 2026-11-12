/** Spec 066: the views the finish options are pictured from on /dev/design/. `cam` is the viewer's ?cam= value. */
export interface Scene { key: string; slug: string; title: string; why: string; cam: string }

export const SCENES: Scene[] = [
  { key: 'stahl', slug: 'stahl-house', title: 'Stahl House, looking towards the sun',
    why: 'The angle where the roof and terraces turn white.', cam: '-40,48,100,60,0,-25' },
  { key: 'nng', slug: 'neue-nationalgalerie', title: 'Neue Nationalgalerie, low sun',
    why: 'A big dark roof and a pale plaza under a low sun.', cam: '-150,110,-190,108,8,108' },
  { key: 'schroder', slug: 'rietveld-schroder-house', title: 'Rietveld Schröder House, overview',
    why: 'No glare here: this shows what each option costs in colour and sparkle.', cam: '' },
];

/** the live page for one scene in one finish */
export const liveUrl = (s: Scene, finish: string) =>
  `/${s.slug}/?${s.cam ? `cam=${s.cam}&` : ''}finish=${finish}`;
