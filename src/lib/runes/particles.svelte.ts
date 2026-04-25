import mbtiConfig from '$lib/config/mbti';

export type SpawnEvent = { mbti: string; color?: string; nickname?: string; counts?: Record<string, number>; total?: number; ts?: number };

export let spawnQueue = $state<SpawnEvent[]>([]);

const QUEUE_CAP = 500;

export function pushSpawn(e: SpawnEvent) {
  const q = [...spawnQueue];
  if (q.length >= QUEUE_CAP) q.shift();
  const mbtiKey = (e?.mbti || '').toUpperCase();
  let color = e.color;
  if (mbtiKey && mbtiKey !== '__SEED' && !color) {
    const palette = mbtiConfig.MBTI_PALETTES?.[mbtiKey];
    color = palette ? (palette.mid || palette.core) : undefined;
  }
  q.push({ ...e, mbti: mbtiKey, color, ts: Date.now() });
  spawnQueue = q;
}

export function seedAmbient(n = 25) {
  pushSpawn({ mbti: '__seed', color: String(n), nickname: 'ambient', counts: {}, total: 0 });
}

export function popSpawn(): SpawnEvent | undefined {
  const q = [...spawnQueue];
  const ev = q.shift();
  spawnQueue = q;
  return ev;
}
