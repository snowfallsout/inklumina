import { mapToCanvas, updateEmotionBadge, state } from './core';

type FaceResults = { multiFaceLandmarks?: Array<Array<{ x: number; y: number }>> };
type HandsResults = { multiHandLandmarks?: Array<Array<{ x: number; y: number }>> };

export function attachFaceMeshHandlers(faceMesh: any): void {
    faceMesh.onResults((results: FaceResults) => {
        state.faces = [];
        let smilingCount = 0;
        if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
                const facePoint = landmarks[168];
                const mouthWidth = Math.abs(landmarks[291].x - landmarks[61].x);
                const eyeWidth = Math.abs(landmarks[263].x - landmarks[33].x);
                const smile = eyeWidth > 0 && mouthWidth / eyeWidth > 0.57;
                if (smile) smilingCount++;
                const point = mapToCanvas(facePoint.x, facePoint.y);
                state.faces.push({ x: point.x, y: point.y, smile });
            }
        }
        state.emotion = smilingCount > state.faces.length * 0.5 && state.faces.length > 0 ? 'smile' : 'neutral';
        updateEmotionBadge();
    });
}

export function attachHandsHandlers(hands: any): void {
    hands.onResults((results: HandsResults) => {
        state.handsResults = results;
        state.activePinchPoints = [];
        const badge = document.getElementById('hand-badge');
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            if (badge) badge.textContent = '✋ NO HAND';
            return;
        }
        const parts = [`✋ ${results.multiHandLandmarks.length}H`];
        for (const landmarks of results.multiHandLandmarks) {
            const indexTip = mapToCanvas(landmarks[8].x, landmarks[8].y);
            const thumbTip = mapToCanvas(landmarks[4].x, landmarks[4].y);
            const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
            const pinched = pinchDistance < 60;
            parts.push(`${Math.round(pinchDistance)}px${pinched ? '🤌' : ''}`);
            if (pinched) {
                state.activePinchPoints.push({
                    x: (indexTip.x + thumbTip.x) / 2,
                    y: (indexTip.y + thumbTip.y) / 2
                });
            }
        }
        if (badge) badge.textContent = parts.join(' | ');
    });
}
