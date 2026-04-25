export let toast = $state<{ msg: string; color?: string } | null>(null);
export let handBadgeText = $state<string>('✋ NO HAND');
export let waitingVisible = $state<boolean>(true);

export function showToast(msg: string, color?: string) {
  toast = { msg, color };
  setTimeout(() => (toast = null), 3000);
}

export function setHandBadge(text: string) {
  handBadgeText = text;
}

export function setWaitingVisible(visible: boolean) {
  waitingVisible = visible;
}
