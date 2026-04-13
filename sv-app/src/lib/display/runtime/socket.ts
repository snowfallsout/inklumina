import type { LuckyColorPayload, SessionResetPayload, SpawnParticlesPayload, DisplayStatePayload } from '$lib/shared/contracts';
import { createColorfieldSocket, type ColorfieldSocket } from '$lib/shared/socket-client';
import { displayState } from '$lib/display/state';
import { state } from './core';
import { spawnMBTI } from './core';
import { updateLegendFromCounts, setSessionName, syncLegacyBridge, registerDisplayLegacyBridge, startDisplayLegacyRuntime } from './legacy';

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
        spawnMBTI(payload.mbti as any, payload.color);
        if (payload.session) {
            setSessionName(payload.session.name);
        }
    });
    socket.on('session_reset', (payload: SessionResetPayload) => {
        const keepAmbient = state.particles.filter((particle: any) => particle.mbti === null);
        state.particles.splice(0, state.particles.length, ...keepAmbient);
        for (const key of Object.keys(state.mbtiParticles) as Array<keyof typeof state.mbtiParticles>) {
            delete state.mbtiParticles[key];
        }
        displayState.applySessionReset(payload);
        setSessionName(payload.session.name);
        const counts = (window as any).mbtiCounts ?? {};
        for (const key of Object.keys(counts)) delete counts[key];
        (window as any).mbtiCounts = counts;
        (window as any).renderLegend?.();
    });
    socket.on('lucky_color', (_payload: LuckyColorPayload) => {
        // display does not currently render the lucky-color payload directly.
    });
    socket.on('disconnect', () => {
        void 0;
    });
}
export { syncLegacyBridge, registerDisplayLegacyBridge, startDisplayLegacyRuntime };
