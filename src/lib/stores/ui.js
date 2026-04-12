import { writable } from 'svelte/store';

export const toast = writable(null); // { msg, color }
export const session = writable(null);

export function showToast(msg, color){ toast.set({ msg, color }); setTimeout(()=>toast.set(null), 3000); }
