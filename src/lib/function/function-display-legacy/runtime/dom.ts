import { displayState } from '$lib/features/display/state';
import { drawFrame, seedAmbient, state } from './core';
import { bindRealtimeSocket, syncLegacyBridge } from './realtime';
import { processFrame, setupCamera } from './camera';
import { closeSessionPanel, createNewSession, openSessionPanel, generateJoinQr, refreshCornerQr, rerunesavedIp, viewDisplaySession, deleteDisplaySession } from '$lib/features/display/session';

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

	// Delegate clicks inside the session history list to handle view/delete actions
	const historyList = document.getElementById('sp-history-list');
	historyList?.addEventListener('click', (ev) => {
		const target = ev.target as HTMLElement | null;
		if (!target) return;
		const btn = target.closest('button[data-session-action]') as HTMLButtonElement | null;
		if (!btn) return;
		const action = btn.getAttribute('data-session-action');
		const id = btn.getAttribute('data-session-id') ?? '';
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
	rerunesavedIp();
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
