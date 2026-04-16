import fs from 'fs';
import path from 'path';
import type { MbtiCode, SessionCounts, SessionRecord, SessionSummary } from '../shared/contracts';

const SESSIONS_FILE = path.join(process.cwd(), 'sessions.json');

interface SessionsData {
	active: SessionRecord | null;
	history: SessionRecord[];
}

function loadSessions(): SessionsData {
	try {
		if (fs.existsSync(SESSIONS_FILE)) {
			return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')) as SessionsData;
		}
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.warn('[sessions] Failed to load sessions.json:', msg);
	}
	return { active: null, history: [] };
}

function saveSessions(data: SessionsData): void {
	fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

let sessionsData: SessionsData = loadSessions();

function ensureActive(): void {
	if (!sessionsData.active) {
		sessionsData.active = {
			id: Date.now().toString(36),
			name: '默认活动',
			createdAt: new Date().toISOString(),
			counts: {},
			total: 0,
		};
		saveSessions(sessionsData);
	}
}

ensureActive();

export function getActive(): SessionRecord {
	ensureActive();
	return sessionsData.active!;
}

export function getHistory(): SessionRecord[] {
	return sessionsData.history;
}

export function getCurrentCounts(): SessionCounts {
	ensureActive();
	return sessionsData.active!.counts;
}

export function getCurrentTotal(): number {
	ensureActive();
	return sessionsData.active!.total;
}

export function createNew(name: string): SessionRecord {
	ensureActive();
	sessionsData.history.unshift({
		...sessionsData.active!,
		archivedAt: new Date().toISOString(),
	});
	sessionsData.active = {
		id: Date.now().toString(36),
		name: name || `活动 ${sessionsData.history.length + 2}`,
		createdAt: new Date().toISOString(),
		counts: {},
		total: 0,
	};
	saveSessions(sessionsData);
	return sessionsData.active;
}

export function getHistoryById(id: string): SessionRecord | undefined {
	return sessionsData.history.find((h) => h.id === id);
}

export function deleteHistoryById(id: string): boolean {
	const idx = sessionsData.history.findIndex((h) => h.id === id);
	if (idx === -1) return false;
	sessionsData.history.splice(idx, 1);
	saveSessions(sessionsData);
	return true;
}

export function incrementMbti(mbti: MbtiCode): { counts: SessionCounts; total: number } {
	ensureActive();
	const counts = sessionsData.active!.counts;
	counts[mbti] = (counts[mbti] ?? 0) + 1;
	sessionsData.active!.total++;
	saveSessions(sessionsData);
	return { counts: sessionsData.active!.counts, total: sessionsData.active!.total };
}

export function getHistorySummaries(): SessionSummary[] {
	return sessionsData.history.map((s) => ({
		id: s.id,
		name: s.name,
		createdAt: s.createdAt,
		total: s.total,
	}));
}
