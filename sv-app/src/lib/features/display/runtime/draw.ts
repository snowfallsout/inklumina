export function mapToCanvas(state: any, normX: number, normY: number) {
	if (!state.video || state.video.videoWidth === 0) return { x: 0, y: 0 };
	const scale = Math.max(state.W / state.video.videoWidth, state.H / state.video.videoHeight);
	const drawWidth = state.video.videoWidth * scale;
	const drawHeight = state.video.videoHeight * scale;
	const offsetX = (state.W - drawWidth) / 2;
	const offsetY = (state.H - drawHeight) / 2;
	return {
		x: offsetX + (1 - normX) * drawWidth,
		y: offsetY + normY * drawHeight
	};
}

export function drawVideoLayer(state: any): void {
	const ctx = state.ctx;
	if (!ctx) return;
	if (state.camOn && state.video && state.video.readyState >= 2 && state.video.videoWidth > 0) {
		const width = state.video.videoWidth;
		const height = state.video.videoHeight;
		const scale = Math.max(state.W / width, state.H / height);
		const drawWidth = width * scale;
		const drawHeight = height * scale;
		const offsetX = (state.W - drawWidth) / 2;
		const offsetY = (state.H - drawHeight) / 2;
		ctx.save();
		ctx.translate(state.W, 0);
		ctx.scale(-1, 1);
		ctx.globalAlpha = 0.45;
		ctx.drawImage(state.video, offsetX, offsetY, drawWidth, drawHeight);
		ctx.restore();
		ctx.globalAlpha = 1;
	}
}
