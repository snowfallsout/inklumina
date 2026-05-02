/*
 * src/lib/services/display/runtime.ts
 * Purpose: Canonical display-service owner for bootstrapping the display runtime.
 */
import { drawFrame, seedAmbient, state } from '$lib/function/runtime/core';
import { processFrame, setupCamera } from '$lib/services/display/camera';
import { bindRealtimeSocket, syncLegacyBridge } from '$lib/services/display/realtime';
import {
	closeSessionPanel,
	createNewSession,
	openSessionPanel,
	generateJoinQr,
	refreshCornerQr,
	restoreSavedIp,
	viewDisplaySession,
	deleteDisplaySession
} from '$lib/services/display/session';

function bindLegacyEvents(): void {
	const camToggle = document.getElementById('cam-toggle');
	camToggle?.addEventListener('click', toggleCamera);

	const sessionButton = document.getElementById('session-btn');
	sessionButton?.addEventListener('click', openSessionPanel);

	const closeButton = document.getElementById('sp-close');
	closeButton?.addEventListener('click', closeSessionPanel);

	const createButton = document.getElementById('sp-create-btn');
	createButton?.addEventListener('click', createNewSession);

	const qrButton = document.getElementById('sp-generate-qr-btn');
	qrButton?.addEventListener('click', generateJoinQr);

	const historyList = document.getElementById('sp-history-list');
	historyList?.addEventListener('click', (event) => {
		const target = event.target as HTMLElement | null;
		if (!target) return;
		const button = target.closest('button[data-session-action]') as HTMLButtonElement | null;
		if (!button) return;
		const action = button.getAttribute('data-session-action');
		const id = button.getAttribute('data-session-id') ?? '';
		if (!id) return;
		switch (action) {
			case 'view':
				void viewDisplaySession(id);
				break;
			case 'delete':
				void deleteDisplaySession(id);
				break;
		}
	});
}

function toggleCamera(): void {
	state.camOn = !state.camOn;
	const button = document.getElementById('cam-toggle');
	const video = document.getElementById('video-bg');
	if (!button) return;
	button.textContent = state.camOn ? '◎ 摄像头 ON' : '◎ 摄像头 OFF';
	button.classList.toggle('on', state.camOn);
	video?.classList.toggle('on', state.camOn);
}

export function initDisplayRuntime(): void {
	state.canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
	state.ctx = state.canvas?.getContext('2d') ?? null;
	state.video = document.getElementById('video-bg') as HTMLVideoElement | null;
	if (!state.canvas || !state.ctx || !state.video) return;

	const resize = (): void => {
		state.W = state.canvas!.width = window.innerWidth;
		state.H = state.canvas!.height = window.innerHeight;
	};

	resize();
	window.addEventListener('resize', resize);
	bindLegacyEvents();
	restoreSavedIp();
	syncLegacyBridge();
	bindRealtimeSocket();
	refreshCornerQr();
	seedAmbient(25);
	setupCamera();
	processFrame();
	drawFrame();
}

export function bindDisplayRuntime(): void {
	bindLegacyEvents();
}