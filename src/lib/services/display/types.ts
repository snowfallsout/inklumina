/*
 * src/lib/services/display/types.ts
 * Purpose: Canonical display-service runtime type owner for the display particle/camera runtime.
 */
import type { ColorfieldSocket } from '$lib/shared/socket-client';

export type RuntimePoint = { x: number; y: number };

export type RuntimeFacePoint = RuntimePoint & { smile: boolean };

export type RuntimeHandLandmark = { x: number; y: number };

export type RuntimeHandsResults = {
	multiHandLandmarks?: RuntimeHandLandmark[][];
} | null;

export type RuntimeDrawMode = {
	phase: 'idle' | 'gathering' | 'drawing' | 'dissolving';
	strokePath: Array<{ x: number; y: number; t: number }>;
	gatherTimer: number;
	dissolveTimer: number;
};

export type RuntimeSpriteEntry = {
	canvas: HTMLCanvasElement;
	half: number;
	refR: number;
};

export type RuntimeSpriteSet = {
	dot: RuntimeSpriteEntry;
	blob: RuntimeSpriteEntry;
	field: RuntimeSpriteEntry;
};

export type RuntimeParticleSizeClass = 'dot' | 'blob' | 'field';

export type RuntimeParticleState = 'born' | 'free' | 'attracted' | 'swirling';

export interface RuntimeParticle {
	x: number;
	y: number;
	color: string;
	mbti: string | null;
	sizeClass: RuntimeParticleSizeClass;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	alphaT: number;
	state: RuntimeParticleState;
	age: number;
	trail: Array<{ x: number; y: number; s: number }>;
	myTrailMax: number;
	orbitA: number;
	orbitR: number;
	orbitSpd: number;
	targetF: RuntimeFacePoint | null;
	phaseOffset: number;
	_sprites: RuntimeSpriteSet;
	_drawTarget: RuntimePoint | null;
	update: (faces: RuntimeFacePoint[], emotion: RuntimeRuntimeState['emotion']) => void;
	draw: (ctx: CanvasRenderingContext2D) => void;
}

export type RuntimeParticleDraft = Omit<RuntimeParticle, 'update' | 'draw'>;

export interface RuntimeDetector {
	setOptions?: (options: Record<string, unknown>) => void;
	onResults?: (handler: (results: unknown) => void) => void;
	send?: (input: { image: HTMLVideoElement }) => Promise<void> | void;
	initialize?: () => Promise<void> | void;
}

export type RuntimeRuntimeState = {
	canvas: HTMLCanvasElement | null;
	ctx: CanvasRenderingContext2D | null;
	video: HTMLVideoElement | null;
	W: number;
	H: number;
	faces: RuntimeFacePoint[];
	emotion: 'neutral' | 'smile';
	handsResults: RuntimeHandsResults;
	activePinchPoints: RuntimePoint[];
	processing: boolean;
	frameCounter: number;
	camOn: boolean;
	emojiEl: HTMLDivElement | null;
	wasAnySmiling: boolean;
	spriteSetCache: Map<string, unknown>;
	particles: RuntimeParticle[];
	mbtiParticles: Record<string, RuntimeParticle[]>;
	faceMesh: RuntimeDetector | null;
	hands: RuntimeDetector | null;
	socket: ColorfieldSocket | null;
	drawMode: RuntimeDrawMode;
	socketBound: boolean;
};

export type RuntimeWindowFlags = Window & typeof globalThis & {
	__display_camera_fatal_shown?: boolean;
	__display_camera_alert_shown?: boolean;
	__display_faceMesh?: boolean;
	__display_hands?: boolean;
};

export interface RuntimeConstructor<TInstance> {
	new (options: { locateFile: (file: string) => string }): TInstance;
}

export interface RuntimeFactory<TInstance> {
	createFromOptions: (fileset: unknown, options: Record<string, unknown>) => Promise<TInstance>;
}

export interface TasksVisionModule {
	FilesetResolver?: {
		forVisionTasks: (basePath: string) => Promise<unknown>;
	};
	filesetResolver?: {
		forVisionTasks: (basePath: string) => Promise<unknown>;
	};
	FaceLandmarker?: RuntimeFactory<RuntimeDetector>;
	faceLandmarker?: { FaceLandmarker?: RuntimeFactory<RuntimeDetector> };
	HandLandmarker?: RuntimeFactory<RuntimeDetector>;
	handLandmarker?: { HandLandmarker?: RuntimeFactory<RuntimeDetector> };
}