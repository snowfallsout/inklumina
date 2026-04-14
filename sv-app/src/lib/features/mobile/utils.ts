export function roundRect(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
): void {
	context.beginPath();
	context.moveTo(x + radius, y);
	context.arcTo(x + width, y, x + width, y + height, radius);
	context.arcTo(x + width, y + height, x, y + height, radius);
	context.arcTo(x, y + height, x, y, radius);
	context.arcTo(x, y, x + width, y, radius);
	context.closePath();
}

export function hexToRgb(hexValue: string): { r: number; g: number; b: number } {
	let hex = hexValue.replace('#', '');
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((c) => c + c)
			.join('');
	}

	return {
		r: parseInt(hex.slice(0, 2), 16),
		g: parseInt(hex.slice(2, 4), 16),
		b: parseInt(hex.slice(4, 6), 16)
	};
}

export function mix(a: string, b: string, ratio: number): string {
	const left = hexToRgb(a);
	const right = hexToRgb(b);
	return `rgb(${Math.round(left.r * (1 - ratio) + right.r * ratio)},${Math.round(left.g * (1 - ratio) + right.g * ratio)},${Math.round(left.b * (1 - ratio) + right.b * ratio)})`;
}

export function lighten(hex: string, ratio: number): string {
	const source = hexToRgb(hex);
	return `rgb(${Math.min(255, source.r + Math.round((255 - source.r) * ratio))},${Math.min(255, source.g + Math.round((255 - source.g) * ratio))},${Math.min(255, source.b + Math.round((255 - source.b) * ratio))})`;
}