import { AMBIENT_COLS_DISPLAY as AMBIENT_COLS } from '$lib/shared/constants/vision';
import { getSpriteSet, getDotSprite, drawDiamondSparkle } from './sprite';
import type {
	RuntimeFacePoint,
	RuntimeParticle,
	RuntimeParticleDraft,
	RuntimeRuntimeState
} from '$lib/services/display/types';

const TWO_PI = Math.PI * 2;

const SIZE_CLASS_PARAMS = {
	dot: { sizeMin: 2, sizeMax: 12, alphaMin: 0.35, alphaMax: 0.95, speedCap: 6, drag: 0.992, accel: 0.45 },
	blob: { sizeMin: 20, sizeMax: 40, alphaMin: 0.12, alphaMax: 0.3, speedCap: 4, drag: 0.986, accel: 0.2 },
	field: { sizeMin: 40, sizeMax: 80, alphaMin: 0.04, alphaMax: 0.12, speedCap: 2, drag: 0.978, accel: 0.08 }
} as const;

function pickSizeClass(): 'dot' | 'blob' | 'field' {
	const value = Math.random();
	if (value < 0.03) return 'field';
	if (value < 0.12) return 'blob';
	return 'dot';
}

function dist2sq(ax: number, ay: number, bx: number, by: number): number {
	const dx = ax - bx;
	const dy = ay - by;
	return dx * dx + dy * dy;
}

function nearestFace(state: RuntimeRuntimeState, px: number, py: number): RuntimeFacePoint | null {
	if (!state.faces || state.faces.length === 0) return null;
	let best: RuntimeFacePoint | null = null;
	let bestDistance = Infinity;
	for (const face of state.faces) {
		const distance = dist2sq(px, py, face.x, face.y);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = face;
		}
	}
	return best;
}

// sparkle helper moved to display.sprite.ts

export function createParticle(state: RuntimeRuntimeState, x: number, y: number, color: string, mbti: string | null): RuntimeParticle {
	const sizeClass = pickSizeClass();
	const params = SIZE_CLASS_PARAMS[sizeClass];
	const particleDraft: RuntimeParticleDraft = {
		x,
		y,
		color,
		mbti,
		sizeClass,
		vx: (Math.random() - 0.5) * (sizeClass === 'dot' ? 14 : 6),
		vy: (Math.random() - 0.5) * (sizeClass === 'dot' ? 14 : 6) - 2,
		size: params.sizeMin + Math.random() * (params.sizeMax - params.sizeMin),
		alpha: 0,
		alphaT: params.alphaMin + Math.random() * (params.alphaMax - params.alphaMin),
		state: 'born',
		age: 0,
		trail: [],
		myTrailMax: Math.floor(Math.random() * 12) + 4,
		orbitA: Math.random() * TWO_PI,
		orbitR: 55 + Math.random() * 90,
		orbitSpd: (0.022 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1),
		targetF: null,
		phaseOffset: Math.random() * TWO_PI,
		_sprites: mbti ? getSpriteSet(state, mbti) : getDotSprite(state, color),
		_drawTarget: null
	};
	const particle = particleDraft as RuntimeParticle;

	particle.update = function (_faces: RuntimeFacePoint[], _emotion: RuntimeRuntimeState['emotion']) {
		this.age++;
		this.alpha = Math.min(this.alphaT, this.alpha + 0.04);
		const currentParams = SIZE_CLASS_PARAMS[this.sizeClass as keyof typeof SIZE_CLASS_PARAMS];
		if (this.age % 2 === 0) {
			this.trail.push({ x: this.x, y: this.y, s: this.size });
			if (this.trail.length > this.myTrailMax) {
				this.trail.splice(0, this.trail.length - this.myTrailMax);
			}
		}

		if (state.activePinchPoints.length > 0 && this.sizeClass !== 'field') {
			let nearest = state.activePinchPoints[0];
			if (state.activePinchPoints.length > 1) {
				const d0 = dist2sq(state.activePinchPoints[0].x, state.activePinchPoints[0].y, this.x, this.y);
				const d1 = dist2sq(state.activePinchPoints[1].x, state.activePinchPoints[1].y, this.x, this.y);
				nearest = d0 < d1 ? state.activePinchPoints[0] : state.activePinchPoints[1];
			}
			const pdx = nearest.x - this.x;
			const pdy = nearest.y - this.y;
			const pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
			const str = Math.min(6, 500 / pd) * 0.22;
			this.vx += (pdx / pd) * str + (Math.random() - 0.5) * 0.4;
			this.vy += (pdy / pd) * str + (Math.random() - 0.5) * 0.4;
			this.vx *= 0.8;
			this.vy *= 0.8;
			this.x += this.vx;
			this.y += this.vy;
			if (this.x < -20) this.x = state.W + 10;
			if (this.x > state.W + 20) this.x = -10;
			if (this.y < -20) this.y = state.H + 10;
			if (this.y > state.H + 20) this.y = -10;
			return;
		}

		if (this.age < 20) {
			this.state = 'born';
		} else if (this.sizeClass === 'field') {
			this.state = 'free';
		} else {
			const nearest = nearestFace(state, this.x, this.y);
			const distance = nearest ? dist2sq(this.x, this.y, nearest.x, nearest.y) : Infinity;
			if (nearest && distance < 260 * 260) {
				this.targetF = nearest;
				this.state = nearest.smile ? 'swirling' : 'attracted';
			} else {
				this.state = 'free';
			}
		}

		switch (this.state) {
			case 'born':
			case 'free': {
				this.vx += (Math.random() - 0.5) * currentParams.accel;
				this.vy += (Math.random() - 0.5) * currentParams.accel;
				if (this.mbti && this.sizeClass === 'dot' && this.age % 4 === 0) {
					const siblings = state.mbtiParticles[this.mbti];
					if (siblings && siblings.length > 1) {
						const other = siblings[Math.floor(Math.random() * siblings.length)];
						if (other !== this) {
							const dx = other.x - this.x;
							const dy = other.y - this.y;
							const distance = Math.sqrt(dx * dx + dy * dy) || 1;
							if (distance > 30 && distance < 350) {
								this.vx += (dx / distance) * 0.012;
								this.vy += (dy / distance) * 0.012;
							}
						}
					}
				}
				this.vx += (state.W * 0.5 - this.x) * 0.00003;
				this.vy += (state.H * 0.5 - this.y) * 0.00003;
				const cap2 = currentParams.speedCap * currentParams.speedCap;
				const speed2 = this.vx * this.vx + this.vy * this.vy;
				if (speed2 > cap2) {
					const inverse = currentParams.speedCap / Math.sqrt(speed2);
					this.vx *= inverse;
					this.vy *= inverse;
				}
				this.vx *= currentParams.drag;
				this.vy *= currentParams.drag;
				break;
			}
			case 'attracted': {
				const target = this.targetF;
				if (!target) break;
				const dx = target.x - this.x;
				const dy = target.y - this.y;
				const distance = Math.sqrt(dx * dx + dy * dy) || 1;
				const force = Math.min(2.2, 90 / distance) * 0.085;
				this.vx += (dx / distance) * force;
				this.vy += (dy / distance) * force;
				this.vx *= 0.92;
				this.vy *= 0.92;
				break;
			}
			case 'swirling': {
				const target = this.targetF;
				if (!target) break;
				this.orbitA += this.orbitSpd * 1.6;
				const targetX = target.x + Math.cos(this.orbitA) * this.orbitR;
				const targetY = target.y + Math.sin(this.orbitA) * this.orbitR;
				this.vx += (targetX - this.x) * 0.08;
				this.vy += (targetY - this.y) * 0.08;
				this.vx *= 0.86;
				this.vy *= 0.86;
				break;
			}
		}

		this.x += this.vx;
		this.y += this.vy;
		if (this.x < -20) this.x = state.W + 10;
		if (this.x > state.W + 20) this.x = -10;
		if (this.y < -20) this.y = state.H + 10;
		if (this.y > state.H + 20) this.y = -10;
	};

	particle.draw = function (ctx: CanvasRenderingContext2D) {
		const sprite = this._sprites[this.sizeClass];
		const pulse = 1 + Math.sin(this.age * 0.018 + this.phaseOffset) * 0.2;
		const baseAlpha = this.alpha * pulse;

		for (let index = 1; index < this.trail.length; index++) {
			const t = index / this.trail.length;
			const point = this.trail[index];
			const half = sprite.half * (point.s / sprite.refR) * t * 0.7;
			if (half < 0.5) continue;
			ctx.globalAlpha = t * baseAlpha * 0.45;
			ctx.drawImage(sprite.canvas, point.x - half, point.y - half, half * 2, half * 2);
		}

		const half = sprite.half * (this.size / sprite.refR);
		ctx.globalAlpha = baseAlpha;
		ctx.drawImage(sprite.canvas, this.x - half, this.y - half, half * 2, half * 2);

		if (this.sizeClass === 'dot' && Math.random() < 0.12) {
			drawDiamondSparkle(ctx, this.x, this.y, this.size, baseAlpha);
		}

		ctx.globalAlpha = 1;
	};

	return particle;
}

function pruneType(state: RuntimeRuntimeState, mbti: string): void {
	const particles = state.mbtiParticles[mbti];
	if (!particles) return;
	const total = Object.values(state.mbtiParticles).reduce((sum: number, entry) => sum + (entry?.length ?? 0), 0) || 1;
	const count = particles.length || 1;
	const quota = Math.max(20, Math.min(120, Math.floor((count / total) * 800)));
	while (particles.length > quota) {
		const particle = particles.shift();
		if (!particle) continue;
		const index = state.particles.indexOf(particle);
		if (index !== -1) state.particles.splice(index, 1);
	}
}

function pruneAllTypes(state: RuntimeRuntimeState): void {
	for (const key of Object.keys(state.mbtiParticles)) {
		pruneType(state, key);
	}
}

export function spawnMBTI(state: RuntimeRuntimeState, mbti: string, color: string): void {
	if (!state.mbtiParticles[mbti]) {
		state.mbtiParticles[mbti] = [];
	}
	const centerX = state.W / 2;
	const centerY = state.H / 2;
	for (let index = 0; index < 18; index++) {
		const particle = createParticle(state, centerX, centerY, color, mbti);
		particle.vx = (Math.random() - 0.5) * 40;
		particle.vy = (Math.random() - 0.5) * 40;
		state.particles.push(particle);
		state.mbtiParticles[mbti].push(particle);
	}
	pruneAllTypes(state);
}

export function seedAmbient(state: RuntimeRuntimeState, count: number): void {
	for (let index = 0; index < count; index++) {
		const color = AMBIENT_COLS[index % AMBIENT_COLS.length];
		const particle = createParticle(state, Math.random() * state.W, Math.random() * state.H, color, null);
		if (index < 3) {
			particle.sizeClass = 'blob';
			particle.size = 14 + Math.random() * 18;
			particle.alphaT = Math.random() * 0.08 + 0.04;
			particle._sprites = getDotSprite(state, color);
		} else {
			particle.sizeClass = 'dot';
			particle.size = Math.random() * 4 + 1.5;
			particle.alphaT = Math.random() * 0.15 + 0.05;
		}
		state.particles.push(particle);
	}
}
