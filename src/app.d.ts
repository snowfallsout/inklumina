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
	export function pushSpawn(e: any): void;
	export function popSpawn(): any;
	export function seedAmbient(n?: number): void;
}

declare module '$lib/runes/ui.svelte' {
	export const ui: any;
	export function showToast(msg: string, color?: string): void;
	export function setHandBadge(text: string): void;
	export function setWaitingVisible(visible: boolean): void;
}

declare module '$lib/runes/media.svelte' {
	export const media: any;
	export const CROWD_CAP: number;
	export const ACTIVE_CAP: number;
	export function initCamera(): Promise<void>;
	export function stopCamera(): void;
	export function setCrowd(m: any): void;
	export function setActiveInteractions(a: any): void;
	export function clearAllSensors(): void;
}

declare module '$lib/runes/mbti.svelte' {
	export const mbti: any;
	export function getTotal(): number;
	export function updateCounts(counts: any): void;
	export function spawn(mbti: string, color?: string, nickname?: string, counts?: any, totalNum?: number): void;
}

declare module '$lib/runes/session.svelte' {
	export const session: any;
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
	export const smile: any;
	export function start(): void;
	export function stop(): void;
	export function registerElement(el: HTMLDivElement): void;
	export function unregisterElement(): void;
}

export {};
