/*
 * src/lib/runes/smile.svelte.ts
 * Purpose: Manage a persistent emoji overlay that follows smiling faces.
 */
// @ts-nocheck
import { media } from '$lib/runes/media.svelte';
import { pickRandomEmoji } from '$lib/utils/faceHash';

type Face = any;

let faces: Face[] = [];
let _emojiEl: HTMLDivElement | null = null;
let rafId: number | null = null;
let _container: HTMLElement | null = null;

export const smile = $state({ visible: false, emoji: '', x: 0, y: 0 });

// Create the persistent emoji element once and attach it to the container.
function _createEmojiEl(container?: HTMLElement) {
  if (_emojiEl) return _emojiEl;
  const el = document.createElement('div');
  el.className = 'smile-emoji-persistent';
  el.setAttribute('aria-hidden', 'true');
  el.style.position = 'absolute';
  el.style.pointerEvents = 'none';
  el.style.userSelect = 'none';
  el.style.lineHeight = '1';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.5)';
  el.style.transition = 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
  el.style.filter = 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))';
  el.style.zIndex = '25';
  const parent = container || document.body;
  parent.appendChild(el);
  _emojiEl = el;
  return el;
}

// Position the emoji element relative to the detected face.
function _positionEl(face: Face) {
  if (!_emojiEl || !face) return;
  const parentRect = (_container && _container.getBoundingClientRect()) || { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
  const x = parentRect.left + (1 - (face.x ?? 0)) * parentRect.width;
  const y = parentRect.top + (face.y ?? 0) * parentRect.height;
  _emojiEl.style.left = x + 'px';
  _emojiEl.style.top = (y - 70) + 'px';
}

// Show a random emoji for the provided smiling face.
function _showEmojiForFace(face: Face) {
  const el = _createEmojiEl(_container || undefined);
  el.textContent = pickRandomEmoji();
  _positionEl(face);
  el.style.opacity = '1';
  el.style.transform = 'scale(1)';
  smile.visible = true;
  smile.emoji = el.textContent || '';
  smile.x = parseFloat(el.style.left || '0');
  smile.y = parseFloat(el.style.top || '0');
}

// Hide the persistent emoji overlay.
function _hideEmoji() {
  if (!_emojiEl) return;
  _emojiEl.style.opacity = '0';
  _emojiEl.style.transform = 'scale(0.5)';
  smile.visible = false;
  smile.emoji = '';
  smile.x = 0;
  smile.y = 0;
}

// Animation loop that tracks the current smiling face state.
function _tick() {
  try {
    faces = media.crowd as any;
    const anySmiling = faces.some(f => f && f.smile);
    if (anySmiling) {
      const face = faces.find(f => f && f.smile) || faces[0];
      if (face) {
        if (!_emojiEl || smile.visible === false) _showEmojiForFace(face);
        else _positionEl(face);
      }
    } else {
      if (smile.visible) _hideEmoji();
    }
  } finally {
    rafId = requestAnimationFrame(_tick);
  }
}

// Start the emoji overlay animation loop in the browser.
export function start() {
  if (typeof window === 'undefined') return;
  if (rafId) return;
  rafId = requestAnimationFrame(_tick);
}

// Stop the emoji overlay animation loop and reset state.
export function stop() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  _emojiEl = null;
  smile.visible = false;
  smile.emoji = '';
  smile.x = 0;
  smile.y = 0;
}

export function registerElement(el: HTMLDivElement) {
  _emojiEl = el;
}

// Unregister the emoji element reference.
export function unregisterElement() {
  _emojiEl = null;
}
