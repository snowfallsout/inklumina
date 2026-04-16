import { get } from 'svelte/store';
import QRCode from 'qrcode';
import type { DeleteSessionResponse, SessionMutationResponse, SessionRecord, SessionsOverviewResponse } from '$lib/shared/contracts';
import { buildJoinUrl, sanitizeHost, STORAGE_KEY } from './utils';
import { displayState } from '../state';

export function restoreDisplayJoinHost(): void {
	if (typeof window === 'undefined') return;
	const saved = window.localStorage.getItem(STORAGE_KEY) ?? '';
	if (saved) {
		displayState.setSessionHostInput(saved);
	}
}

export async function regenerateJoinQr(): Promise<void> {
	if (typeof window === 'undefined') return;
	const current = get(displayState).sessionPanel.hostInput.trim();
	if (!current) {
		displayState.setJoinQr('', '');
		return;
	}

	const host = sanitizeHost(current);
	if (!/^[\d.]+(:\d+)?$/.test(host)) {
		displayState.setSessionPanelError('IP 格式不正确，示例：192.168.0.68 或 192.168.0.68:3000');
		return;
	}

	const joinUrl = buildJoinUrl(current);
	const joinQrDataUrl = await QRCode.toDataURL(joinUrl, {
		width: 220,
		margin: 1,
		color: { dark: '#000000', light: '#ffffff' }
	});

	window.localStorage.setItem(STORAGE_KEY, current);
	displayState.setSessionPanelError('');
	displayState.setJoinQr(joinUrl, joinQrDataUrl);
}

export async function loadSessionOverview(): Promise<void> {
	displayState.setSessionPanelLoading(true);
	displayState.setSessionPanelError('');

	try {
		const response = await fetch('/api/sessions');
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionsOverviewResponse;
		displayState.setSessionHistory(payload.history ?? []);
		displayState.setSessionName(payload.active?.name ? `— ${payload.active.name} —` : '');
		if (payload.active) {
			displayState.applySocketState({
				counts: payload.active.counts,
				colors: {},
				total: payload.active.total,
				session: payload.active
			});
		}
		if (payload.active?.name) {
			displayState.setSelectedSession(payload.active);
		}
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to load sessions');
	} finally {
		displayState.setSessionPanelLoading(false);
	}
}

export async function createDisplaySession(): Promise<void> {
	const { draftName } = get(displayState).sessionPanel;
	displayState.setSessionPanelSaving(true);
	displayState.setSessionPanelError('');

	try {
		const response = await fetch('/api/sessions/new', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: draftName })
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionMutationResponse;
		displayState.setSessionDraftName('');
		displayState.applySessionReset({ session: payload.active });
		await loadSessionOverview();
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to create session');
	} finally {
		displayState.setSessionPanelSaving(false);
	}
}

export async function viewDisplaySession(id: string): Promise<void> {
	displayState.setSessionPanelError('');

	try {
		const response = await fetch(`/api/sessions/${id}`);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const payload = (await response.json()) as SessionRecord;
		displayState.setSelectedSession(payload);
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to load session detail');
	}
}

export async function deleteDisplaySession(id: string): Promise<void> {
	displayState.setSessionPanelError('');

	try {
		const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		await response.json() as DeleteSessionResponse;
		await loadSessionOverview();
		const currentSelected = get(displayState).sessionPanel.selected;
		if (currentSelected?.id === id) {
			displayState.setSelectedSession(null);
		}
	} catch (error) {
		displayState.setSessionPanelError(error instanceof Error ? error.message : 'Failed to delete session');
	}
}
