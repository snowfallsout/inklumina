import { SMILE_EMOJIS } from '$lib/shared/constants/vision';
import type { RuntimeParticle, RuntimeRuntimeState } from '$lib/services/display/types';

export function updateEmotionBadge(state: RuntimeRuntimeState): void {
	const element = document.getElementById('emotion-badge');
	if (!element) return;
	if (!state.faces || state.faces.length === 0) {
		element.classList.remove('smile', 'sad');
		element.textContent = '● FACE TRACKING';
		return;
	}
	if (state.emotion === 'smile') {
		element.classList.remove('sad');
		element.classList.add('smile');
		element.textContent = '✦ SMILE DETECTED';
		return;
	}
	element.classList.remove('smile', 'sad');
	element.textContent = `● ${state.faces.length} FACE${state.faces.length > 1 ? 'S' : ''} DETECTED`;
}

function getRandomSmileEmoji(): string {
	return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)] ?? '😊';
}

function getOrCreateSmileEmoji(state: RuntimeRuntimeState): HTMLDivElement {
	if (state.emojiEl) return state.emojiEl;
	const element = document.createElement('div');
	element.className = 'smile-emoji-persistent';
	document.getElementById('ui')?.appendChild(element);
	state.emojiEl = element;
	return element;
}

export function tickSmileEmoji(state: RuntimeRuntimeState): void {
	const anySmiling = state.faces.some((face) => face.smile);
	const element = getOrCreateSmileEmoji(state);
	if (anySmiling) {
		const smilingFace = state.faces.find((face) => face.smile);
		if (smilingFace && !state.wasAnySmiling) {
			element.textContent = getRandomSmileEmoji();
		}
		if (smilingFace) {
			element.style.left = `${smilingFace.x}px`;
			element.style.top = `${smilingFace.y - 70}px`;
			element.style.opacity = '1';
			element.style.transform = 'scale(1)';
		}
	} else {
		element.style.opacity = '0';
		element.style.transform = 'scale(0.5)';
	}
	state.wasAnySmiling = anySmiling;
}

export function tickDrawMode(state: RuntimeRuntimeState): void {
	const drawMode = state.drawMode;
	const nonFieldParticles = state.particles.filter((particle: RuntimeParticle) => particle.sizeClass !== 'field');
	const total = nonFieldParticles.length || 1;

	if (state.activePinchPoints && state.activePinchPoints.length > 0) {
		const pinchPoint = state.activePinchPoints[0];
		const gathered = nonFieldParticles.filter((particle) => {
			const dx = particle.x - pinchPoint.x;
			const dy = particle.y - pinchPoint.y;
			return dx * dx + dy * dy < 120 * 120;
		}).length;
		const ratio = gathered / total;

		if (drawMode.phase === 'idle' || drawMode.phase === 'gathering') {
			drawMode.phase = 'gathering';
			if (ratio >= 0.55) {
				drawMode.gatherTimer++;
				const pct = Math.round((drawMode.gatherTimer / 40) * 100);
				const badge = document.getElementById('hand-badge');
				if (badge) badge.textContent = `🤌 GATHERING ${pct}% — keep still…`;
			} else {
				drawMode.gatherTimer = Math.max(0, drawMode.gatherTimer - 2);
			}

			if (drawMode.gatherTimer >= 40) {
				drawMode.phase = 'drawing';
				drawMode.strokePath = [];
				drawMode.gatherTimer = 0;
				const badge = document.getElementById('hand-badge');
				if (badge) badge.textContent = '✏️ DRAWING MODE — move to paint!';
			}
		}

		if (drawMode.phase === 'drawing') {
			drawMode.strokePath.push({ x: pinchPoint.x, y: pinchPoint.y, t: Date.now() });
			if (drawMode.strokePath.length > 800) {
				drawMode.strokePath.shift();
			}
			if (drawMode.strokePath.length > 2) {
				for (let index = 0; index < nonFieldParticles.length; index++) {
					const particle = nonFieldParticles[index];
					const progress = index / nonFieldParticles.length;
					const pathIndex = Math.floor(progress * (drawMode.strokePath.length - 1));
					const point = drawMode.strokePath[pathIndex];
					const jitter = (particle.size || 4) * 2.5;
					particle._drawTarget = {
						x: point.x + Math.sin(index * 2.399) * jitter,
						y: point.y + Math.cos(index * 2.399) * jitter
					};
				}
			}
		}
	} else {
		if (drawMode.phase === 'drawing') {
			drawMode.phase = 'dissolving';
			drawMode.dissolveTimer = 0;
			for (const particle of nonFieldParticles) {
				particle._drawTarget = null;
				if (drawMode.strokePath.length > 0) {
					const last = drawMode.strokePath[drawMode.strokePath.length - 1];
					const dx = particle.x - last.x;
					const dy = particle.y - last.y;
					const distance = Math.sqrt(dx * dx + dy * dy) || 1;
					particle.vx += (dx / distance) * (4 + Math.random() * 6);
					particle.vy += (dy / distance) * (4 + Math.random() * 6);
				}
			}
			const badge = document.getElementById('hand-badge');
			if (badge) badge.textContent = '💫 DISSOLVING…';
		}

		if (drawMode.phase === 'dissolving') {
			drawMode.dissolveTimer++;
			if (drawMode.dissolveTimer >= 90) {
				drawMode.phase = 'idle';
				drawMode.strokePath = [];
				const badge = document.getElementById('hand-badge');
				if (badge) badge.textContent = '✋ NO HAND';
			}
		}

		if (drawMode.phase === 'gathering') {
			drawMode.phase = 'idle';
			drawMode.gatherTimer = 0;
		}
	}
}

export function drawStrokeOverlay(state: RuntimeRuntimeState): void {
	const drawMode = state.drawMode;
	if (drawMode.phase !== 'drawing' || drawMode.strokePath.length < 2 || !state.ctx) return;
	const ctx = state.ctx;
	ctx.save();
	ctx.globalCompositeOperation = 'source-over';
	for (let index = 1; index < drawMode.strokePath.length; index++) {
		const t = index / drawMode.strokePath.length;
		const age = (Date.now() - drawMode.strokePath[index].t) / 1000;
		const fade = Math.max(0, 1 - age * 0.6);
		ctx.beginPath();
		ctx.moveTo(drawMode.strokePath[index - 1].x, drawMode.strokePath[index - 1].y);
		ctx.lineTo(drawMode.strokePath[index].x, drawMode.strokePath[index].y);
		ctx.strokeStyle = `rgba(255,255,255,${t * fade * 0.25})`;
		ctx.lineWidth = 3 + t * 6;
		ctx.lineCap = 'round';
		ctx.stroke();
	}
	for (const pinchPoint of state.activePinchPoints || []) {
		const gradient = ctx.createRadialGradient(pinchPoint.x, pinchPoint.y, 0, pinchPoint.x, pinchPoint.y, 40);
		gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
		gradient.addColorStop(0.4, 'rgba(255,255,255,0.1)');
		gradient.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(pinchPoint.x, pinchPoint.y, 40, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
