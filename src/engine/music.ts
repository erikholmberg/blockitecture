/**
 * Spec 083: the building pages' soundtrack. Pure (no DOM): what plays, when it should play, and the saved mute choice.
 * The player itself is src/engine/musicPlayer.ts.
 */

/** The one track, the same on every building. The file is in public/, already at 40% of its full level (see the spec). */
export const MUSIC = {
  path: 'music/airport-lounge.mp3',
  title: 'Airport Lounge',
  artist: 'Kevin MacLeod',
  artistUrl: 'https://incompetech.com',
  licence: 'CC BY 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
} as const;

/** Music plays once the visitor has started the build, if they switched it on and the tab is visible. */
export function shouldPlay({ started, muted, hidden }: { started: boolean; muted: boolean; hidden: boolean }): boolean {
  return started && !muted && !hidden;
}

export const MUTED_KEY = 'blockitecture:music-muted';
type Store = Pick<Storage, 'getItem' | 'setItem'>;

/** The saved choice. Music is off until the visitor switches it on: muted when nothing is saved or storage is blocked. */
export function readMuted(storage: Pick<Store, 'getItem'> | null): boolean {
  try {
    return storage?.getItem(MUTED_KEY) !== '0';
  } catch {
    return true;
  }
}

export function writeMuted(storage: Pick<Store, 'setItem'> | null, muted: boolean): void {
  try {
    storage?.setItem(MUTED_KEY, muted ? '1' : '0');
  } catch {
    // storage is blocked: the choice lasts for this page only
  }
}
