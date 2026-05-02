/*
 * src/lib/services/display/mediapipe.ts
 * Purpose: Camera-service helper for attaching MediaPipe result handlers to the shared runtime state.
 */
import { mapToCanvas, updateEmotionBadge, state } from '$lib/function/runtime/core';
import type { RuntimeDetector, RuntimeHandsResults } from '$lib/services/display/types';

type FaceResults = { multiFaceLandmarks?: Array<Array<{ x: number; y: number }>> };

export function attachFaceMeshHandlers(faceMesh: RuntimeDetector): void {
	faceMesh.onResults?.((results: unknown) => {
		const typedResults = results as FaceResults;
		state.faces = [];
		let smilingCount = 0;
		if (typedResults.multiFaceLandmarks) {
			for (const landmarks of typedResults.multiFaceLandmarks) {
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

export function attachHandsHandlers(hands: RuntimeDetector): void {
	hands.onResults?.((results: unknown) => {
		const typedResults = results as RuntimeHandsResults;
		state.handsResults = typedResults;
		state.activePinchPoints = [];
		const badge = document.getElementById('hand-badge');
		if (!typedResults?.multiHandLandmarks || typedResults.multiHandLandmarks.length === 0) {
			if (badge) badge.textContent = '✋ NO HAND';
			return;
		}
		const parts = [`✋ ${typedResults.multiHandLandmarks.length}H`];
		for (const landmarks of typedResults.multiHandLandmarks) {
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