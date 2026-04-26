/*
 * src/lib/runes/mbti.svelte.ts
 * Purpose: Track MBTI counts and emit particle spawn events for display.
 */
// @ts-nocheck
import { pushSpawn } from '$lib/runes/particles.svelte';

// Reactive MBTI count state
export const mbti = $state({
  counts: {} as Record<string, number>
});

export function getTotal() {
	return Object.values(mbti.counts).reduce((a, b) => a + (b || 0), 0);
}

export function updateCounts(counts: Record<string, number>) {
  mbti.counts = { ...counts };
}

export function spawn(mbti: string, color?: string, nickname?: string, counts?: Record<string, number>, totalNum?: number) {
  pushSpawn({ mbti, color, nickname, counts, total: totalNum });
}
