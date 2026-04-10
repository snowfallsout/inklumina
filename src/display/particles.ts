import { AMBIENT_COLS, MBTI_ORDER, type Mbti } from '../shared/constants';
import { getDotSprite, getSpriteSet, type ParticleKind, type SpriteSet } from './sprites';
import type { FacePoint } from './types';

interface InteractionPoint {
  id: number;
  x: number;
  y: number;
  radius: number;
  strength: number;
  ttl: number;
}

type PartialCounts = Partial<Record<Mbti, number>>;

const TWO_PI = Math.PI * 2;

const SIZE_CLASS_PARAMS: Record<ParticleKind, { sizeMin: number; sizeMax: number; alphaMin: number; alphaMax: number; speedCap: number; drag: number; accel: number; trailMax: number }> = {
  dot: { sizeMin: 1.5, sizeMax: 8, alphaMin: 0.35, alphaMax: 0.95, speedCap: 6, drag: 0.992, accel: 0.45, trailMax: 10 },
  blob: { sizeMin: 12, sizeMax: 30, alphaMin: 0.12, alphaMax: 0.3, speedCap: 4, drag: 0.986, accel: 0.2, trailMax: 6 },
  field: { sizeMin: 35, sizeMax: 65, alphaMin: 0.04, alphaMax: 0.12, speedCap: 2, drag: 0.978, accel: 0.08, trailMax: 3 },
};

function pickSizeClass(): ParticleKind {
  const roll = Math.random();
  if (roll < 0.03) {
    return 'field';
  }
  if (roll < 0.12) {
    return 'blob';
  }
  return 'dot';
}

function dist2sq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function nearestFace(faces: FacePoint[], px: number, py: number): FacePoint | null {
  if (!faces.length) {
    return null;
  }

  let best: FacePoint | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const face of faces) {
    const distance = dist2sq(px, py, face.x, face.y);
    if (distance < bestDistance) {
      best = face;
      bestDistance = distance;
    }
  }
  return best;
}

function drawDiamondSparkle(renderCtx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number): void {
  const sparkleSize = size * (2.5 + Math.random() * 2);
  const diamondSize = sparkleSize * 0.22;
  renderCtx.globalAlpha = alpha * (0.3 + Math.random() * 0.4);
  renderCtx.strokeStyle = '#ffffff';
  renderCtx.lineWidth = 0.6;
  renderCtx.beginPath();
  renderCtx.moveTo(x, y - sparkleSize);
  renderCtx.lineTo(x, y + sparkleSize);
  renderCtx.moveTo(x - sparkleSize, y);
  renderCtx.lineTo(x + sparkleSize, y);
  renderCtx.moveTo(x - diamondSize, y - diamondSize);
  renderCtx.lineTo(x + diamondSize, y + diamondSize);
  renderCtx.moveTo(x + diamondSize, y - diamondSize);
  renderCtx.lineTo(x - diamondSize, y + diamondSize);
  renderCtx.stroke();
  renderCtx.globalAlpha = alpha * 0.6;
  renderCtx.fillStyle = '#ffffff';
  renderCtx.beginPath();
  renderCtx.arc(x, y, 0.8, 0, TWO_PI);
  renderCtx.fill();
}

export interface ParticleSystem {
  bindPointer(canvas: HTMLCanvasElement): void;
  resize(width: number, height: number): void;
  reset(): void;
  setCounts(counts: PartialCounts): void;
  seedAmbient(count: number): void;
  spawnMbti(mbti: Mbti, color: string): void;
  update(faces: FacePoint[]): void;
  draw(renderCtx: CanvasRenderingContext2D): void;
  hasParticles(): boolean;
}

export function createParticleSystem(): ParticleSystem {
  let width = 0;
  let height = 0;

  const particles: Particle[] = [];
  const mbtiParticles: Record<Mbti, Particle[]> = {} as Record<Mbti, Particle[]>;
  const mbtiCounts: PartialCounts = {};
  const interactionPoints = new Map<number, InteractionPoint>();

  for (const mbti of MBTI_ORDER) {
    mbtiParticles[mbti] = [];
  }

  class Particle {
    x: number;
    y: number;
    color: string;
    mbti: Mbti | null;
    sizeClass: ParticleKind;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    alphaTarget: number;
    state: 'born' | 'free' | 'attracted' | 'swirling';
    age: number;
    trail: Array<{ x: number; y: number; s: number }>;
    orbitAngle: number;
    orbitRadius: number;
    orbitSpeed: number;
    targetFace: FacePoint | null;
    phaseOffset: number;
    sprites: SpriteSet;

    constructor(x: number, y: number, color: string, mbtiType: Mbti | null) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.mbti = mbtiType;
      this.sizeClass = pickSizeClass();
      const params = SIZE_CLASS_PARAMS[this.sizeClass];
      this.vx = (Math.random() - 0.5) * (this.sizeClass === 'dot' ? 14 : 6);
      this.vy = (Math.random() - 0.5) * (this.sizeClass === 'dot' ? 14 : 6) - 2;
      this.size = params.sizeMin + Math.random() * (params.sizeMax - params.sizeMin);
      this.alpha = 0;
      this.alphaTarget = params.alphaMin + Math.random() * (params.alphaMax - params.alphaMin);
      this.state = 'born';
      this.age = 0;
      this.trail = [];
      this.orbitAngle = Math.random() * TWO_PI;
      this.orbitRadius = 55 + Math.random() * 90;
      this.orbitSpeed = (0.022 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1);
      this.targetFace = null;
      this.phaseOffset = Math.random() * TWO_PI;
      this.sprites = mbtiType ? getSpriteSet(mbtiType) : getDotSprite(color);
    }

    update(faces: FacePoint[]): void {
      this.age += 1;
      this.alpha = Math.min(this.alphaTarget, this.alpha + 0.04);

      const params = SIZE_CLASS_PARAMS[this.sizeClass];

      if (params.trailMax > 0 && this.age % 2 === 0) {
        this.trail.push({ x: this.x, y: this.y, s: this.size });
        if (this.trail.length > params.trailMax) {
          this.trail.shift();
        }
      }

      if (this.age < 20) {
        this.state = 'born';
      } else if (this.sizeClass === 'field') {
        this.state = 'free';
      } else {
        const nearest = nearestFace(faces, this.x, this.y);
        const distanceSquared = nearest ? dist2sq(this.x, this.y, nearest.x, nearest.y) : Number.POSITIVE_INFINITY;
        if (nearest && distanceSquared < 260 * 260) {
          this.targetFace = nearest;
          this.state = nearest.smile ? 'swirling' : 'attracted';
        } else {
          this.state = 'free';
        }
      }

      switch (this.state) {
        case 'born':
        case 'free': {
          this.vx += (Math.random() - 0.5) * params.accel;
          this.vy += (Math.random() - 0.5) * params.accel;

          if (this.mbti && this.sizeClass === 'dot' && this.age % 4 === 0) {
            const siblings = mbtiParticles[this.mbti];
            if (siblings.length > 1) {
              const other = siblings[Math.floor(Math.random() * siblings.length)];
              if (other && other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                if (distance > 30 && distance < 350) {
                  const pull = 0.012;
                  this.vx += (dx / distance) * pull;
                  this.vy += (dy / distance) * pull;
                }
              }
            }
          }

          this.vx += (width * 0.5 - this.x) * 0.00003;
          this.vy += (height * 0.5 - this.y) * 0.00003;

          break;
        }
        case 'attracted': {
          const target = this.targetFace;
          if (target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = Math.min(2.2, 90 / distance) * 0.085;
            this.vx += (dx / distance) * force;
            this.vy += (dy / distance) * force;
            this.vx *= 0.92;
            this.vy *= 0.92;
          }
          break;
        }
        case 'swirling': {
          const target = this.targetFace;
          if (target) {
            this.orbitAngle += this.orbitSpeed * 3.2;
            const targetX = target.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            const targetY = target.y + Math.sin(this.orbitAngle) * this.orbitRadius;
            this.vx += (targetX - this.x) * 0.16;
            this.vy += (targetY - this.y) * 0.16;
            this.vx *= 0.78;
            this.vy *= 0.78;
          }
          break;
        }
      }

      this.applyInteractionRepulsion();

      const speedCapSquared = params.speedCap * params.speedCap;
      const speedSquared = this.vx * this.vx + this.vy * this.vy;
      if (speedSquared > speedCapSquared) {
        const inverse = params.speedCap / Math.sqrt(speedSquared);
        this.vx *= inverse;
        this.vy *= inverse;
      }

      this.vx *= params.drag;
      this.vy *= params.drag;

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -20) this.x = width + 10;
      if (this.x > width + 20) this.x = -10;
      if (this.y < -20) this.y = height + 10;
      if (this.y > height + 20) this.y = -10;
    }

    applyInteractionRepulsion(): void {
      for (const point of interactionPoints.values()) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        if (distance >= point.radius) {
          continue;
        }

        const falloff = 1 - distance / point.radius;
        const sizeScale = this.sizeClass === 'field' ? 0.45 : this.sizeClass === 'blob' ? 0.8 : 1.1;
        const force = falloff * falloff * point.strength * sizeScale;
        this.vx += (dx / distance) * force;
        this.vy += (dy / distance) * force;
      }
    }

    draw(renderCtx: CanvasRenderingContext2D): void {
      const spriteEntry = this.sprites[this.sizeClass];
      const sprite = spriteEntry.canvas;
      const half = spriteEntry.half;
      const refR = spriteEntry.refR;

      const pulse = 1 + Math.sin(this.age * 0.018 + this.phaseOffset) * 0.2;
      const baseAlpha = this.alpha * pulse;

      for (let index = 1; index < this.trail.length; index += 1) {
        const trailPoint = this.trail[index];
        const trailT = index / this.trail.length;
        const halfWidth = half * (trailPoint.s / refR) * trailT * 0.7;
        if (halfWidth < 0.5) {
          continue;
        }
        renderCtx.globalAlpha = trailT * baseAlpha * 0.45;
        renderCtx.drawImage(sprite, trailPoint.x - halfWidth, trailPoint.y - halfWidth, halfWidth * 2, halfWidth * 2);
      }

      const halfWidth = half * (this.size / refR);
      renderCtx.globalAlpha = baseAlpha;
      renderCtx.drawImage(sprite, this.x - halfWidth, this.y - halfWidth, halfWidth * 2, halfWidth * 2);

      if (this.sizeClass === 'dot' && Math.random() < 0.12) {
        drawDiamondSparkle(renderCtx, this.x, this.y, this.size, baseAlpha);
      }

      renderCtx.globalAlpha = 1;
    }
  }

  const totalMbtiCounts = (): number => Object.values(mbtiCounts).reduce((total, value) => total + (value ?? 0), 0);

  const quotaForType = (mbti: Mbti): number => {
    const total = totalMbtiCounts() || 1;
    const count = mbtiCounts[mbti] ?? 1;
    const raw = Math.floor((count / total) * 800);
    return Math.max(20, Math.min(120, raw));
  };

  const pruneType = (mbti: Mbti): void => {
    const particlesForType = mbtiParticles[mbti];
    const quota = quotaForType(mbti);
    while (particlesForType.length > quota) {
      const oldParticle = particlesForType.shift();
      if (!oldParticle) {
        break;
      }
      const index = particles.indexOf(oldParticle);
      if (index !== -1) {
        particles.splice(index, 1);
      }
    }
  };

  const pruneAllTypes = (): void => {
    for (const mbti of MBTI_ORDER) {
      pruneType(mbti);
    }
  };

  const decayInteractions = (): void => {
    for (const [id, point] of interactionPoints) {
      point.ttl -= 1;
      if (point.ttl <= 0) {
        interactionPoints.delete(id);
      }
    }
  };

  const bindPointer = (canvas: HTMLCanvasElement): void => {
    const supportsTouchLike = (event: PointerEvent) => event.pointerType === 'touch' || event.pointerType === 'pen' || event.pointerType === 'mouse';

    const toCanvasPoint = (event: PointerEvent): InteractionPoint => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      return {
        id: event.pointerId,
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
        radius: 180,
        strength: 1.3,
        ttl: 8,
      };
    };

    const upsertInteraction = (event: PointerEvent): void => {
      interactionPoints.set(event.pointerId, toCanvasPoint(event));
    };

    const releaseInteraction = (event: PointerEvent): void => {
      interactionPoints.delete(event.pointerId);
    };

    canvas.addEventListener('pointerdown', (event) => {
      if (!supportsTouchLike(event)) {
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      upsertInteraction(event);
    });

    canvas.addEventListener('pointermove', (event) => {
      if (!supportsTouchLike(event)) {
        return;
      }
      if (interactionPoints.has(event.pointerId) || event.buttons !== 0) {
        upsertInteraction(event);
      }
    });

    canvas.addEventListener('pointerup', releaseInteraction);
    canvas.addEventListener('pointercancel', releaseInteraction);
    canvas.addEventListener('pointerleave', releaseInteraction);
  };

  const seedAmbient = (count: number): void => {
    for (let index = 0; index < count; index += 1) {
      const color = AMBIENT_COLS[index % AMBIENT_COLS.length];
      const particle = new Particle(Math.random() * width, Math.random() * height, color, null);
      if (index < 3) {
        particle.sizeClass = 'blob';
        particle.size = 14 + Math.random() * 18;
        particle.alphaTarget = Math.random() * 0.08 + 0.04;
        particle.sprites = getDotSprite(color);
      } else {
        particle.sizeClass = 'dot';
        particle.size = Math.random() * 4 + 1.5;
        particle.alphaTarget = Math.random() * 0.15 + 0.05;
      }
      particles.push(particle);
    }
  };

  const spawnMbti = (mbti: Mbti, color: string): void => {
    const particlesForType = mbtiParticles[mbti];
    const side = Math.floor(Math.random() * 4);
    let originX = 0;
    let originY = 0;

    switch (side) {
      case 0:
        originX = Math.random() * width;
        originY = -20;
        break;
      case 1:
        originX = width + 20;
        originY = Math.random() * height;
        break;
      case 2:
        originX = Math.random() * width;
        originY = height + 20;
        break;
      default:
        originX = -20;
        originY = Math.random() * height;
        break;
    }

    for (let index = 0; index < 18; index += 1) {
      const particle = new Particle(
        originX + (Math.random() - 0.5) * 60,
        originY + (Math.random() - 0.5) * 60,
        color,
        mbti,
      );
      particles.push(particle);
      particlesForType.push(particle);
    }

    pruneAllTypes();
  };

  const setCounts = (counts: PartialCounts): void => {
    for (const mbti of MBTI_ORDER) {
      delete mbtiCounts[mbti];
    }

    for (const mbti of MBTI_ORDER) {
      const value = counts[mbti];
      if (typeof value === 'number') {
        mbtiCounts[mbti] = value;
      }
    }

    pruneAllTypes();
  };

  const reset = (): void => {
    particles.length = 0;
    for (const mbti of MBTI_ORDER) {
      mbtiParticles[mbti].length = 0;
      delete mbtiCounts[mbti];
    }
    interactionPoints.clear();
  };

  const update = (faces: FacePoint[]): void => {
    decayInteractions();
    for (const particle of particles) {
      particle.update(faces);
    }
  };

  const draw = (renderCtx: CanvasRenderingContext2D): void => {
    renderCtx.globalCompositeOperation = 'screen';
    for (const particle of particles) {
      particle.draw(renderCtx);
    }
    renderCtx.globalCompositeOperation = 'source-over';
  };

  return {
    bindPointer,
    resize(nextWidth: number, nextHeight: number) {
      width = nextWidth;
      height = nextHeight;
    },
    reset,
    setCounts,
    seedAmbient,
    spawnMbti,
    update,
    draw,
    hasParticles: () => particles.length > 0,
  };
}
