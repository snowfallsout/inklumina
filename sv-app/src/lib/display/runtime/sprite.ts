import { MBTI_COLORS, MBTI_PALETTES } from '$lib/display/constants';

const TWO_PI = Math.PI * 2;

const DOT_HALF = 80;
const BLOB_HALF = 128;
const FIELD_HALF = 160;
const DOT_REF_R = 16;

function createCanvasContext(half: number) {
    const size = half * 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    return { canvas, ctx: canvas.getContext('2d') as CanvasRenderingContext2D, cx: half, cy: half, size };
}

function makeDot(color: string) {
    const { canvas, ctx, cx, cy, size } = createCanvasContext(DOT_HALF);
    const glow = ctx.createRadialGradient(cx, cy, DOT_REF_R * 0.4, cx, cy, DOT_HALF);
    glow.addColorStop(0, `${color}BB`);
    glow.addColorStop(0.5, `${color}44`);
    glow.addColorStop(1, `${color}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    const core = ctx.createRadialGradient(
        cx - DOT_REF_R * 0.28,
        cy - DOT_REF_R * 0.28,
        DOT_REF_R * 0.08,
        cx,
        cy,
        DOT_REF_R
    );
    core.addColorStop(0, color);
    core.addColorStop(0.22, `${color}DD`);
    core.addColorStop(0.72, `${color}BB`);
    core.addColorStop(1, `${color}00`);
    ctx.beginPath();
    ctx.arc(cx, cy, DOT_REF_R, 0, TWO_PI);
    ctx.fillStyle = core;
    ctx.fill();

    return { canvas, half: DOT_HALF, refR: DOT_REF_R };
}

function makeBlob(palette: { core: string; mid: string; edge: string }) {
    const { canvas, ctx, cx, cy } = createCanvasContext(BLOB_HALF);
    const radius = BLOB_HALF * 0.85;
    const offsetX = cx - radius * 0.25;
    const offsetY = cy + radius * 0.15;
    const gradient = ctx.createRadialGradient(offsetX, offsetY, 0, cx, cy, radius);
    gradient.addColorStop(0, palette.core);
    gradient.addColorStop(0.45, palette.mid);
    gradient.addColorStop(0.85, `${palette.edge}88`);
    gradient.addColorStop(1, `${palette.edge}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.fill();
    return { canvas, half: BLOB_HALF, refR: BLOB_HALF * 0.35 };
}

function makeField(palette: { core: string; mid: string; edge: string }) {
    const { canvas, ctx, cx, cy } = createCanvasContext(FIELD_HALF);
    const radius = FIELD_HALF * 0.95;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `${palette.mid}55`);
    gradient.addColorStop(0.3, `${palette.edge}40`);
    gradient.addColorStop(0.65, `${palette.edge}22`);
    gradient.addColorStop(1, `${palette.edge}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-atop';
    for (let index = 0; index < 12; index++) {
        const blobX = cx + (Math.random() - 0.5) * radius;
        const blobY = cy + (Math.random() - 0.5) * radius;
        const blobRadius = radius * (0.2 + Math.random() * 0.35);
        const blobGradient = ctx.createRadialGradient(blobX, blobY, 0, blobX, blobY, blobRadius);
        const color = index % 2 === 0 ? palette.core : palette.mid;
        blobGradient.addColorStop(0, `${color}20`);
        blobGradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = blobGradient;
        ctx.beginPath();
        ctx.arc(blobX, blobY, blobRadius, 0, TWO_PI);
        ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    return { canvas, half: FIELD_HALF, refR: FIELD_HALF * 0.25 };
}

function drawDiamondSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number): void {
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

export function getSpriteSet(state: any, mbti: string) {
    const cached = state.spriteSetCache.get(mbti);
    if (cached) return cached;
    const color = MBTI_COLORS[mbti as keyof typeof MBTI_COLORS];
    const palette = MBTI_PALETTES[mbti as keyof typeof MBTI_PALETTES];
    const set = {
        dot: makeDot(color),
        blob: makeBlob(palette),
        field: makeField(palette)
    };
    state.spriteSetCache.set(mbti, set);
    return set;
}

export function getDotSprite(state: any, color: string) {
    const key = `__dot_${color}`;
    const cached = state.spriteSetCache.get(key);
    if (cached) return cached;
    const dot = makeDot(color);
    const set = { dot, blob: dot, field: dot };
    state.spriteSetCache.set(key, set);
    return set;
}

export { drawDiamondSparkle };
