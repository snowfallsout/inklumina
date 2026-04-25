import { pushSpawn } from '$lib/runes/particles.svelte';

export let mbtiCounts = $state<Record<string, number>>({});
export const total = $derived(() => Object.values(mbtiCounts).reduce((a, b) => a + (b || 0), 0));

export function updateCounts(counts: Record<string, number>) {
  mbtiCounts = { ...counts };
}

export function spawn(mbti: string, color?: string, nickname?: string, counts?: Record<string, number>, totalNum?: number) {
  pushSpawn({ mbti, color, nickname, counts, total: totalNum });
}
