import { getSpriteSetEntries, getDotEntry } from '$lib/core/spriteCache';

// Keep a lightweight sparkle helper local to the display runtime — this
// implementation intentionally mirrors the original visual detail but the
// canonical sprite generation is provided by `spriteCache`.
const TWO_PI = Math.PI * 2;
export function drawDiamondSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number): void {
  const sparkleSize = size * (2.5 + Math.random() * 2);
  const half = sparkleSize * 0.22;
  ctx.globalAlpha = alpha * (0.3 + Math.random() * 0.4);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y - sparkleSize);
  ctx.lineTo(x, y + sparkleSize);
  ctx.moveTo(x - sparkleSize, y);
  ctx.lineTo(x + sparkleSize, y);
  ctx.moveTo(x - half, y - half);
  ctx.lineTo(x + half, y + half);
  ctx.moveTo(x + half, y - half);
  ctx.lineTo(x - half, y + half);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 0.8, 0, TWO_PI);
  ctx.fill();
}

// Delegate sprite generation to the central `spriteCache` module to ensure
// a single source of truth for MBTI palettes and pre-warmed canvases.
export function getSpriteSet(state: any, mbti: string) {
  const entries = getSpriteSetEntries(mbti || '');
  // Convert entries into the runtime shape { canvas, half, refR }
  return { dot: entries.dot, blob: entries.blob, field: entries.field };
}

export function getDotSprite(state: any, color: string) {
  const e = getDotEntry(color);
  return { dot: e, blob: e, field: e };
}

export { drawDiamondSparkle };
