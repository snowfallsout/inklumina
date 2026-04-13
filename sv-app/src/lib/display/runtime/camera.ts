import { mapToCanvas, updateEmotionBadge, state } from './core';
import type { DisplayLegacyWindow } from './legacy';
import { attachFaceMeshHandlers, attachHandsHandlers } from './mediapipe';
import { setNoCameraBadge, setCameraReady, logCameraUnavailable } from './camera.ui';

export async function processFrame(): Promise<void> {
    requestAnimationFrame(() => {
        void processFrame();
    });
    if (!state.processing || !state.video || state.video.readyState < 2) return;
    state.frameCounter++;
    try {
        if (state.faceMesh && state.frameCounter % 2 === 0) {
            await state.faceMesh.send({ image: state.video });
        } else if (state.hands) {
            await state.hands.send({ image: state.video });
        }
    } catch (error) {
        void error;
    }
}

export function setupCamera(): void {
    if (!navigator.mediaDevices?.getUserMedia) {
        setNoCameraBadge();
        return;
    }

    void navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
        .then((stream) => {
            if (!state.video) return;
            state.video.srcObject = stream;
            state.video.onloadedmetadata = async () => {
                await state.video?.play();
                setCameraReady(state.video);
                const legacyWindow = window as DisplayLegacyWindow;
                if (legacyWindow.FaceMesh) {
                    state.faceMesh = new legacyWindow.FaceMesh({
                        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
                    });
                    state.faceMesh.setOptions({
                        maxNumFaces: 6,
                        refineLandmarks: false,
                        minDetectionConfidence: 0.5,
                        minTrackingConfidence: 0.5
                    });
                    attachFaceMeshHandlers(state.faceMesh);
                }
                if (legacyWindow.Hands) {
                    state.hands = new legacyWindow.Hands({
                        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`
                    });
                    state.hands.setOptions({
                        maxNumHands: 2,
                        minDetectionConfidence: 0.7,
                        minTrackingConfidence: 0.6,
                        modelComplexity: 1
                    });
                    attachHandsHandlers(state.hands);
                }
                state.processing = true;
            };
        })
        .catch((error: Error) => {
            logCameraUnavailable(error.message);
        });
}
