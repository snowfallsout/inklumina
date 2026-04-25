/*
  ml-camera.ts
  說明：攝影機與 MediaPipe 相關初始化、座標映射、推理節流。
*/
import { updateEmotionBadge } from './emotion';

export type FaceInfo = { x: number; y: number; smile: boolean };

export let faces: FaceInfo[] = [];
export let emotion: 'neutral' | 'smile' = 'neutral';
// `video` element is client-only. Avoid accessing `document` at module load
// time to remain SSR-safe. Use `setVideo()` to register the element from
// a client component (e.g. `Canvas.svelte`).
let video: HTMLVideoElement | null = null;
export function setVideo(el: HTMLVideoElement | null) { video = el; }
export function getVideo(): HTMLVideoElement | null { return video; }

export let _faceMesh: any = null; export let _hands: any = null;
export let handsResults: any = null; export let activePinchPoints: { x:number; y:number }[] = [];

let _processing = false; let _frameCounter = 0;

export async function _processFrame(): Promise<void> {
  requestAnimationFrame(_processFrame as any);
  if (!_processing || !video || video.readyState < 2) return;
  _frameCounter++;
  try {
    if (_faceMesh && (_frameCounter & 1) === 0) { await _faceMesh.send({ image: video }); }
    else if (_hands) { await _hands.send({ image: video }); }
  } catch (e) { /* swallow occasional frame errors */ }
}

export function mapToCanvas(normX: number, normY: number): { x: number; y: number } {
  const v = video;
  if (!v || v.videoWidth === 0) return { x: 0, y: 0 };
  const W = window.innerWidth, H = window.innerHeight;
  const scale = Math.max(W / v.videoWidth, H / v.videoHeight);
  const dw = v.videoWidth * scale; const dh = v.videoHeight * scale; const dx = (W - dw) / 2; const dy = (H - dh) / 2;
  return { x: dx + (1 - normX) * dw, y: dy + normY * dh };
}

export function setupCamera(videoEl?: HTMLVideoElement | null): void {
  if (typeof window === 'undefined') return;
  if (!navigator.mediaDevices) return;
  // allow caller to provide the video element (preferred), otherwise
  // fall back to querying the DOM for `video-bg`.
  if (videoEl) setVideo(videoEl);
  if (!video) video = (document.getElementById('video-bg') as HTMLVideoElement | null);
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
    .then(stream => {
      if (!video) return;
      video.srcObject = stream as MediaStream;
      video.onloadedmetadata = async () => {
        try { if (video) await video.play(); } catch (e) {}
        if (video) video.classList.add('ready');
        _initFaceMesh(); _initHands();
        try { if (_faceMesh && _faceMesh.initialize) await _faceMesh.initialize(); if (_hands && _hands.initialize) await _hands.initialize(); } catch(e) { console.warn('AI Engine Init Error:', e); }
        _processing = true;
      };
    })
    .catch(err => { console.warn('Camera unavailable:', err && (err as Error).message); });
}

export function _initFaceMesh(): void {
  // FaceMesh may be provided globally by the media-pipe bundle
  if (typeof (globalThis as any).FaceMesh === 'undefined') return;
  const FaceMesh: any = (globalThis as any).FaceMesh;
  _faceMesh = new FaceMesh({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}` });
  _faceMesh.setOptions({ maxNumFaces: 6, refineLandmarks: false, minDetectionConfidence: .5, minTrackingConfidence: .5 });
  _faceMesh.onResults((results: any) => {
    faces = []; let smiles = 0;
    if (results.multiFaceLandmarks) {
      for (const lm of results.multiFaceLandmarks) {
        const pt = mapToCanvas(lm[168].x, lm[168].y);
        const mw = Math.abs(lm[291].x - lm[61].x); const ew = Math.abs(lm[263].x - lm[33].x);
        const smile = ew > 0 && (mw / ew) > .57; if (smile) smiles++;
        faces.push({ x: pt.x, y: pt.y, smile });
      }
    }
    emotion = (smiles > faces.length * .5 && faces.length > 0) ? 'smile' : 'neutral';
    try { updateEmotionBadge(faces, emotion); } catch (e) {}
  });
}

export function _initHands(): void {
  if (typeof (globalThis as any).Hands === 'undefined') { console.warn('MediaPipe Hands library not loaded'); return; }
  const Hands: any = (globalThis as any).Hands;
  _hands = new Hands({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}` });
  _hands.setOptions({ maxNumHands: 2, minDetectionConfidence: 0.7, minTrackingConfidence: 0.6, modelComplexity: 0 });
  _hands.onResults((res: any) => {
    handsResults = res; activePinchPoints = [];
    if (!res.multiHandLandmarks || res.multiHandLandmarks.length === 0) return;
    for (const lm of res.multiHandLandmarks) {
      const indexTip  = mapToCanvas(lm[8].x, lm[8].y); const thumbTip  = mapToCanvas(lm[4].x, lm[4].y);
      const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y); const pinched = pinchDist < 60;
      if (pinched) activePinchPoints.push({ x: (indexTip.x + thumbTip.x) / 2, y: (indexTip.y + thumbTip.y) / 2 });
    }
  });
}
