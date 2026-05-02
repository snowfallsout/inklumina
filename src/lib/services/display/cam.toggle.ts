/*
 * src/lib/services/display/cam.toggle.ts
 * Purpose: Camera-service helper for updating the minimal camera availability UI state.
 */
export function setNoCameraBadge(): void {
	const badge = document.getElementById('emotion-badge');
	if (badge) badge.textContent = '● NO CAMERA';
}

export function setCameraReady(videoEl: HTMLVideoElement | null): void {
	if (!videoEl) return;
	videoEl.classList.add('ready');
}

export function logCameraUnavailable(errorMessage: string): void {
	console.warn('Camera unavailable:', errorMessage);
	setNoCameraBadge();
}