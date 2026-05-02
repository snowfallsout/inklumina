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

export {};
