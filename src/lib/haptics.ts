import * as Haptics from 'expo-haptics';

/**
 * Light tap for the primary action (manual 12.2, Button). Fire and forget: a phone without a vibration motor or with
 * haptics turned off simply does nothing, and that is not an error the diner needs to see.
 */
export function primaryTapHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Tick when a choice changes (tabs, segmented control). */
export function selectionHaptic(): void {
  Haptics.selectionAsync().catch(() => undefined);
}
