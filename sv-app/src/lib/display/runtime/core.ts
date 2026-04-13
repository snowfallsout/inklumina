import { HAND_CONNECTIONS } from '$lib/display/constants';
import { spawnMBTI as particleSpawnMBTI, seedAmbient as particleSeedAmbient } from './particle';
import { mapToCanvas as drawMapToCanvas, drawVideoLayer } from './draw';
import {
    tickDrawMode as gestureTickDrawMode,
    drawStrokeOverlay as gestureDrawStrokeOverlay,
    tickSmileEmoji as gestureTickSmileEmoji,
    updateEmotionBadge as gestureUpdateEmotionBadge
} from './gesture';

type Point = { x: number; y: number };
type FacePoint = Point & { smile: boolean };

type RuntimeState = {
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    video: HTMLVideoElement | null;
    W: number;
    H: number;
    faces: FacePoint[];
    emotion: 'neutral' | 'smile';
    handsResults: { multiHandLandmarks?: Array<Array<{ x: number; y: number }>> } | null;
    activePinchPoints: Point[];
    processing: boolean;
    frameCounter: number;
    camOn: boolean;
    emojiEl: HTMLDivElement | null;
    wasAnySmiling: boolean;
    spriteSetCache: Map<string, unknown>;
    particles: any[];
    mbtiParticles: Record<string, any[]>;
    faceMesh: any | null;
    hands: any | null;
    socket: unknown | null;
    drawMode: {
        phase: 'idle' | 'gathering' | 'drawing' | 'dissolving';
        strokePath: Array<{ x: number; y: number; t: number }>;
        gatherTimer: number;
        dissolveTimer: number;
    };
    socketBound: boolean;
};

export const state: RuntimeState = {
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

export function mapToCanvas(normX: number, normY: number): Point {
    return drawMapToCanvas(state as any, normX, normY);
}

export function updateEmotionBadge(): void {
    gestureUpdateEmotionBadge(state as any);
}

export function tickSmileEmoji(): void {
    gestureTickSmileEmoji(state as any);
}

export function tickDrawMode(): void {
    gestureTickDrawMode(state as any);
}

function drawStrokeOverlay(): void {
    gestureDrawStrokeOverlay(state as any);
}

export function spawnMBTI(mbti: string, color: string): void {
    particleSpawnMBTI(state as any, mbti, color);
}

export function seedAmbient(count: number): void {
    particleSeedAmbient(state as any, count);
}

export function drawFrame(): void {
    const ctx = state.ctx;
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(245, 248, 255, 1)';
    ctx.fillRect(0, 0, state.W, state.H);

    drawVideoLayer(state as any);

    tickDrawMode();
    for (const particle of state.particles) {
        particle.update(state.faces, state.emotion);
        particle.draw(ctx);
    }
    drawStrokeOverlay();
    tickSmileEmoji();

    if (state.handsResults && state.handsResults.multiHandLandmarks) {
        for (const landmarks of state.handsResults.multiHandLandmarks) {
            const points = landmarks.map((point: any) => mapToCanvas(point.x, point.y));
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
