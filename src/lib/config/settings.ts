// @ts-nocheck
// Centralized runtime configuration (values).
// Type declarations are in `src/lib/types/index.d.ts`.

import type {
  Settings
} from '../types';

export const settings: Settings = {
  colors: {
    background: '#0b1020',
    primary: '#7dd3fc',
    accent: '#f472b6',
    particle: '#fffb8f',
    hand: '#34d399',
    uiMuted: '#94a3b8'
  },

  physics: {
    gravity: 0.0,
    drag: 0.05,
    particleMass: 1.0,
    particleSizeRange: [1.5, 6.0],
    spawnRate: 30,
    maxParticles: 1500,
    attractionStrength: 0.6,
    repulsionStrength: 0.8,
    timeStep: 1 / 60
  },

  mediapipe: {
    handConfidenceThreshold: 0.6,
    faceConfidenceThreshold: 0.6,
    smoothing: 0.75
  },

  canvas: {
    pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
    clearColor: '#0b1020'
  },

  socket: {
    url: undefined,
    reconnectIntervalMs: 3000
  }
};

export type { Settings } from '../types';

export default settings;
