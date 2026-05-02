import { HAND_CONNECTIONS } from '$lib/shared/constants/vision';
import { spawnMBTI as particleSpawnMBTI, seedAmbient as particleSeedAmbient } from './particle';
import { mapToCanvas as drawMapToCanvas } from './draw';
import {
	tickDrawMode as gestureTickDrawMode,
	drawStrokeOverlay as gestureDrawStrokeOverlay,
	tickSmileEmoji as gestureTickSmileEmoji,
	updateEmotionBadge as gestureUpdateEmotionBadge
} from './gesture';
import type { RuntimeHandLandmark, RuntimePoint, RuntimeRuntimeState } from '$lib/services/display/types';

export const state: RuntimeRuntimeState = {
	canvas: null,
	ctx: null,
	video: null,
	W: 0,
	H: 0,
	faces: [],
	emotion: 'neutral',
	handsResults: null,
	activePinchPoints: [],
	processing: false,
	frameCounter: 0,
	camOn: false,
	emojiEl: null,
	wasAnySmiling: false,
	spriteSetCache: new Map(),
	particles: [],
	mbtiParticles: {},
	faceMesh: null,
	hands: null,
	socket: null,
	drawMode: { phase: 'idle', strokePath: [], gatherTimer: 0, dissolveTimer: 0 },
	socketBound: false
};

export function mapToCanvas(normX: number, normY: number): RuntimePoint {
	return drawMapToCanvas(state, normX, normY);
}

export function updateEmotionBadge(): void {
	gestureUpdateEmotionBadge(state);
}

export function tickSmileEmoji(): void {
	gestureTickSmileEmoji(state);
}

export function tickDrawMode(): void {
	gestureTickDrawMode(state);
}

function drawStrokeOverlay(): void {
	gestureDrawStrokeOverlay(state);
}

export function spawnMBTI(mbti: string, color: string): void {
	particleSpawnMBTI(state, mbti, color);
}

export function seedAmbient(count: number): void {
	particleSeedAmbient(state, count);
}

export function drawFrame(): void {
	const ctx = state.ctx;
	if (!ctx) return;
	ctx.globalCompositeOperation = 'source-over';
	ctx.clearRect(0, 0, state.W, state.H);

	tickDrawMode();
	for (const particle of state.particles) {
		particle.update(state.faces, state.emotion);
		particle.draw(ctx);
	}
	drawStrokeOverlay();
	tickSmileEmoji();

	if (state.handsResults && state.handsResults.multiHandLandmarks) {
		for (const landmarks of state.handsResults.multiHandLandmarks) {
			const points = landmarks.map((point: RuntimeHandLandmark) => mapToCanvas(point.x, point.y));
			ctx.beginPath();
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
			ctx.lineWidth = 1.5;
			for (const [from, to] of HAND_CONNECTIONS) {
				ctx.moveTo(points[from].x, points[from].y);
				ctx.lineTo(points[to].x, points[to].y);
			}
			ctx.stroke();

			ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
			for (const point of points) {
				ctx.beginPath();
				ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
				ctx.fill();
			}

			for (const pinchPoint of state.activePinchPoints) {
				ctx.beginPath();
				ctx.arc(pinchPoint.x, pinchPoint.y, 14, 0, Math.PI * 2);
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(pinchPoint.x, pinchPoint.y, 4, 0, Math.PI * 2);
				ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
				ctx.fill();
			}
		}
		ctx.globalAlpha = 1;
	}
}
