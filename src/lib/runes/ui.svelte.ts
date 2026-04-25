// @ts-nocheck
export const ui = $state({
  toast: null as { msg: string; color?: string } | null,
  handBadgeText: '✋ NO HAND',
  waitingVisible: true
});

export function showToast(msg: string, color?: string) {
  ui.toast = { msg, color };
  setTimeout(() => {
    ui.toast = null;
  }, 3000);
}

export function setHandBadge(text: string) {
  ui.handBadgeText = text;
}

export function setWaitingVisible(visible: boolean) {
  ui.waitingVisible = visible;
}
