// @ts-nocheck
import type { DeleteSessionResponse, SessionMutationResponse, SessionRecord, SessionsOverviewResponse } from '$lib/shared/contracts';
import { generateJoinQr } from './qr';

function escapeHtml(value: string): string {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function setSessionName(name: string): void {
	const element = document.getElementById('session-name');
	if (!element) return;
	element.textContent = name ? `— ${name} —` : '';
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
		setSessionName(payload.active.name);
	}
	if (!payload.history || payload.history.length === 0) {
		list.innerHTML = '<div style="color:rgba(30,40,60,0.3);font-size:12px;padding:16px 0">暂无历史记录</div>';
		return;
	}
	list.innerHTML = payload.history.map((session) => {
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
	}).join('');
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
		.sort((left, right) => (right[1] as number) - (left[1] as number))
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
