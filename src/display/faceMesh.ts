import type { EmotionState, FacePoint } from './types';

declare const FaceMesh: new (options: { locateFile: (file: string) => string }) => FaceMeshLike;
declare const Camera: new (video: HTMLVideoElement, options: { onFrame: () => Promise<void> | void; width: number; height: number }) => CameraLike;

interface FaceMeshLike {
  setOptions(options: {
    maxNumFaces: number;
    refineLandmarks: boolean;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }): void;
  onResults(handler: (results: FaceMeshResults) => void): void;
  send(payload: { image: HTMLVideoElement }): Promise<void>;
}

interface CameraLike {
  start(): Promise<void>;
}

interface FaceMeshResults {
  multiFaceLandmarks?: Array<Array<{ x: number; y: number }>>;
}

export interface FaceTrackingOptions {
  onFaces: (faces: FacePoint[], emotion: EmotionState) => void;
  onReady?: () => void;
  onUnavailable?: (message: string) => void;
}

export function startFaceTracking(video: HTMLVideoElement, options: FaceTrackingOptions): void {
  navigator.mediaDevices
    .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        void video.play();
        video.classList.add('ready');
        options.onReady?.();
        void tryMediaPipe(video, options);
      };
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Camera unavailable:', message);
      options.onUnavailable?.(message);
    });
}

async function tryMediaPipe(video: HTMLVideoElement, options: FaceTrackingOptions): Promise<void> {
  if (typeof FaceMesh === 'undefined') {
    console.warn('MediaPipe FaceMesh not loaded');
    options.onUnavailable?.('MediaPipe FaceMesh not loaded');
    return;
  }

  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 6,
    refineLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults((results) => {
    const faces: FacePoint[] = [];
    let smileCount = 0;

    if (results.multiFaceLandmarks) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      for (const landmarks of results.multiFaceLandmarks) {
        const x = (1 - landmarks[168].x) * width;
        const y = landmarks[168].y * height;
        const mouthWidth = Math.abs(landmarks[291].x - landmarks[61].x);
        const eyeWidth = Math.abs(landmarks[263].x - landmarks[33].x);
        const smile = eyeWidth > 0 && mouthWidth / eyeWidth > 0.57;
        if (smile) {
          smileCount += 1;
        }
        faces.push({ x, y, smile });
      }
    }

    const emotion: EmotionState = smileCount > faces.length * 0.5 && faces.length > 0 ? 'smile' : 'neutral';
    options.onFaces(faces, emotion);
  });

  if (typeof Camera === 'undefined') {
    console.warn('MediaPipe Camera utils not loaded');
    options.onUnavailable?.('MediaPipe Camera utils not loaded');
    return;
  }

  const camera = new Camera(video, {
    onFrame: async () => {
      await faceMesh.send({ image: video });
    },
    width: 1280,
    height: 720,
  });

  camera.start().catch((error: unknown) => {
    console.warn('Camera utils error:', error);
  });
}
