const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
const DIST_DIR = path.join(__dirname, 'dist');
app.use(express.static(DIST_DIR));

// ── MBTI Data ─────────────────────────────────────────────────────────────────
const MBTI_COLORS = {
  INTJ: '#4B0082', INTP: '#6495ED', ENTJ: '#FF4500', ENTP: '#FF00FF',
  INFJ: '#00A86B', INFP: '#DA70D6', ENFJ: '#FC913A', ENFP: '#92FE9D',
  ISTJ: '#95A5A6', ISFJ: '#BDB76B', ESTJ: '#4682B4', ESFJ: '#FFB6C1',
  ISTP: '#4A4A4A', ISFP: '#00CED1', ESTP: '#FF2400', ESFP: '#7B68EE',
};

const MBTI_NAMES = {
  INTJ: '战略家', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '检察官', ISFJ: '守护者', ESTJ: '总经理', ESFJ: '执政官',
  ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者',
};

const MBTI_LUCKY_PHRASES = {
  INTJ: '深邃星河', INTP: '量子涟漪', ENTJ: '赤焰烈炬', ENTP: '橙光裂变',
  INFJ: '紫境幽光', INFP: '蔷薇共鸣', ENFJ: '黄金旋律', ENFP: '荧光奇境',
  ISTJ: '蓝海稳浪', ISFJ: '碧玉守护', ESTJ: '烈红征途', ESFJ: '樱粉温暖',
  ISTP: '银弦孤鸣', ISFP: '兰紫自由', ESTP: '电光闪耀', ESFP: '霓虹盛放',
};

app.get('/api/meta', (req, res) => {
  res.json({
    colors: MBTI_COLORS,
    names: MBTI_NAMES,
    luckyPhrases: MBTI_LUCKY_PHRASES,
  });
});

// ── Sessions (活动场次) ──────────────────────────────────────────────────────
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

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

// Ensure there's an active session on startup
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

// Shortcuts for current session
function currentCounts() { return sessionsData.active.counts; }
function currentTotal() { return sessionsData.active.total; }

// ── REST API for session management ──────────────────────────────────────────

// Get current session + history list
app.get('/api/sessions', (req, res) => {
  res.json({
    active: sessionsData.active,
    history: sessionsData.history.map(s => ({
      id: s.id, name: s.name, createdAt: s.createdAt, total: s.total,
    })),
  });
});

// Create a new session (archives current to history)
app.post('/api/sessions/new', (req, res) => {
  const name = (req.body.name || '').trim() || `活动 ${sessionsData.history.length + 2}`;

  // Archive current session
  sessionsData.history.unshift({ ...sessionsData.active, archivedAt: new Date().toISOString() });

  // Create fresh session
  sessionsData.active = {
    id: Date.now().toString(36),
    name,
    createdAt: new Date().toISOString(),
    counts: {},
    total: 0,
  };
  saveSessions(sessionsData);

  // Notify all clients to reset canvas
  io.emit('session_reset', { session: sessionsData.active });

  console.log(`[Session] New: "${name}"`);
  res.json({ ok: true, active: sessionsData.active });
});

// Get a specific history session
app.get('/api/sessions/:id', (req, res) => {
  const s = sessionsData.history.find(h => h.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Session not found' });
  res.json(s);
});

// Delete a history session
app.delete('/api/sessions/:id', (req, res) => {
  const idx = sessionsData.history.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Session not found' });
  sessionsData.history.splice(idx, 1);
  saveSessions(sessionsData);
  console.log(`[Session] Deleted: ${req.params.id}`);
  res.json({ ok: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// ── Socket.IO ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  // Sync new client with active session
  socket.emit('state', {
    counts: currentCounts(),
    colors: MBTI_COLORS,
    total: currentTotal(),
    session: sessionsData.active,
  });

  socket.on('submit_mbti', (data) => {
    const mbti = (data.mbti || '').toUpperCase().trim();
    if (!MBTI_COLORS[mbti]) return;

    const counts = currentCounts();
    counts[mbti] = (counts[mbti] || 0) + 1;
    sessionsData.active.total++;
    saveSessions(sessionsData);

    const payload = {
      mbti,
      color: MBTI_COLORS[mbti],
      nickname: MBTI_NAMES[mbti],
      luckyPhrase: MBTI_LUCKY_PHRASES[mbti],
      count: counts[mbti],
    };

    // Reply to submitter
    socket.emit('lucky_color', payload);

    // Broadcast to all screens
    io.emit('spawn_particles', { ...payload, counts, total: currentTotal() });

    console.log(`[+] ${mbti} (${MBTI_NAMES[mbti]}) joined — total: ${currentTotal()}`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║         COLORFIELD  SERVER            ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`\n  Display  →  http://localhost:${PORT}/`);
  console.log(`  Mobile   →  http://${ip}:${PORT}/join`);
  console.log(`\n  Put the mobile URL / QR on the big screen!\n`);
});

function getLocalIP() {
  try {
    const { networkInterfaces } = require('os');
    for (const iface of Object.values(networkInterfaces())) {
      for (const item of iface) {
        if (item.family === 'IPv4' && !item.internal) return item.address;
      }
    }
  } catch (_) {}
  return 'localhost';
}
