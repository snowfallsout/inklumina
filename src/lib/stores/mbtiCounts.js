import { writable } from 'svelte/store';

// map MBTI -> count
export const mbtiCounts = writable({});

export function setCounts(counts){ mbtiCounts.set(counts); }
export function updateCount(mbti, delta){
  mbtiCounts.update(cur => { cur[mbti] = (cur[mbti]||0) + delta; return cur; });
}
