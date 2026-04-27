// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	function $state<T>(initial: T): T;
	function $derived<T>(fn: () => T): T;
	function $effect(fn: () => void): void;
	function $props(): any;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '$app/environment' {
	export const browser: boolean;
}

declare module '$lib/config/settings' {
	const settings: any;
	export default settings;
}

declare module '$lib/services/mediapipe' {
	const mediapipe: any;
	export default mediapipe;
}

declare module '$lib/utils/faceHash' {
	export function faceHash(x: number, y: number): string;
	export const SMILE_EMOJIS: string[];
	export function pickRandomEmoji(): string;
	const utils: {
		faceHash: typeof faceHash;
		SMILE_EMOJIS: typeof SMILE_EMOJIS;
		pickRandomEmoji: typeof pickRandomEmoji;
	};
	export default utils;
}

declare module '$lib/runes/particles.svelte' {
	export type RuneSpawnEvent = import('$lib/runes/particles.svelte').SpawnEvent;
	export function pushSpawn(e: RuneSpawnEvent): void;
	export function popSpawn(): RuneSpawnEvent | undefined;
	export function seedAmbient(n?: number): void;
}

declare module '$lib/runes/ui.svelte' {
	export type UIState = typeof import('$lib/runes/ui.svelte').ui;
	export function showToast(msg: string, color?: string): void;
	export function setHandBadge(text: string): void;
	export function setWaitingVisible(visible: boolean): void;
}

declare module '$lib/runes/media.svelte' {
	export type RuneCrowdMember = import('$lib/runes/media.svelte').CrowdMember;
	export type RuneInteractionPoint = import('$lib/runes/media.svelte').InteractionPoint;
	export function initCamera(): Promise<void>;
	export function stopCamera(): void;
	export function setCrowd(m: RuneCrowdMember[]): void;
	export function setActiveInteractions(a: RuneInteractionPoint[]): void;
	export function clearAllSensors(): void;
}

declare module '$lib/runes/mbti.svelte' {
	export type MBTIState = typeof import('$lib/runes/mbti.svelte').mbti;
	export function getTotal(): number;
	export function updateCounts(counts: Record<string, number>): void;
	export function spawn(mbti: string, color?: string, nickname?: string, counts?: Record<string, number>, totalNum?: number): void;
}

declare module '$lib/runes/session.svelte' {
	export type SessionState = typeof import('$lib/runes/session.svelte').session;
	export function loadHistory(): Promise<void>;
	export function createSession(name?: string): Promise<void>;
	export function getJoinUrl(name?: string): string;
	export function deleteSession(id: string): void;
	export function viewSession(id: string): void;
	export function clearHistory(): void;
	export function setSessionName(name: string | null): void;
	export function setPanelOpen(open: boolean): void;
}

declare module '$lib/runes/smile.svelte' {
	export type SmileState = typeof import('$lib/runes/smile.svelte').smile;
	export function start(): void;
	export function stop(): void;
	export function registerElement(el: HTMLDivElement): void;
	export function unregisterElement(): void;
}

export {};
