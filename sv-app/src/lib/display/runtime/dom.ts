import { displayState } from '$lib/display/state';
import { drawFrame, seedAmbient, state } from './core';
import { bindRealtimeSocket, processFrame, setupCamera, syncLegacyBridge } from './realtime';
import { closeSessionPanel, createNewSession, openSessionPanel } from '$lib/display/session/panel';
import { generateJoinQr, refreshCornerQr, restoreSavedIp } from '$lib/display/session/qr';

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
}

function toggleCamera(): void {
	state.camOn = !state.camOn;
	const button = document.getElementById('cam-toggle');
	if (!button) return;
	button.textContent = state.camOn ? '◎ 摄像头 ON' : '◎ 摄像头 OFF';
	button.classList.toggle('on', state.camOn);
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
