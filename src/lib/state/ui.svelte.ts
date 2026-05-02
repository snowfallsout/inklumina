/*
 * src/lib/runes/ui.svelte.ts
 * Purpose: Shared UI overlay state (toasts, hand badge, waiting indicator).
 */
// typed UI rune: shared UI overlay state
export const ui = $state({
  toast: null as { msg: string; color?: string } | null,
  handBadgeText: '✋ NO HAND',
  waitingVisible: true,
  waterOverlay: false
} as {
  toast: { msg: string; color?: string } | null;
  handBadgeText: string;
  waitingVisible: boolean;
  waterOverlay: boolean;
});

// Show a toast message and dismiss it automatically.
export function showToast(msg: string, color?: string) {
  ui.toast = { msg, color };
  setTimeout(() => {
    ui.toast = null;
  }, 3000);
}

// Update the hand badge text shown in the UI.
export function setHandBadge(text: string) {
  ui.handBadgeText = text;
}

// Toggle the waiting indicator visibility.
export function setWaitingVisible(visible: boolean) {
  ui.waitingVisible = visible;
}

// Toggle a UI-only water overlay (visual only, does not affect camera)
export function toggleWaterOverlay() {
  ui.waterOverlay = !ui.waterOverlay;
}

export function setWaterOverlay(visible: boolean) {
  ui.waterOverlay = !!visible;
}
