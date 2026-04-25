// @ts-nocheck
import appEnv from '$app/environment';
import settings from '$lib/config/settings.ts';
import { setHandBadge } from '$lib/runes/ui.svelte';
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

export const media = $state({
  videoEl: null as HTMLVideoElement | null,
  camOn: false,
  crowd: [] as CrowdMember[],
  activeInteractions: [] as InteractionPoint[],
  emotion: 'neutral' as 'neutral' | 'smile'
});

export const CROWD_CAP = 30;

export const ACTIVE_CAP = 8;

let _starting = false;
let _started = false;

export function setCrowd(m: CrowdMember[]) {
  const ts = Date.now();
  const trimmed = m.slice(0, CROWD_CAP).map((it) => ({ ...it, ts: it.ts || ts }));
  media.crowd = trimmed;
}

export function pushCrowdMember(it: CrowdMember) {
  const ts = Date.now();
  const next = [{ ...it, ts }, ...media.crowd].slice(0, CROWD_CAP);
  media.crowd = next;
}

export function setActiveInteractions(a: InteractionPoint[]) {
  const ts = Date.now();
  const trimmed = a.slice(0, ACTIVE_CAP).map((it) => ({ ...it, ts: it.ts || ts }));
  media.activeInteractions = trimmed;
}

export function clearAllSensors() {
  media.crowd = [];
  media.activeInteractions = [];
  media.emotion = 'neutral';
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

export function stopCamera(): void {
  if (!appEnv.browser) return;

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
