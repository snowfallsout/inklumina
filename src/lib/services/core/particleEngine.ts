/*
  particleEngine.ts
  說明：提供舊版 `$lib/core/particleEngine` 相容 API，實際委派給目前
  `src/lib/function` 底下的粒子模組，避免 display 元件繼續引用已刪除的 core 檔案。
*/

import {
	mbtiParticles,
	particles,
	seedAmbient as seedPoolAmbient,
	spawnMBTI as spawnPoolMBTI
} from '../../utils/pool';
import { prewarmAll } from '../../utils/sprites';

export type ParticleFace = { x: number; y: number; smile?: boolean };
export type ParticleInteraction = { x: number; y: number; score?: number };

type ParticleEngineOptions = {
	max?: number;
};

function detachParticle(particle: unknown) {
	for (const list of Object.values(mbtiParticles) as Array<(typeof mbtiParticles)[string]>) {
		const index = list.indexOf(particle);
		if (index !== -1) {
			list.splice(index, 1);
		}
	}
}

export default class ParticleEngine {
	particles = particles;
	private width = typeof window !== 'undefined' ? window.innerWidth : 800;
	private height = typeof window !== 'undefined' ? window.innerHeight : 600;
	private faces: ParticleFace[] = [];
	private interactions: ParticleInteraction[] = [];
	private emotion: 'neutral' | 'smile' = 'neutral';
	private readonly max: number;

	constructor(options: ParticleEngineOptions = {}) {
		/*
		  建立粒子引擎相容實例。
		  @param options - 舊版 Canvas 元件傳入的設定，現在只使用 `max`。
		*/
		this.max = options.max ?? 1200;
		if (typeof document !== 'undefined') {
			prewarmAll();
		}
	}

	resize(width: number, height: number) {
		// 更新粒子系統使用的畫布尺寸，供 spawn 與 update 計算使用。
		this.width = width;
		this.height = height;
	}

	setFaces(faces: ParticleFace[]) {
		// 接收目前偵測到的人臉座標，並推導整體情緒狀態。
		this.faces = Array.isArray(faces) ? faces : [];
		this.emotion = this.faces.some((face) => face?.smile) ? 'smile' : 'neutral';
	}

	setInteractions(interactions: ParticleInteraction[]) {
		// 接收手勢/互動點資料，讓粒子 update 時可使用同一份 pixel-space 座標。
		this.interactions = Array.isArray(interactions) ? interactions : [];
	}

	seedAmbient(count: number) {
		// 補種背景粒子，沿用現行 pool 實作。
		seedPoolAmbient(count, this.width, this.height);
		this.trimOverflow();
	}

	spawnMBTI(mbti: string, color?: string, counts: Record<string, number> = {}) {
		// 建立 MBTI 粒子並套用現行 quota/prune 行為。
		spawnPoolMBTI(mbti, color ?? '#ffffff', this.width, this.height, counts);
		this.trimOverflow();
	}

	step(_deltaMs: number) {
		// 驅動所有粒子的物理更新；delta 目前沿用 legacy 固定步進，不直接使用。
		for (const particle of particles) {
			particle.update(
				this.faces,
				this.emotion,
				this.interactions,
				mbtiParticles,
				this.width,
				this.height
			);
		}
		this.trimOverflow();
	}

	render(ctx: CanvasRenderingContext2D) {
		// 將目前粒子狀態繪製到 canvas context。
		for (const particle of particles) {
			particle.draw(ctx);
		}
	}

	private trimOverflow() {
		while (particles.length > this.max) {
			const particle = particles.shift();
			if (!particle) {
				break;
			}
			detachParticle(particle);
		}
	}
}

