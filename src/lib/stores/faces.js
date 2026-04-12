import { writable } from 'svelte/store';

// faces: array of { x, y, smile }
export const faces = writable([]);
export const activePinchPoints = writable([]);
export const emotion = writable('neutral');
