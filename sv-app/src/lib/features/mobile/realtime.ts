import { get } from 'svelte/store';
import { createColorfieldSocket, type ColorfieldSocket } from '$lib/shared/socket-client';
import type { LuckyColorPayload } from '$lib/shared/contracts';
import { renderMobileHoloCard } from './card';
import { mobilePayload, mobileSelectedMbti, mobileState } from './state';

let socket: ColorfieldSocket | null = null;
let hasBoundSocket = false;

function resolveLuckyColor(payload: LuckyColorPayload): void {
	const source = get(mobilePayload);
	if (!source) {
		mobileState.failSubmit('Missing mobile payload');
		return;
	}

	const image = renderMobileHoloCard(payload, source);
	if (!image) {
		mobileState.failSubmit('Failed to render result card');
		return;
	}

	mobileState.finishSubmit(image);
}

export function connectMobileRealtime(): () => void {
	if (!socket) {
		socket = createColorfieldSocket();
	}

	if (!hasBoundSocket) {
		hasBoundSocket = true;
		socket.on('connect', () => mobileState.setSocketConnected(true));
		socket.on('disconnect', () => mobileState.setSocketConnected(false));
		socket.on('lucky_color', (payload) => resolveLuckyColor(payload));
	}

	return () => {
		hasBoundSocket = false;
		socket?.disconnect();
		socket = null;
		mobileState.setSocketConnected(false);
	};
}

export function submitCurrentMbti(): void {
	const mbti = get(mobileSelectedMbti);
	const source = get(mobilePayload);
	if (!mbti || !source) {
		return;
	}

	mobileState.startSubmit();
	if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
		navigator.vibrate(50);
	}

	if (socket?.connected) {
		window.setTimeout(() => {
			socket?.emit('submit_mbti', { mbti });
		}, 1500);
		return;
	}

	window.setTimeout(() => {
		resolveLuckyColor({
			mbti,
			color: source.mbti.colors[mbti],
			nickname: source.mbti.names[mbti],
			luckyPhrase: source.copy.resultTagline,
			count: 1
		});
	}, 900);
}