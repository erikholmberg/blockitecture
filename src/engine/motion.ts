/**
 * Spec 037: how much the viewer moves on its own. With the visitor's system set to reduce motion, the scene doesn't
 * auto-rotate, camera moves jump instead of gliding, and pieces appear in place instead of dropping in. Pure.
 */
export interface MotionSettings { autoRotate: boolean; glide: boolean; dropHeight: number }

/** the pieces' drop, in plates (BrickSet) */
export const DROP_HEIGHT = 9;

export function motionSettings(reduced: boolean): MotionSettings {
  return reduced ? { autoRotate: false, glide: false, dropHeight: 0 } : { autoRotate: true, glide: true, dropHeight: DROP_HEIGHT };
}

/** the system's answer, false where the browser can't say */
export const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
