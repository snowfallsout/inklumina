/*
 * src/lib/runes/ui.svelte.ts
 * Purpose: Shared UI overlay state (toasts, hand badge, waiting indicator).
 */
// @ts-nocheck
export const ui = $state({
  toast: null as { msg: string; color?: string } | null,
  handBadgeText: '✋ NO HAND',
  waitingVisible: true
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
