const fs = require('fs');
const path = require('path');

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

function getActive() { return sessionsData.active; }
function getHistory() { return sessionsData.history; }
function getCurrentCounts() { return sessionsData.active.counts; }
function getCurrentTotal() { return sessionsData.active.total; }

function createNew(name) {
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

function getHistoryById(id) {
  return sessionsData.history.find(h => h.id === id);
}

function deleteHistoryById(id) {
  const idx = sessionsData.history.findIndex(h => h.id === id);
  if (idx === -1) return false;
  sessionsData.history.splice(idx, 1);
  saveSessions(sessionsData);
  return true;
}

function incrementMbti(mbti) {
  const counts = sessionsData.active.counts;
  counts[mbti] = (counts[mbti] || 0) + 1;
  sessionsData.active.total++;
  saveSessions(sessionsData);
  return { counts: sessionsData.active.counts, total: sessionsData.active.total };
}

module.exports = {
  getActive, getHistory, getCurrentCounts, getCurrentTotal,
  createNew, getHistoryById, deleteHistoryById, incrementMbti,
};
