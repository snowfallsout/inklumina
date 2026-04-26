/*
  pool.ts
  說明：粒子池管理（TypeScript 版）
  目的：將原本的 `pool.js` 行為搬入 TypeScript，並輸出與原來相容的 API。
  使用：其他模組可從此匯入 `particles`, `mbtiParticles`, `spawnMBTI`, `seedAmbient` 等。
*/
import { Particle } from './particle';
import { AMBIENT_COLS } from '../constants/mbti';
import { getDotSprite } from './sprites';

export type MBTICounts = Record<string, number>;

/** 所有存在中的粒子清單 */
export const particles: any[] = [];
/** 依 MBTI 分類的粒子索引 */
export const mbtiParticles: Record<string, any[]> = {};

export const MAX_MBTI_TOTAL = 800;
export const MIN_PER_TYPE = 20;
export const MAX_PER_TYPE = 120;
export const SPAWN_PER_JOIN = 12;

/**
 * 計算指定 MBTI 類型的配額。
 * @param mbti MBTI 類型
 * @param mbtiCounts 各 MBTI 類型當前的計數
 */
export function quotaForType(mbti: string, mbtiCounts: MBTICounts): number {
  const total = Object.values(mbtiCounts).reduce((a, b) => a + b, 0) || 1;
  const count = mbtiCounts[mbti] || 1;
  const raw = Math.floor((count / total) * MAX_MBTI_TOTAL);
  return Math.max(MIN_PER_TYPE, Math.min(MAX_PER_TYPE, raw));
}

/**
 * 根據配額裁剪指定 MBTI 類型的顆粒，從最舊的開始移除。
 */
export function pruneType(mbti: string, mbtiCounts: MBTICounts): void {
  const arr = mbtiParticles[mbti];
  if (!arr) return;
  const quota = quotaForType(mbti, mbtiCounts);
  while (arr.length > quota) {
    const p = arr.shift();
    const idx = particles.indexOf(p);
    if (idx !== -1) particles.splice(idx, 1);
  }
}

/**
 * 對所有 MBTI 類型執行 pruneType。
 */
export function pruneAllTypes(mbtiCounts: MBTICounts): void {
  for (const mbti of Object.keys(mbtiParticles)) pruneType(mbti, mbtiCounts);
}

/**
 * 當有人加入某 MBTI 時，從畫面中心噴發一批新顆粒。
 */
export function spawnMBTI(
  mbti: string,
  color: string,
  W: number = (typeof window !== 'undefined' ? window.innerWidth : 800),
  H: number = (typeof window !== 'undefined' ? window.innerHeight : 600),
  mbtiCounts: MBTICounts = {}
): void {
  if (!mbtiParticles[mbti]) mbtiParticles[mbti] = [];
  const bx = W / 2, by = H / 2;
  for (let i = 0; i < SPAWN_PER_JOIN; i++) {
    const p: any = new (Particle as any)(bx, by, color, mbti);
    p.vx = (Math.random() - 0.5) * 40;
    p.vy = (Math.random() - 0.5) * 40;
    particles.push(p);
    mbtiParticles[mbti].push(p);
  }
  pruneAllTypes(mbtiCounts);
}

/**
 * 產生 ambient（背景）顆粒。
 */
export function seedAmbient(
  n: number,
  W: number = (typeof window !== 'undefined' ? window.innerWidth : 800),
  H: number = (typeof window !== 'undefined' ? window.innerHeight : 600)
): void {
  for (let i = 0; i < n; i++) {
    const col = AMBIENT_COLS[i % AMBIENT_COLS.length];
    const p: any = new (Particle as any)(Math.random() * W, Math.random() * H, col, null);
    if (i < 3) {
      p.sizeClass = 'blob';
      p.size = 14 + Math.random() * 18;
      p.alphaT = Math.random() * 0.08 + 0.04;
      p._sprites = getDotSprite(col);
    } else {
      p.sizeClass = 'dot';
      p.size = Math.random() * 4 + 1.5;
      p.alphaT = Math.random() * 0.15 + 0.05;
    }
    particles.push(p);
  }
}

export default { particles, mbtiParticles, spawnMBTI, seedAmbient, pruneAllTypes, pruneType, quotaForType };
