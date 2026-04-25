/*
  emotion.ts
  說明：情緒與 emoji 顯示輔助函式。
*/
export const SMILE_EMOJIS: string[] = [
  '🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳','✨','💫','⚡','🔥','💥','🌟','⭐','🌈',
  '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌀','🌊','💧','💦','☔',
  '⛱️','🌙','🌛','🌜','🌚','🌝','🌞','☄️','🌪️','🌱','🌿','🍀','🍃','🍂','🍁','🌵','🌾','🎋','🎍','🌺','🌸','🌼','🌻','🌹','🥀','🌷','🪷','🪴','🌲','🌳','🌴','🪵','🪨'
];

const _prevSmile = new Map<any, any>();
let _emojiEl: HTMLElement | null = null; let _wasAnySmiling = false;

export function _getOrCreateEmojiEl(): HTMLElement {
  if (!_emojiEl) {
    _emojiEl = document.createElement('div'); _emojiEl.className = 'smile-emoji-persistent';
    const ui = document.getElementById('ui'); if (ui) ui.appendChild(_emojiEl);
  }
  return _emojiEl!;
}

export function _randomEmoji(): string { return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)]; }

export function _tickSmileEmoji(faces: { x:number; y:number; smile?: boolean }[] | null): void {
  const anySmiling = !!(faces && faces.some(f => f.smile));
  const el = _getOrCreateEmojiEl();
  if (anySmiling) {
    const smilingFace = faces ? faces.find(f => f.smile) : null;
    if (!_wasAnySmiling) el.textContent = _randomEmoji();
    if (smilingFace) { el.style.left = smilingFace.x + 'px'; el.style.top = (smilingFace.y - 70) + 'px'; }
    el.style.opacity = '1'; el.style.transform = 'scale(1)';
  } else { el.style.opacity = '0'; el.style.transform = 'scale(0.5)'; }
  _wasAnySmiling = anySmiling;
}

export function updateEmotionBadge(faces: { x:number; y:number; smile?: boolean }[] | null, emotion: string): void {
  const el = document.getElementById('emotion-badge'); if (!el) return;
  if (!faces || faces.length === 0) { el.className = ''; el.textContent = '● FACE TRACKING'; }
  else if (emotion === 'smile') { el.className = 'smile'; el.textContent = '✦ SMILE DETECTED'; }
  else { el.className = ''; el.textContent = `● ${faces.length} FACE${faces.length>1?'S':''} DETECTED`; }
}
