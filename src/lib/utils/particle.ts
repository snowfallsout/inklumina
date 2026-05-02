/*
  particle.ts
  說明：包含 `Particle` 類別與相關物理/視覺參數與輔助函式（TypeScript 版本）。
*/
import { TWO_PI } from '$lib/shared/constants/mbti';
import { getSpriteSet, getDotSprite } from './sprites';

export const SIZE_CLASS_PARAMS: Record<string, any> = {
  dot:   { sizeMin:2,  sizeMax:8,  alphaMin:.35, alphaMax:.95, speedCap:5,   drag:.990, accel:.45, trailMax:10 },
  blob:  { sizeMin:12, sizeMax:30, alphaMin:.12, alphaMax:.30, speedCap:3.5, drag:.982, accel:.20, trailMax:6  },
  field: { sizeMin:35, sizeMax:65, alphaMin:.04, alphaMax:.12, speedCap:1.5, drag:.970, accel:.06, trailMax:2  },
};

export function pickSizeClass(): 'field'|'blob'|'dot' {
  const r = Math.random(); if (r < .03) return 'field'; if (r < .12) return 'blob'; return 'dot';
}

export class Particle {
  x: number; y: number; color: string; mbti: string | null; sizeClass: string; vx: number; vy: number;
  size: number; alpha: number; alphaT: number; state: string; age: number; trail: any[]; myTrailMax: number;
  orbitA: number; orbitR: number; orbitSpd: number; targetF: any; phaseOffset: number; _sprites: any; _drawTarget?: any;

  constructor(x: number, y: number, color: string, mbtiType: string | null) {
    this.x  = x;  this.y  = y;
    this.color   = color;
    this.mbti    = mbtiType || null;
    this.sizeClass = pickSizeClass();
    const p = SIZE_CLASS_PARAMS[this.sizeClass];
    this.vx = (Math.random() - .5) * (this.sizeClass === 'dot' ? 14 : 6);
    this.vy = (Math.random() - .5) * (this.sizeClass === 'dot' ? 14 : 6) - 2;
    this.size    = p.sizeMin + Math.random() * (p.sizeMax - p.sizeMin);
    this.alpha   = 0;
    this.alphaT  = p.alphaMin + Math.random() * (p.alphaMax - p.alphaMin);
    this.state   = 'born'; this.age = 0; this.trail = [];
    this.myTrailMax = Math.floor(Math.random() * 4) + 7;
    this.orbitA  = Math.random() * TWO_PI;
    this.orbitR  = 55 + Math.random() * 90;
    this.orbitSpd= (.022 + Math.random() * .03) * (Math.random() > .5 ? 1 : -1);
    this.targetF = null; this.phaseOffset = Math.random() * TWO_PI;
    this._sprites = mbtiType ? getSpriteSet(mbtiType) : getDotSprite(color);
  }

  update(faces: any[], emotion: string, activePinchPoints: any[], mbtiParticles: Record<string, any[]>, W: number, H: number) {
    this.age++; this.alpha = Math.min(this.alphaT, this.alpha + .04);
    const p = SIZE_CLASS_PARAMS[this.sizeClass];
    if (this.age % 2 === 0) {
      this.trail.push({ x: this.x, y: this.y, s: this.size });
      if (this.trail.length > this.myTrailMax) this.trail.splice(0, this.trail.length - this.myTrailMax);
    }
    if (activePinchPoints && activePinchPoints.length > 0 && this.sizeClass !== 'field') {
      let nearest = activePinchPoints[0];
      if (activePinchPoints.length > 1) {
        const d0 = (activePinchPoints[0].x-this.x)**2 + (activePinchPoints[0].y-this.y)**2;
        const d1 = (activePinchPoints[1].x-this.x)**2 + (activePinchPoints[1].y-this.y)**2;
        nearest = d0 < d1 ? activePinchPoints[0] : activePinchPoints[1];
      }
      const pdx = nearest.x - this.x; const pdy = nearest.y - this.y;
      const pd  = Math.sqrt(pdx*pdx + pdy*pdy) || 1;
      const str = Math.min(6.0, 500 / pd) * 0.22;
      this.vx += (pdx / pd) * str + (Math.random() - .5) * 0.4;
      this.vy += (pdy / pd) * str + (Math.random() - .5) * 0.4;
      this.vx *= 0.80; this.vy *= 0.80; this.x += this.vx; this.y += this.vy;
      if (this.x < -20) this.x = W + 10; if (this.x > W + 20) this.x = -10;
      if (this.y < -20) this.y = H + 10; if (this.y > H + 20) this.y = -10; return;
    }
    if (this.age < 20) { this.state = 'born'; }
    else if (this.sizeClass === 'field') { this.state = 'free'; }
    else {
      const nf  = nearestFace(faces, this.x, this.y);
      const d2  = nf ? dist2sq(this.x, this.y, nf.x, nf.y) : Infinity;
      if (nf && d2 < 260 * 260) { this.targetF = nf; this.state = nf.smile ? 'swirling' : 'attracted'; }
      else { this.state = 'free'; }
    }
    switch (this.state) {
      case 'born':
      case 'free': {
        this.vx += (Math.random() - .5) * p.accel; this.vy += (Math.random() - .5) * p.accel;
        if (this.mbti && this.sizeClass === 'dot' && this.age % 4 === 0) {
          const siblings = mbtiParticles[this.mbti];
          if (siblings && siblings.length > 1) {
            const other = siblings[Math.floor(Math.random() * siblings.length)];
            if (other !== this) {
              const dx = other.x - this.x, dy = other.y - this.y;
              const d  = Math.sqrt(dx*dx + dy*dy) || 1;
              if (d > 30 && d < 350) { this.vx += (dx / d) * .012; this.vy += (dy / d) * .012; }
            }
          }
        }
        this.vx += (W * .5 - this.x) * .00003; this.vy += (H * .5 - this.y) * .00003;
        const cap2 = p.speedCap * p.speedCap;
        const sp2 = this.vx*this.vx + this.vy*this.vy;
        if (sp2 > cap2) { const inv = p.speedCap / Math.sqrt(sp2); this.vx *= inv; this.vy *= inv; }
        this.vx *= p.drag; this.vy *= p.drag;
        break;
      }
      case 'attracted': {
        const f  = this.targetF; const dx = f.x - this.x, dy = f.y - this.y; const d  = Math.sqrt(dx*dx + dy*dy) || 1;
        const ft = Math.min(2.2, 90 / d) * .085; this.vx += dx/d * ft; this.vy += dy/d * ft; this.vx *= .92; this.vy *= .92; break;
      }
      case 'swirling': {
        const f = this.targetF; this.orbitA += this.orbitSpd * 1.6; const tx = f.x + Math.cos(this.orbitA) * this.orbitR;
        const ty = f.y + Math.sin(this.orbitA) * this.orbitR; this.vx += (tx - this.x) * .08; this.vy += (ty - this.y) * .08; this.vx *= .86; this.vy *= .86; break;
      }
    }
    this.x += this.vx; this.y += this.vy;
    if (this.x < -20) this.x = W + 10; if (this.x > W + 20) this.x = -10;
    if (this.y < -20) this.y = H + 10; if (this.y > H + 20) this.y = -10;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const spriteEntry = this._sprites[this.sizeClass]; const spr  = spriteEntry.canvas;
    const half = spriteEntry.half; const refR = spriteEntry.refR;
    const pulse = 1 + Math.sin(this.age * 0.018 + this.phaseOffset) * 0.2; const baseAlpha = this.alpha * pulse;
    const tr = this.trail; for (let i = 1; i < tr.length; i++) {
      const t  = i / tr.length; const pt = tr[i]; const hw = half * (pt.s / refR) * t * .7; if (hw < .5) continue;
      ctx.globalAlpha = t * baseAlpha * .45; ctx.drawImage(spr, pt.x - hw, pt.y - hw, hw * 2, hw * 2);
    }
    const hw = half * (this.size / refR); ctx.globalAlpha = baseAlpha; ctx.drawImage(spr, this.x - hw, this.y - hw, hw * 2, hw * 2);
    if (this.sizeClass === 'dot' && Math.random() < .03) {
      drawDiamondSparkle(ctx, this.x, this.y, this.size, baseAlpha);
    }
    ctx.globalAlpha = 1;
  }
}

export function drawDiamondSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
  const s = size * (2.5 + Math.random() * 2); const d = s * .22;
  ctx.globalAlpha = alpha * (.3 + Math.random() * .4); ctx.strokeStyle = '#ffffff'; ctx.lineWidth   = .6; ctx.beginPath();
  ctx.moveTo(x, y - s);  ctx.lineTo(x, y + s); ctx.moveTo(x - s, y);  ctx.lineTo(x + s, y);
  ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d); ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d); ctx.stroke();
  ctx.globalAlpha = alpha * .6; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, .8, 0, TWO_PI); ctx.fill();
}

export function dist2sq(ax: number, ay: number, bx: number, by: number) { const dx = ax-bx, dy = ay-by; return dx*dx + dy*dy; }

export function nearestFace(faces: any[], px: number, py: number) {
  if (!faces || !faces.length) return null; let best = null, bd = Infinity;
  for (const f of faces) { const d = dist2sq(px, py, f.x, f.y); if (d < bd) { bd = d; best = f; } }
  return best;
}
