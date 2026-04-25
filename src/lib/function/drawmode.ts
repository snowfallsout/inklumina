/*
  drawmode.ts
  說明：手勢導向的繪製模式（收集 → 繪製 → 溶散）的 state machine 與 overlay 繪製。
*/
export type DrawPoint = { x: number; y: number; t?: number };

export interface DrawMode {
  phase: 'idle' | 'gathering' | 'drawing' | 'dissolving';
  strokePath: DrawPoint[];
  gatherTimer: number;
  dissolveTimer: number;
}

export const DRAW_MODE: DrawMode = { phase: 'idle', strokePath: [], gatherTimer: 0, dissolveTimer: 0 };

export const GATHER_RADIUS = 120;
export const GATHER_THRESHOLD = 0.55;
export const GATHER_FRAMES = 40;
export const DISSOLVE_FRAMES = 90;
export const MAX_PATH_POINTS = 800;

export function _tickDrawMode(
  DRAW_MODE: DrawMode,
  particles: any[],
  activePinchPoints: { x: number; y: number }[],
  mbtiParticles: Record<string, any[]>,
  handBadgeSetter: ((s: string) => void) | null
): void {
  const dm = DRAW_MODE;
  const nonFieldParticles = particles.filter(p => p.sizeClass !== 'field');
  const total = nonFieldParticles.length || 1;
  if (activePinchPoints.length > 0) {
    const _ap = activePinchPoints[0];
    const gathered = nonFieldParticles.filter(p => { const dx = p.x - _ap.x, dy = p.y - _ap.y; return dx*dx + dy*dy < GATHER_RADIUS * GATHER_RADIUS; }).length;
    const ratio = gathered / total;
    if (dm.phase === 'idle' || dm.phase === 'gathering') {
      dm.phase = 'gathering';
      if (ratio >= GATHER_THRESHOLD) { dm.gatherTimer++; if (handBadgeSetter) handBadgeSetter(`🤌 GATHERING ${Math.round(dm.gatherTimer / GATHER_FRAMES * 100)}% — keep still…`); }
      else { dm.gatherTimer = Math.max(0, dm.gatherTimer - 2); }
      if (dm.gatherTimer >= GATHER_FRAMES) { dm.phase = 'drawing'; dm.strokePath = []; dm.gatherTimer = 0; if (handBadgeSetter) handBadgeSetter('✏️ DRAWING MODE — move to paint!'); }
    }
    if (dm.phase === 'drawing') {
      dm.strokePath.push({ x: _ap.x, y: _ap.y, t: Date.now() });
      if (dm.strokePath.length > MAX_PATH_POINTS) dm.strokePath.shift();
      if (dm.strokePath.length > 2) {
        for (let i = 0; i < nonFieldParticles.length; i++) {
          const p = nonFieldParticles[i]; const t = (i / nonFieldParticles.length); const pi = Math.floor(t * (dm.strokePath.length - 1)); const pt = dm.strokePath[pi]; const jitter = (p.size || 4) * 2.5; p._drawTarget = { x: pt.x + (Math.sin(i * 2.399) * jitter), y: pt.y + (Math.cos(i * 2.399) * jitter) };
        }
      }
    }
  } else {
    if (dm.phase === 'drawing') {
      dm.phase = 'dissolving'; dm.dissolveTimer = 0;
      for (const p of nonFieldParticles) { p._drawTarget = null; if (dm.strokePath.length > 0) { const last = dm.strokePath[dm.strokePath.length - 1]; const dx = p.x - last.x, dy = p.y - last.y; const d = Math.sqrt(dx*dx + dy*dy) || 1; p.vx += (dx / d) * (4 + Math.random() * 6); p.vy += (dy / d) * (4 + Math.random() * 6); } }
      if (handBadgeSetter) handBadgeSetter('💫 DISSOLVING…');
    }
    if (dm.phase === 'dissolving') { dm.dissolveTimer++; if (dm.dissolveTimer >= DISSOLVE_FRAMES) { dm.phase = 'idle'; dm.strokePath = []; if (handBadgeSetter) handBadgeSetter('✋ NO HAND'); } }
    if (dm.phase === 'gathering') { dm.phase = 'idle'; dm.gatherTimer = 0; }
  }
}

export function _drawStrokeOverlay(ctx: CanvasRenderingContext2D, DRAW_MODE: DrawMode, activePinchPoints: { x: number; y: number }[]): void {
  const dm = DRAW_MODE; if (dm.phase !== 'drawing' || dm.strokePath.length < 2) return; ctx.save(); ctx.globalCompositeOperation = 'source-over'; const path = dm.strokePath; for (let i = 1; i < path.length; i++) { const t = i / path.length; const age = (Date.now() - path[i].t!) / 1000; const fade = Math.max(0, 1 - age * 0.6); ctx.beginPath(); ctx.moveTo(path[i-1].x, path[i-1].y); ctx.lineTo(path[i].x,   path[i].y); ctx.strokeStyle = `rgba(255,255,255,${t * fade * 0.25})`; ctx.lineWidth = 3 + t * 6; ctx.lineCap = 'round'; ctx.stroke(); }
  for (const _ap of activePinchPoints) { const grd = ctx.createRadialGradient(_ap.x, _ap.y, 0, _ap.x, _ap.y, 40); grd.addColorStop(0, 'rgba(255,255,255,0.5)'); grd.addColorStop(0.4, 'rgba(255,255,255,0.1)'); grd.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(_ap.x, _ap.y, 40, 0, Math.PI*2); ctx.fill(); }
  ctx.restore();
}
