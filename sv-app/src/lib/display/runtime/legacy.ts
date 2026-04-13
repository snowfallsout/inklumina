import { displayState } from '$lib/display/state';
import { seedAmbient } from './core';

export type DisplayLegacyWindow = Window & typeof globalThis & {
    mbtiCounts?: Record<string, number>;
    renderLegend?: () => void;
    setSessionName?: (name: string) => void;
    seedAmbient?: (count: number) => void;
    _processFrame?: () => void;
    setupCamera?: () => void;
    loop?: () => void;
    __displayRuntimeStarted?: boolean;
    FaceMesh?: new (options: { locateFile: (file: string) => string }) => any;
    Hands?: new (options: { locateFile: (file: string) => string }) => any;
};

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

export function setSessionName(name: string): void {
    const element = document.getElementById('session-name');
    if (!element) return;
    element.textContent = name ? `— ${name} —` : '';
}

export function syncLegacyBridge(): void {
    const legacyWindow = window as DisplayLegacyWindow;
    legacyWindow.renderLegend = () => {
        const counts = legacyWindow.mbtiCounts ?? {};
        updateLegendFromCounts(counts);
    };
    legacyWindow.setSessionName = (name: string) => setSessionName(name);
    legacyWindow.seedAmbient = seedAmbient as any;
    legacyWindow._processFrame = () => void 0; // will be assigned by runtime bridge
    legacyWindow.setupCamera = () => void 0;
    legacyWindow.loop = () => void 0;
    legacyWindow.mbtiCounts = legacyWindow.mbtiCounts ?? {};
}

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

export function startDisplayLegacyRuntime(): void {
    const legacyWindow = window as DisplayLegacyWindow;
    if (legacyWindow.__displayRuntimeStarted) {
        return;
    }
    legacyWindow.__displayRuntimeStarted = true;
    legacyWindow.seedAmbient?.(25 as any);
    if (typeof legacyWindow._processFrame === 'function') {
        requestAnimationFrame(legacyWindow._processFrame as any);
    }
    legacyWindow.setupCamera?.();
    legacyWindow.loop?.();
}
