/*
 * src/lib/runes/media.svelte.ts
 * Purpose: Provide shared media state and camera lifecycle helpers used by
 * the display features (video element, camera init/stop, sensor state).
 */
// file-level: Svelte rune for media state and helpers (typed)
import { browser } from '$app/environment';
import settings from '$lib/config/settings';
import { setHandBadge } from '$lib/state/ui.svelte';
import { init as mediapipeInit, start as mediapipeStart, stop as mediapipeStop } from '$lib/services/mediapipe';

export type CrowdMember = {
  id?: string;
  x: number;
  y: number;
  size?: number;
  conf?: number;
  smile?: boolean;
  ts?: number;
};

export type InteractionPoint = {
  id?: string;
  x: number;
  y: number;
  score?: number;
  ts?: number;
};

export const media = $state({
  videoEl: null as HTMLVideoElement | null,
  camOn: false,
  crowd: [] as CrowdMember[],
  activeInteractions: [] as InteractionPoint[],
  emotion: 'neutral' as 'neutral' | 'smile'
});

// Maximum number of crowd members kept in memory.
export const CROWD_CAP = 30;

// Maximum number of active interaction points kept in memory.
export const ACTIVE_CAP = 8;

let _starting = false;
let _started = false;

// Replace the current crowd snapshot with a trimmed, timestamped list.
export function setCrowd(m: CrowdMember[]) {
  const ts = Date.now();
  const trimmed = m.slice(0, CROWD_CAP).map((it) => ({ ...it, ts: it.ts || ts }));
  media.crowd = trimmed;
}

// Prepend a single crowd member while enforcing the crowd cap.
export function pushCrowdMember(it: CrowdMember) {
  const ts = Date.now();
  const next = [{ ...it, ts }, ...media.crowd].slice(0, CROWD_CAP);
  media.crowd = next;
}

// Replace the active interaction list with a trimmed, timestamped list.
export function setActiveInteractions(a: InteractionPoint[]) {
  const ts = Date.now();
  const trimmed = a.slice(0, ACTIVE_CAP).map((it) => ({ ...it, ts: it.ts || ts }));
  media.activeInteractions = trimmed;
}

// Clear media sensors and reset the derived emotion state.
export function clearAllSensors() {
  media.crowd = [];
  media.activeInteractions = [];
  media.emotion = 'neutral';
}

// Initialize the camera stream and start Mediapipe processing.
export async function initCamera(): Promise<void> {
  if (!browser) return;
  if (_starting || _started) return;

  _starting = true;
  setHandBadge('✋ HAND TRACKING INIT');

  try {
    const el = ensureVideoElement();
    if (!el) throw new Error('video element is unavailable');

    await mediapipeInit({
      maxCrowd: CROWD_CAP,
        topNHands: Math.min(2, ACTIVE_CAP),
        handsModelComplexity: 1,
      handConfidenceThreshold: settings.mediapipe.handConfidenceThreshold,
      faceConfidenceThreshold: settings.mediapipe.faceConfidenceThreshold
    });

    await mediapipeStart(
      el,
      (members: CrowdMember[]) => {
        setCrowd(members);
        const smileCount = members.reduce((n, member) => n + (member.smile ? 1 : 0), 0);
        const hasFaces = members.length > 0;
        media.emotion = hasFaces && smileCount > members.length * 0.5 ? 'smile' : 'neutral';
      },
      (points: InteractionPoint[]) => {
        setActiveInteractions(points);
        setHandBadge(points.length > 0 ? `✋ ${points.length} PINCH` : '✋ NO HAND');
      },
      {
        maxCrowd: CROWD_CAP,
        topNHands: Math.min(2, ACTIVE_CAP),
        minProcessingHz: 20,
        handsModelComplexity: 1,
        handConfidenceThreshold: settings.mediapipe.handConfidenceThreshold,
        faceConfidenceThreshold: settings.mediapipe.faceConfidenceThreshold
      }
    );

    media.camOn = true;
    _started = true;
  } catch (e) {
    console.warn('initCamera failed:', e);
    media.camOn = false;
    clearAllSensors();
    setHandBadge('✋ NO HAND');
    throw e;
  } finally {
    _starting = false;
  }
}

// Stop camera processing, release the stream, and reset state.
export function stopCamera(): void {
  if (!browser) return;

  mediapipeStop();
  const el = media.videoEl;
  const stream = el?.srcObject;
  if (el && stream instanceof MediaStream) {
    for (const track of stream.getTracks()) {
      try {
        track.stop();
      } catch (e) {
        void e;
      }
    }
    el.srcObject = null;
  }
  if (el) {
    try {
      el.pause();
    } catch (e) {
      void e;
    }
    el.classList.remove('ready');
  }
  clearAllSensors();
  media.camOn = false;
  setHandBadge('✋ NO HAND');
  _started = false;
}

// Ensure the hidden video element exists and is attached to the document.
function ensureVideoElement(): HTMLVideoElement | null {
  if (media.videoEl && media.videoEl.isConnected) return media.videoEl;

  const existing = document.getElementById('video-bg');
  if (existing instanceof HTMLVideoElement) {
    media.videoEl = existing;
    return existing;
  }

  const created = document.createElement('video');
  created.id = 'video-bg';
  created.autoplay = true;
  created.muted = true;
  created.playsInline = true;
  created.style.display = 'none';
  created.setAttribute('aria-hidden', 'true');
  document.body.appendChild(created);
  media.videoEl = created;
  return created;
}
