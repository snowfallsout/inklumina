/*
 * src/lib/services/display/legacy.ts
 * Purpose: Canonical display-service owner for legacy window bridge helpers used by the runtime.
 */
import { displayState } from '$lib/state/display.svelte';
import { seedAmbient } from '$lib/function/runtime/core';
import type { RuntimeConstructor, RuntimeDetector } from '$lib/services/display/types';

export type DisplayLegacyWindow = Window & typeof globalThis & {
	mbtiCounts?: Record<string, number>;
	renderLegend?: () => void;
	setSessionName?: (name: string) => void;
	seedAmbient?: (count: number) => void;
	_processFrame?: () => void;
	setupCamera?: () => void;
	loop?: () => void;
	__displayRuntimeStarted?: boolean;
	FaceMesh?: RuntimeConstructor<RuntimeDetector>;
	Hands?: RuntimeConstructor<RuntimeDetector>;
};

// Sync the legacy static DOM legend with the current MBTI counts snapshot.
export function updateLegendFromCounts(counts: Record<string, number>): void {
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
	const totalElement = document.getElementById('total-num');
	if (totalElement) totalElement.textContent = `${total}`;
	for (const key of Object.keys(counts)) {
		const count = counts[key] || 0;
		const percent = total > 0 ? (count / total) * 100 : 0;
		document.getElementById(`r-${key}`)?.classList.toggle('on', count > 0);
		const fill = document.getElementById(`f-${key}`) as HTMLDivElement | null;
		const countElement = document.getElementById(`c-${key}`);
		if (fill) fill.style.width = `${percent}%`;
		if (countElement) countElement.textContent = `${count}`;
	}
}

// Mirror the active session name into the legacy display header area.
export function setSessionName(name: string): void {
	const element = document.getElementById('session-name');
	if (!element) return;
	element.textContent = name ? `— ${name} —` : '';
}

// Attach no-op globals and DOM updaters expected by legacy runtime code paths.
export function syncLegacyBridge(): void {
	const legacyWindow = window as DisplayLegacyWindow;
	legacyWindow.renderLegend = () => {
		const counts = legacyWindow.mbtiCounts ?? {};
		updateLegendFromCounts(counts);
	};
	legacyWindow.setSessionName = (name: string) => setSessionName(name);
	legacyWindow.seedAmbient = seedAmbient;
	legacyWindow._processFrame = async () => void 0;
	legacyWindow.setupCamera = () => void 0;
	legacyWindow.loop = () => void 0;
	legacyWindow.mbtiCounts = legacyWindow.mbtiCounts ?? {};
}

// Rebind legacy session name updates so they flow through the Svelte display state owner.
export function registerDisplayLegacyBridge(): void {
	const legacyWindow = window as DisplayLegacyWindow;

	legacyWindow.renderLegend = () => {
		const counts = legacyWindow.mbtiCounts ?? {};
		updateLegendFromCounts(counts);
	};

	legacyWindow.setSessionName = (name: string) => {
		displayState.setSessionName(name ? `— ${name} —` : '');
	};
}

// Kick off the legacy requestAnimationFrame/camera loop once per page lifetime.
export function startDisplayLegacyRuntime(): void {
	const legacyWindow = window as DisplayLegacyWindow;
	if (legacyWindow.__displayRuntimeStarted) {
		return;
	}
	legacyWindow.__displayRuntimeStarted = true;
	legacyWindow.seedAmbient?.(25);
	if (typeof legacyWindow._processFrame === 'function') {
		requestAnimationFrame(legacyWindow._processFrame);
	}
	legacyWindow.setupCamera?.();
	legacyWindow.loop?.();
}