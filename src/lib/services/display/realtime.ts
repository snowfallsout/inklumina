/*
 * src/lib/services/display/realtime.ts
 * Purpose: Canonical display-service owner for realtime socket binding and session reset synchronization.
 */
import type {
	DisplayStatePayload,
	LuckyColorPayload,
	SessionResetPayload,
	SpawnParticlesPayload
} from '$lib/shared/contracts';
import { createColorfieldSocket, type ColorfieldSocket } from '$lib/shared/socket-client';
import { displayState } from '$lib/state/display.svelte';
import {
	registerDisplayLegacyBridge,
	setSessionName,
	startDisplayLegacyRuntime,
	syncLegacyBridge
} from '$lib/services/display/legacy';
import type { DisplayLegacyWindow } from '$lib/services/display/legacy';
import { spawnMBTI, state } from '$lib/function/runtime/core';

// Bind the shared display socket once and fan payloads into state/runtime owners.
export function bindRealtimeSocket(): void {
	if (!state.socket) {
		state.socket = createColorfieldSocket();
	}

	if (state.socketBound) {
		return;
	}

	state.socketBound = true;
	const socket = state.socket as ColorfieldSocket;
	socket.on('state', (payload: DisplayStatePayload) => {
		displayState.applySocketState(payload);
		if (payload.session) {
			setSessionName(payload.session.name);
		}
	});
	socket.on('spawn_particles', (payload: SpawnParticlesPayload) => {
		displayState.applySpawnParticles(payload);
		spawnMBTI(payload.mbti, payload.color);
		if (payload.session) {
			setSessionName(payload.session.name);
		}
	});
	socket.on('session_reset', (payload: SessionResetPayload) => {
		const keepAmbient = state.particles.filter((particle) => particle.mbti === null);
		state.particles.splice(0, state.particles.length, ...keepAmbient);
		for (const key of Object.keys(state.mbtiParticles) as Array<keyof typeof state.mbtiParticles>) {
			delete state.mbtiParticles[key];
		}
		displayState.applySessionReset(payload);
		setSessionName(payload.session.name);
		const legacyWindow = window as DisplayLegacyWindow;
		const counts = legacyWindow.mbtiCounts ?? {};
		for (const key of Object.keys(counts)) delete counts[key];
		legacyWindow.mbtiCounts = counts;
		legacyWindow.renderLegend?.();
	});
	socket.on('lucky_color', (_payload: LuckyColorPayload) => {
		// display does not currently render the lucky-color payload directly.
	});
	socket.on('disconnect', () => {
		void 0;
	});
}

export { syncLegacyBridge, registerDisplayLegacyBridge, startDisplayLegacyRuntime };