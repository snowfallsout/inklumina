// Minimal MediaPipe runtime service for display route.
// Responsibilities:
// - Lazy-load FaceMesh + Hands scripts in browser.
// - Manage one camera stream and one RAF processing loop.
// - Emit normalized crowd/interactions arrays to callers.

import { browser } from '$app/environment';
import type { CrowdMember, InteractionPoint } from '$lib/state/media.svelte';

type FaceMeshLike = {
  setOptions: (opts: Record<string, unknown>) => void;
  onResults: (cb: (results: any) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  initialize?: () => Promise<void>;
};

type HandsLike = {
  setOptions: (opts: Record<string, unknown>) => void;
  onResults: (cb: (results: any) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  initialize?: () => Promise<void>;
};

export type MediapipeOptions = {
  faceDetectorModel?: string;
  handsModelComplexity?: 0 | 1;
  maxCrowd?: number;
  topNHands?: number;
  minProcessingHz?: number;
  handConfidenceThreshold?: number;
  faceConfidenceThreshold?: number;
};

const DEFAULTS: Required<Omit<MediapipeOptions, 'faceDetectorModel'>> = {
  handsModelComplexity: 1,
  maxCrowd: 6,
  topNHands: 2,
  minProcessingHz: 20,
  handConfidenceThreshold: 0.6,
  faceConfidenceThreshold: 0.6
};

const FACE_MESH_SCRIPT = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js';
const HANDS_SCRIPT = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js';

const PINCH_THRESHOLD_NORM = 0.09;

let _inited = false;
let _running = false;
let _processing = false;
let _frameCounter = 0;
let _rafId = 0;
let _lastProcessedAt = 0;

let _videoEl: HTMLVideoElement | null = null;
let _stream: MediaStream | null = null;
let _faceMesh: FaceMeshLike | null = null;
let _hands: HandsLike | null = null;

let _baseOpts: MediapipeOptions = {};
let _onCrowdUpdate: ((c: CrowdMember[]) => void) | null = null;
let _onInteractionsUpdate: ((a: InteractionPoint[]) => void) | null = null;

let _latestCrowd: CrowdMember[] = [];
let _latestInteractions: InteractionPoint[] = [];

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function mergedOptions(opts?: MediapipeOptions): Required<Omit<MediapipeOptions, 'faceDetectorModel'>> & Pick<MediapipeOptions, 'faceDetectorModel'> {
  return {
    ...DEFAULTS,
    ..._baseOpts,
    ...opts
  };
}

function emitLatest() {
  _onCrowdUpdate?.([..._latestCrowd]);
  _onInteractionsUpdate?.([..._latestInteractions]);
}

function loadScriptOnce(src: string): Promise<void> {
  if (!browser) return Promise.resolve();
  const found = document.querySelector(`script[data-cf-mp-src="${src}"]`) as HTMLScriptElement | null;
  if (found?.dataset.loaded === '1') return Promise.resolve();
  if (found) {
    return new Promise((resolve, reject) => {
      found.addEventListener('load', () => resolve(), { once: true });
      found.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.dataset.cfMpSrc = src;
    s.onload = () => {
      s.dataset.loaded = '1';
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

async function ensureScriptsLoaded() {
  await loadScriptOnce(FACE_MESH_SCRIPT);
  await loadScriptOnce(HANDS_SCRIPT);
}

function setupFaceMesh(opts: Required<Omit<MediapipeOptions, 'faceDetectorModel'>> & Pick<MediapipeOptions, 'faceDetectorModel'>) {
  const FaceMeshCtor = (window as any).FaceMesh;
  if (!FaceMeshCtor) {
    throw new Error('MediaPipe FaceMesh constructor is unavailable');
  }
  _faceMesh = new FaceMeshCtor({
    locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`
  }) as FaceMeshLike;

  _faceMesh.setOptions({
    maxNumFaces: opts.maxCrowd,
    refineLandmarks: false,
    minDetectionConfidence: opts.faceConfidenceThreshold,
    minTrackingConfidence: opts.faceConfidenceThreshold
  });

  _faceMesh.onResults((results: any) => {
    const landmarks = Array.isArray(results?.multiFaceLandmarks) ? results.multiFaceLandmarks : [];
    const next: CrowdMember[] = [];

    for (let i = 0; i < Math.min(landmarks.length, opts.maxCrowd); i++) {
      const lm = landmarks[i];
      const anchor = lm?.[168];
      if (!anchor) continue;

      const mouth = Math.abs((lm?.[291]?.x ?? 0) - (lm?.[61]?.x ?? 0));
      const eye = Math.abs((lm?.[263]?.x ?? 0) - (lm?.[33]?.x ?? 0));
      const smile = eye > 0 ? (mouth / eye) > 0.57 : false;

      next.push({
        id: `f-${i}`,
        x: clamp01(anchor.x),
        y: clamp01(anchor.y),
        size: clamp01(eye),
        conf: 1,
        ts: Date.now(),
        ...(smile ? ({ smile: true } as any) : {})
      } as CrowdMember);
    }

    _latestCrowd = next;
    emitLatest();
  });
}

function setupHands(opts: Required<Omit<MediapipeOptions, 'faceDetectorModel'>> & Pick<MediapipeOptions, 'faceDetectorModel'>) {
  const HandsCtor = (window as any).Hands;
  if (!HandsCtor) {
    throw new Error('MediaPipe Hands constructor is unavailable');
  }
  _hands = new HandsCtor({
    locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}`
  }) as HandsLike;

  _hands.setOptions({
    maxNumHands: opts.topNHands,
    minDetectionConfidence: opts.handConfidenceThreshold,
    minTrackingConfidence: opts.handConfidenceThreshold,
    modelComplexity: opts.handsModelComplexity
  });

  _hands.onResults((results: any) => {
    const hands = Array.isArray(results?.multiHandLandmarks) ? results.multiHandLandmarks : [];
    const next: InteractionPoint[] = [];

    for (let i = 0; i < Math.min(hands.length, opts.topNHands); i++) {
      const lm = hands[i];
      const indexTip = lm?.[8];
      const thumbTip = lm?.[4];
      if (!indexTip || !thumbTip) continue;

      const mx = clamp01((indexTip.x + thumbTip.x) * 0.5);
      const my = clamp01((indexTip.y + thumbTip.y) * 0.5);
      const dx = indexTip.x - thumbTip.x;
      const dy = indexTip.y - thumbTip.y;
      const pinchDist = Math.hypot(dx, dy);
      const pinched = pinchDist < PINCH_THRESHOLD_NORM;

      if (!pinched) continue;
      next.push({
        id: `h-${i}`,
        x: mx,
        y: my,
        score: Math.max(0.05, 1 - pinchDist / PINCH_THRESHOLD_NORM),
        ts: Date.now()
      });
    }

    _latestInteractions = next;
    emitLatest();
  });
}

async function ensureModels(opts: Required<Omit<MediapipeOptions, 'faceDetectorModel'>> & Pick<MediapipeOptions, 'faceDetectorModel'>) {
  if (!_faceMesh) setupFaceMesh(opts);
  if (!_hands) setupHands(opts);

  try {
    if (_faceMesh?.initialize) await _faceMesh.initialize();
  } catch (e) {
    console.warn('FaceMesh initialize warning:', e);
  }

  try {
    if (_hands?.initialize) await _hands.initialize();
  } catch (e) {
    console.warn('Hands initialize warning:', e);
  }
}

async function ensureVideoReady(videoEl: HTMLVideoElement) {
  videoEl.autoplay = true;
  videoEl.muted = true;
  videoEl.playsInline = true;

  if (!(videoEl.srcObject instanceof MediaStream)) {
    _stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false
    });
    videoEl.srcObject = _stream;
  } else {
    _stream = videoEl.srcObject;
  }

  if (videoEl.readyState < 2) {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        videoEl.removeEventListener('loadedmetadata', onReady);
        resolve();
      };
      videoEl.addEventListener('loadedmetadata', onReady);
    });
  }

  try {
    await videoEl.play();
  } catch {
    // Some browsers require gesture; keep silent and continue.
  }
}

function loop(ts: number) {
  if (!_running) return;
  _rafId = requestAnimationFrame(loop);

  if (_processing || !_videoEl || _videoEl.readyState < 2) return;

  const minHz = mergedOptions().minProcessingHz;
  if (minHz > 0) {
    const minDelta = 1000 / minHz;
    if (ts - _lastProcessedAt < minDelta) return;
  }
  _lastProcessedAt = ts;

  _processing = true;
  const useFace = !!_faceMesh && ((_frameCounter & 1) === 0 || !_hands);
  const task = useFace
    ? _faceMesh?.send({ image: _videoEl })
    : _hands?.send({ image: _videoEl });

  Promise.resolve(task)
    .catch(() => {
      // Drop occasional inference errors without breaking loop.
    })
    .finally(() => {
      _frameCounter++;
      _processing = false;
    });
}

export async function init(options?: MediapipeOptions) {
  if (!browser) return;
  _baseOpts = { ..._baseOpts, ...(options || {}) };
  if (_inited) return;

  await ensureScriptsLoaded();
  _inited = true;
}

export async function start(
  videoEl: HTMLVideoElement,
  onCrowdUpdate: (c: CrowdMember[]) => void,
  onInteractionsUpdate: (a: InteractionPoint[]) => void,
  opts?: MediapipeOptions
) {
  if (!browser) return;

  _onCrowdUpdate = onCrowdUpdate;
  _onInteractionsUpdate = onInteractionsUpdate;

  await init(opts);
  const merged = mergedOptions(opts);

  _videoEl = videoEl;
  await ensureVideoReady(_videoEl);
  await ensureModels(merged);

  _running = true;
  _processing = false;
  _frameCounter = 0;
  _lastProcessedAt = 0;
  if (_rafId) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(loop);
}

export function stop() {
  _running = false;
  _processing = false;

  if (_rafId) {
    cancelAnimationFrame(_rafId);
    _rafId = 0;
  }

  _latestCrowd = [];
  _latestInteractions = [];
  emitLatest();

  if (_stream) {
    for (const t of _stream.getTracks()) t.stop();
    _stream = null;
  }

  if (_videoEl) {
    _videoEl.pause();
    _videoEl.srcObject = null;
  }
}
