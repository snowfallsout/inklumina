import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_FILE = path.join(__dirname, '..', 'sessions.json');

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    }
  } catch (e) { console.warn('Failed to load sessions:', e.message); }
  return { active: null, history: [] };
}

function saveSessions(data) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

let sessionsData = loadSessions();

function ensureActive() {
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

export function getActive() { return sessionsData.active; }
export function getHistory() { return sessionsData.history; }
export function getCurrentCounts() { return sessionsData.active.counts; }
export function getCurrentTotal() { return sessionsData.active.total; }

export function createNew(name) {
  sessionsData.history.unshift({ ...sessionsData.active, archivedAt: new Date().toISOString() });
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

export function getHistoryById(id) {
  return sessionsData.history.find(h => h.id === id);
}

export function deleteHistoryById(id) {
  const idx = sessionsData.history.findIndex(h => h.id === id);
  if (idx === -1) return false;
  sessionsData.history.splice(idx, 1);
  saveSessions(sessionsData);
  return true;
}

export function incrementMbti(mbti) {
  const counts = sessionsData.active.counts;
  counts[mbti] = (counts[mbti] || 0) + 1;
  sessionsData.active.total++;
  saveSessions(sessionsData);
  return { counts: sessionsData.active.counts, total: sessionsData.active.total };
}
