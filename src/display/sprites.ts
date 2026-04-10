import { AMBIENT_COLS, MBTI_COLORS, MBTI_ORDER, MBTI_PALETTES, type Mbti, type MbtiPalette } from '../shared/constants';

export interface SparkSprite {
  canvas: HTMLCanvasElement;
  half: number;
  refR: number;
}

export type ParticleKind = 'dot' | 'blob' | 'field';

export type SpriteSet = Record<ParticleKind, SparkSprite>;

const TWO_PI = Math.PI * 2;

const DOT_HALF = 80;
const BLOB_HALF = 128;
const FIELD_HALF = 160;
const DOT_REF_R = 16;

const spriteCache = new Map<string, SpriteSet>();

function makeCanvas(half: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; cx: number; cy: number; size: number } {
  const size = half * 2;
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = size;
  spriteCanvas.height = size;
  const spriteContext = spriteCanvas.getContext('2d');
  if (!spriteContext) {
    throw new Error('Unable to create 2D canvas context');
  }
  return { canvas: spriteCanvas, ctx: spriteContext, cx: half, cy: half, size };
}

function makeDot(color: string): SparkSprite {
  const { canvas: spriteCanvas, ctx: g, cx, cy, size } = makeCanvas(DOT_HALF);

  const glow = g.createRadialGradient(cx, cy, DOT_REF_R * 0.4, cx, cy, DOT_HALF);
  glow.addColorStop(0, `${color}BB`);
  glow.addColorStop(0.5, `${color}44`);
  glow.addColorStop(1, `${color}00`);
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);

  const core = g.createRadialGradient(cx - DOT_REF_R * 0.28, cy - DOT_REF_R * 0.28, DOT_REF_R * 0.08, cx, cy, DOT_REF_R);
  core.addColorStop(0, 'rgba(255,255,255,0.98)');
  core.addColorStop(0.22, color);
  core.addColorStop(0.72, `${color}BB`);
  core.addColorStop(1, `${color}00`);
  g.beginPath();
  g.arc(cx, cy, DOT_REF_R, 0, TWO_PI);
  g.fillStyle = core;
  g.fill();

  return { canvas: spriteCanvas, half: DOT_HALF, refR: DOT_REF_R };
}

function makeBlob(palette: MbtiPalette): SparkSprite {
  const { canvas: spriteCanvas, ctx: g, cx, cy } = makeCanvas(BLOB_HALF);
  const radius = BLOB_HALF * 0.85;
  const gradient = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, `${palette.core}DD`);
  gradient.addColorStop(0.25, `${palette.mid}AA`);
  gradient.addColorStop(0.55, `${palette.outer}88`);
  gradient.addColorStop(0.8, `${palette.accent}44`);
  gradient.addColorStop(1, `${palette.accent}00`);
  g.fillStyle = gradient;
  g.beginPath();
  g.arc(cx, cy, radius, 0, TWO_PI);
  g.fill();

  g.globalCompositeOperation = 'source-atop';
  const blobCount = 25 + Math.floor(Math.random() * 20);
  for (let index = 0; index < blobCount; index += 1) {
    const offsetX = cx + (Math.random() - 0.5) * radius * 1.4;
    const offsetY = cy + (Math.random() - 0.5) * radius * 1.4;
    const radiusX = 8 + Math.random() * radius * 0.4;
    const radiusY = 8 + Math.random() * radius * 0.4;
    const rotation = Math.random() * TWO_PI;
    const colors = [palette.core, palette.mid, palette.outer, palette.accent];
    g.fillStyle = `${colors[index % 4]}${Math.random() > 0.5 ? '44' : '28'}`;
    g.save();
    g.translate(offsetX, offsetY);
    g.rotate(rotation);
    g.beginPath();
    g.ellipse(0, 0, radiusX, radiusY, 0, 0, TWO_PI);
    g.fill();
    g.restore();
  }
  g.globalCompositeOperation = 'source-over';

  return { canvas: spriteCanvas, half: BLOB_HALF, refR: BLOB_HALF * 0.35 };
}

function makeField(palette: MbtiPalette): SparkSprite {
  const { canvas: spriteCanvas, ctx: g, cx, cy } = makeCanvas(FIELD_HALF);
  const radius = FIELD_HALF * 0.95;
  const gradient = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, `${palette.mid}55`);
  gradient.addColorStop(0.3, `${palette.outer}40`);
  gradient.addColorStop(0.65, `${palette.accent}22`);
  gradient.addColorStop(1, `${palette.accent}00`);
  g.fillStyle = gradient;
  g.beginPath();
  g.arc(cx, cy, radius, 0, TWO_PI);
  g.fill();

  g.globalCompositeOperation = 'source-atop';
  for (let index = 0; index < 12; index += 1) {
    const offsetX = cx + (Math.random() - 0.5) * radius;
    const offsetY = cy + (Math.random() - 0.5) * radius;
    const fieldRadius = radius * (0.2 + Math.random() * 0.35);
    const swirl = g.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, fieldRadius);
    const color = index % 2 === 0 ? palette.core : palette.mid;
    swirl.addColorStop(0, `${color}20`);
    swirl.addColorStop(1, `${color}00`);
    g.fillStyle = swirl;
    g.beginPath();
    g.arc(offsetX, offsetY, fieldRadius, 0, TWO_PI);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';

  return { canvas: spriteCanvas, half: FIELD_HALF, refR: FIELD_HALF * 0.25 };
}

export function getSpriteSet(mbti: Mbti): SpriteSet {
  if (spriteCache.has(mbti)) {
    return spriteCache.get(mbti) as SpriteSet;
  }

  const color = MBTI_COLORS[mbti];
  const palette = MBTI_PALETTES[mbti] ?? { core: color, mid: color, outer: color, accent: color };
  const sprites: SpriteSet = {
    dot: makeDot(color),
    blob: makeBlob(palette),
    field: makeField(palette),
  };
  spriteCache.set(mbti, sprites);
  return sprites;
}

export function getDotSprite(color: string): SpriteSet {
  const key = `__dot_${color}`;
  if (spriteCache.has(key)) {
    return spriteCache.get(key) as SpriteSet;
  }
  const dot = makeDot(color);
  const spriteSet: SpriteSet = { dot, blob: dot, field: dot };
  spriteCache.set(key, spriteSet);
  return spriteSet;
}

for (const mbti of MBTI_ORDER) {
  getSpriteSet(mbti);
}
for (const color of AMBIENT_COLS) {
  getDotSprite(color);
}
