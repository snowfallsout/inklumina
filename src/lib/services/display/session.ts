/*
 * src/lib/services/display/session.ts
 * Purpose: Canonical display-service module for session panel actions, REST loading, and QR rendering.
 */
import { get } from 'svelte/store';
import type {
	DeleteSessionResponse,
	SessionMutationResponse,
	SessionRecord,
	SessionsOverviewResponse
} from '$lib/shared/contracts';
import { displayState } from '$lib/state/display.svelte';
import { buildJoinUrl, sanitizeHost, STORAGE_KEY } from '$lib/utils/session';

function escapeHtml(value: string): string {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function setLegacySessionName(name: string): void {
	const element = document.getElementById('session-name');
	if (!element) return;
	element.textContent = name ? `— ${name} —` : '';
}

function buildQrImageSrc(url: string, size: number): string {
	return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(url)}`;
}

export function restoreSavedIp(): void {
	if (typeof window === 'undefined') return;
	const saved = window.localStorage.getItem(STORAGE_KEY) ?? '';
	if (!saved) return;
	const input = document.getElementById('sp-ip-input') as HTMLInputElement | null;
	if (input) input.value = saved;
	displayState.setSessionHostInput(saved);
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
	const joinQrDataUrl = buildQrImageSrc(joinUrl, 220);

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

export function openSessionPanel(): void {
	const panel = document.getElementById('session-panel');
	panel?.classList.add('open');
	void loadSessionHistory();
}

export function closeSessionPanel(): void {
	document.getElementById('session-panel')?.classList.remove('open');
}

export async function loadSessionHistory(): Promise<void> {
	const response = await fetch('/api/sessions');
	const payload = (await response.json()) as SessionsOverviewResponse;
	const list = document.getElementById('sp-history-list');
	if (!list) return;
	if (payload.active) {
		setLegacySessionName(payload.active.name);
	}
	if (!payload.history || payload.history.length === 0) {
		list.innerHTML = '<div style="color:rgba(30,40,60,0.3);font-size:12px;padding:16px 0">暂无历史记录</div>';
		return;
	}
	list.innerHTML = payload.history
		.map((session) => {
			const date = new Date(session.createdAt);
			const dateString = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			return `
			<div class="sp-row">
				<div class="sp-row-info">
					<div class="sp-row-name">${escapeHtml(session.name)}</div>
					<div class="sp-row-meta">${dateString} · ${session.total} 人参与</div>
				</div>
				<button class="sp-btn" data-session-action="view" data-session-id="${session.id}">查看</button>
				<button class="sp-btn danger" data-session-action="delete" data-session-id="${session.id}">删除</button>
			</div>`;
		})
		.join('');
}

export async function createNewSession(): Promise<void> {
	const nameInput = document.getElementById('sp-name-input') as HTMLInputElement | null;
	const name = nameInput?.value.trim() ?? '';
	if (!window.confirm(`开始新场次"${name || '新活动'}"？当前数据将存入历史记录。`)) return;
	const response = await fetch('/api/sessions/new', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name })
	});
	const payload = (await response.json()) as SessionMutationResponse;
	if (payload.ok) {
		if (nameInput) nameInput.value = '';
		const ipInput = document.getElementById('sp-ip-input') as HTMLInputElement | null;
		if (ipInput && ipInput.value.trim()) {
			await generateJoinQr();
		} else {
			closeSessionPanel();
		}
	}
}

export async function viewSession(id: string): Promise<void> {
	const response = await fetch(`/api/sessions/${id}`);
	const session = (await response.json()) as SessionRecord;
	const lines = Object.entries(session.counts ?? {})
		.sort((left, right) => right[1] - left[1])
		.map(([mbti, count]) => `${mbti}: ${count}人`)
		.join('\n');
	window.alert(`${session.name}\n创建: ${new Date(session.createdAt).toLocaleString()}\n总人数: ${session.total}\n\n${lines || '无数据'}`);
}

export async function deleteSession(id: string, button: HTMLButtonElement): Promise<void> {
	if (!window.confirm('确认删除此历史记录？')) return;
	const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
	const payload = (await response.json()) as DeleteSessionResponse;
	if (payload.ok) {
		button.closest('.sp-row')?.remove();
	}
}

export async function generateJoinQr(): Promise<void> {
	const input = document.getElementById('sp-ip-input') as HTMLInputElement | null;
	if (!input) return;
	const raw = input.value.trim();
	if (!raw) {
		window.alert('请先填写 PC 的局域网 IPv4 地址（ipconfig → WLAN 适配器 IPv4 Address）');
		return;
	}

	const host = sanitizeHost(raw);
	if (!/^[\d.]+(:\d+)?$/.test(host)) {
		window.alert('IP 格式看起来不对，示例：192.168.0.68  或  192.168.0.68:3000');
		return;
	}
	const url = buildJoinUrl(raw);
	window.localStorage.setItem(STORAGE_KEY, raw);

	const wrap = document.getElementById('sp-qr-wrap');
	const qrBox = document.getElementById('sp-qr');
	if (!wrap || !qrBox) return;
	qrBox.innerHTML = `<img alt="Session join QR code" src="${buildQrImageSrc(url, 180)}" />`;
	const urlElement = document.getElementById('sp-qr-url');
	if (urlElement) urlElement.textContent = url;
	wrap.style.display = 'block';
	void refreshCornerQr();
}

export async function refreshCornerQr(): Promise<void> {
	const box = document.getElementById('corner-qr');
	const urlElement = document.getElementById('corner-qr-url');
	const hint = document.getElementById('corner-qr-hint');
	if (!box) return;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) {
		box.innerHTML = '';
		if (urlElement) urlElement.textContent = '';
		if (hint) hint.style.display = '';
		return;
	}

	const url = buildJoinUrl(raw);
	box.innerHTML = '';
	if (hint) hint.style.display = 'none';
	box.innerHTML = `<img alt="Corner QR code" src="${buildQrImageSrc(url, 120)}" />`;
	if (urlElement) urlElement.textContent = url;
}