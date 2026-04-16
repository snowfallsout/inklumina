import fs from "fs";
import path from "path";
//#region src/lib/server/sessions.ts
var SESSIONS_FILE = path.join(process.cwd(), "sessions.json");
function loadSessions() {
	try {
		if (fs.existsSync(SESSIONS_FILE)) return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.warn("[sessions] Failed to load sessions.json:", msg);
	}
	return {
		active: null,
		history: []
	};
}
function saveSessions(data) {
	fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), "utf8");
}
var sessionsData = loadSessions();
function ensureActive() {
	if (!sessionsData.active) {
		sessionsData.active = {
			id: Date.now().toString(36),
			name: "默认活动",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			counts: {},
			total: 0
		};
		saveSessions(sessionsData);
	}
}
ensureActive();
function getActive() {
	ensureActive();
	return sessionsData.active;
}
function createNew(name) {
	ensureActive();
	sessionsData.history.unshift({
		...sessionsData.active,
		archivedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
	sessionsData.active = {
		id: Date.now().toString(36),
		name: name || `活动 ${sessionsData.history.length + 2}`,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		counts: {},
		total: 0
	};
	saveSessions(sessionsData);
	return sessionsData.active;
}
function getHistoryById(id) {
	return sessionsData.history.find((h) => h.id === id);
}
function deleteHistoryById(id) {
	const idx = sessionsData.history.findIndex((h) => h.id === id);
	if (idx === -1) return false;
	sessionsData.history.splice(idx, 1);
	saveSessions(sessionsData);
	return true;
}
function getHistorySummaries() {
	return sessionsData.history.map((s) => ({
		id: s.id,
		name: s.name,
		createdAt: s.createdAt,
		total: s.total
	}));
}
//#endregion
export { getHistorySummaries as a, getHistoryById as i, deleteHistoryById as n, getActive as r, createNew as t };
