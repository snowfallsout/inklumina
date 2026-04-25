import appEnv from '$app/environment';
import settings from '$lib/config/settings.ts';
import { setHandBadge } from '$lib/runes/ui.svelte.ts';
import { init as mediapipeInit, start as mediapipeStart, stop as mediapipeStop } from '$lib/services/mediapipe.ts';

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

export let videoEl = $state<HTMLVideoElement | null>(null);
export let camOn = $state<boolean>(false);

export const CROWD_CAP = 30;
export let crowd = $state<CrowdMember[]>([]);

export const ACTIVE_CAP = 8;
export let activeInteractions = $state<InteractionPoint[]>([]);

export let emotion = $state<'neutral' | 'smile'>('neutral');

let _starting = false;
let _started = false;

export function setCrowd(m: CrowdMember[]) {
  const ts = Date.now();
  const trimmed = m.slice(0, CROWD_CAP).map(it => ({ ...it, ts: it.ts || ts }));
  crowd = trimmed;
}

export function pushCrowdMember(it: CrowdMember) {
  const ts = Date.now();
  const next = [{ ...it, ts }, ...crowd].slice(0, CROWD_CAP);
  crowd = next;
}

export function setActiveInteractions(a: InteractionPoint[]) {
  const ts = Date.now();
  const trimmed = a.slice(0, ACTIVE_CAP).map(it => ({ ...it, ts: it.ts || ts }));
  activeInteractions = trimmed;
}

export function clearAllSensors() {
  crowd = [];
  activeInteractions = [];
  emotion = 'neutral';
}

export async function initCamera(): Promise<void> {
  if (!appEnv.browser) return;
  if (_starting || _started) return;

  _starting = true;
  setHandBadge('✋ HAND TRACKING INIT');

  try {
    const el = ensureVideoElement();
    if (!el) throw new Error('video element is unavailable');

    await mediapipeInit({
      maxCrowd: CROWD_CAP,
      topNHands: Math.min(2, ACTIVE_CAP),
      minProcessingHz: 20,
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
        emotion = hasFaces && smileCount > members.length * 0.5 ? 'smile' : 'neutral';
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

    camOn = true;
    _started = true;
  } catch (e) {
    console.warn('initCamera failed:', e);
    camOn = false;
    clearAllSensors();
    setHandBadge('✋ NO HAND');
    throw e;
  } finally {
    _starting = false;
  }
}

export function stopCamera(): void {
  if (!appEnv.browser) return;

  mediapipeStop();
  const el = videoEl;
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
    try { el.pause(); } catch (e) { void e; }
    el.classList.remove('ready');
  }
  clearAllSensors();
  camOn = false;
  setHandBadge('✋ NO HAND');
  _started = false;
}

function ensureVideoElement(): HTMLVideoElement | null {
  if (videoEl && (videoEl as HTMLVideoElement).isConnected) return videoEl as HTMLVideoElement;

  const existing = document.getElementById('video-bg');
  if (existing instanceof HTMLVideoElement) {
    videoEl = existing;
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
  videoEl = created;
  return created;
}
