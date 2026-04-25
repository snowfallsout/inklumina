/*
  coordinator.ts
  Purpose: client-only coordinator that wires runtime UI/socket glue
  into the modular TypeScript core (pool, sprites, ml-camera, ui-network, emotion).

  Usage (client):
    import { initCoordinator, startCoordinator, stopCoordinator } from './coordinator';
    onMount(() => { initCoordinator({ videoEl }); startCoordinator(); return () => stopCoordinator(); });

  Notes:
  - This file is client-only; it returns early when `window` is undefined.
  - It delegates render timing to `Canvas.svelte` and focuses on lifecycle, socket and camera wiring.
*/

import { spawnMBTI, particles, mbtiParticles, seedAmbient, pruneAllTypes } from './pool';
import { prewarmAll, getSpriteSet, getDotSprite } from './sprites';
import { setupCamera, setVideo, getVideo } from './vision';
import { buildLegend, renderLegend, showToast, setSessionName, initSocketHandlers } from './overlay';
import { _tickSmileEmoji, updateEmotionBadge } from './emotion';

let socket: any = null;
const mbtiCounts: Record<string, number> = {};

export function initCoordinator(opts?: { videoEl?: HTMLVideoElement | null }) {
  if (typeof window === 'undefined') return;
  if (opts && opts.videoEl) setVideo(opts.videoEl);
  const legendRoot = document.getElementById('legend-rows');
  if (legendRoot) buildLegend(legendRoot);
}

export function startCoordinator() {
  if (typeof window === 'undefined') return;

  try { prewarmAll(); } catch (e) { console.warn('prewarmAll failed', e); }

  try { setupCamera(getVideo() || undefined); } catch (e) { console.warn('setupCamera failed', e); }

  try {
    const ioFn = (globalThis as any).io;
    if (ioFn) socket = ioFn();
    if (!socket) {
      console.warn('socket.io not available on global scope');
      return;
    }

    // Basic connection lifecycle UI hooks
    try { socket.on && socket.on('connect', () => showToast('Socket connected', '#4caf50')); } catch (e) {}
    try { socket.on && socket.on('connect_error', (err: any) => showToast('Socket connect error', '#ff6b6b')); } catch (e) {}
    try { socket.on && socket.on('disconnect', () => showToast('Socket disconnected', '#ffb86b')); } catch (e) {}
    
    // lightweight handler for lucky color events (legacy support)
    try { socket.on && socket.on('lucky_color', (payload: any) => { if (payload && payload.color) showToast('Lucky color!', payload.color); }); } catch (e) {}

    initSocketHandlers(socket, mbtiCounts, {
      renderLegend: (counts: Record<string, number>) => renderLegend(counts),
      spawnMBTI: (mbti: string, color: string) => spawnMBTI(mbti, color),
      showToast: (msg: string, color: string) => showToast(msg, color),
      setSessionName: (n: string) => setSessionName(n),
      clearMBTIParticles: clearMBTIParticles,
      onFirstParticle: () => particles.length > 0,
    });
  } catch (e) {
    console.warn('startCoordinator socket wiring failed', e);
  }
}

export function stopCoordinator() {
  if (socket && socket.off) {
    try { socket.off(); } catch (e) {}
  }
  socket = null;
}

/**
 * Convenience helper to initialize and start the coordinator for a Canvas-based client.
 * Returns a cleanup function that stops the coordinator.
 */
export function mountCoordinator(videoEl?: HTMLVideoElement | null): () => void {
  initCoordinator({ videoEl: videoEl ?? null });
  startCoordinator();
  return () => stopCoordinator();
}

function clearMBTIParticles() {
  for (const mbti of Object.keys(mbtiParticles)) {
    const arr = mbtiParticles[mbti];
    if (!arr) continue;
    for (const p of arr) {
      const idx = particles.indexOf(p);
      if (idx !== -1) particles.splice(idx, 1);
    }
    delete mbtiParticles[mbti];
  }
}

export default { initCoordinator, startCoordinator, stopCoordinator, clearMBTIParticles };
