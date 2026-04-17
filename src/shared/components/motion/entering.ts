import { Easing, FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const EASE_OUT_QUART = Easing.bezier(0.25, 1, 0.5, 1);

/**
 * Page-level entering primitives. Use the same durations/easing across screens
 * so the motion language stays consistent.
 *
 * Stagger guideline: 60ms between siblings for list-like sequences, 100-150ms
 * for hero-level choreography.
 */
export const enterPage = (delay = 0) => FadeInDown.duration(420).delay(delay).easing(EASE_OUT_QUART);

export const enterHero = (delay = 0) => FadeInDown.duration(520).delay(delay).easing(EASE_OUT_QUART);

export const enterListItem = (index: number, baseDelay = 0) =>
  FadeInUp.duration(360).delay(baseDelay + index * 60).easing(EASE_OUT_QUART);

export const enterSoft = (delay = 0) => FadeIn.duration(360).delay(delay).easing(EASE_OUT_QUART);
