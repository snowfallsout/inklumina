import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { Server, type Socket } from 'socket.io';
import { MBTI_COLORS, MBTI_LUCKY_PHRASES, MBTI_NAMES, MBTI_ORDER, type Mbti } from '../shared/constants';
import type { LuckyColorPayload, SessionFile, SessionRecord, SessionResetPayload, SessionStatePayload, SpawnParticlesPayload, SubmitMbtiPayload } from '../shared/types';
import { renderDisplayPage, renderMobilePage } from './pages';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');
const SESSIONS_FILE = path.resolve(ROOT_DIR, 'sessions.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get('/', (_req, res) => res.redirect('/display'));
app.get('/display', (_req, res) => res.send(renderDisplayPage()));
app.get('/join', (_req, res) => res.send(renderMobilePage()));

function createSession(name: string): SessionRecord {
  return {
    id: Date.now().toString(36),
    name,
    createdAt: new Date().toISOString(),
    counts: {},
    total: 0,
  };
}

function loadSessions(): SessionFile {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<SessionFile>;
      return {
        active: parsed.active ?? null,
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Failed to load sessions:', message);
  }

  return { active: null, history: [] };
}

function saveSessions(data: SessionFile): void {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

let sessionsData = loadSessions();

if (!sessionsData.active) {
  sessionsData.active = createSession('默认活动');
  saveSessions(sessionsData);
}

function currentCounts(): Partial<Record<Mbti, number>> {
  return sessionsData.active?.counts ?? {};
}

function currentTotal(): number {
  return sessionsData.active?.total ?? 0;
}

function normalizeMbti(value: string | undefined): Mbti | null {
  const candidate = (value ?? '').trim().toUpperCase();
  return (MBTI_ORDER as readonly string[]).includes(candidate) ? (candidate as Mbti) : null;
}

app.get('/api/sessions', (_req, res) => {
  res.json({
    active: sessionsData.active,
    history: sessionsData.history.map((session) => ({
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      total: session.total,
    })),
  });
});

app.post('/api/sessions/new', (req, res) => {
  const body = req.body as { name?: string } | undefined;
  const name = (body?.name ?? '').trim() || `活动 ${sessionsData.history.length + 2}`;

  if (sessionsData.active) {
    sessionsData.history.unshift({
      ...sessionsData.active,
      archivedAt: new Date().toISOString(),
    });
  }

  sessionsData.active = createSession(name);
  saveSessions(sessionsData);

  const payload: SessionResetPayload = { session: sessionsData.active };
  io.emit('session_reset', payload);

  console.log(`[Session] New: "${name}"`);
  res.json({ ok: true, active: sessionsData.active });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = sessionsData.history.find((item) => item.id === req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(session);
});

app.delete('/api/sessions/:id', (req, res) => {
  const index = sessionsData.history.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  sessionsData.history.splice(index, 1);
  saveSessions(sessionsData);
  console.log(`[Session] Deleted: ${req.params.id}`);
  res.json({ ok: true });
});

io.on('connection', (socket: Socket) => {
  const state: SessionStatePayload = {
    counts: currentCounts(),
    colors: MBTI_COLORS,
    total: currentTotal(),
    session: sessionsData.active,
  };

  socket.emit('state', state);

  socket.on('submit_mbti', (data: SubmitMbtiPayload = {}) => {
    const mbti = normalizeMbti(data.mbti);
    if (!mbti || !sessionsData.active) {
      return;
    }

    const counts = currentCounts();
    counts[mbti] = (counts[mbti] ?? 0) + 1;
    sessionsData.active.total += 1;
    saveSessions(sessionsData);

    const payload: LuckyColorPayload = {
      mbti,
      color: MBTI_COLORS[mbti],
      nickname: MBTI_NAMES[mbti],
      luckyPhrase: MBTI_LUCKY_PHRASES[mbti],
      count: counts[mbti] ?? 0,
    };

    const broadcast: SpawnParticlesPayload = {
      ...payload,
      counts: { ...counts },
      total: currentTotal(),
    };

    socket.emit('lucky_color', payload);
    io.emit('spawn_particles', broadcast);

    console.log(`[+] ${mbti} (${MBTI_NAMES[mbti]}) joined — total: ${currentTotal()}`);
  });
});

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║         COLORFIELD  SERVER          ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`\n  Display  →  http://localhost:${PORT}/display`);
  console.log(`  Mobile   →  http://${ip}:${PORT}/join`);
  console.log('\n  Put the mobile URL / QR on the big screen!\n');
});

function getLocalIP(): string {
  try {
    const { networkInterfaces } = require('os') as typeof import('os');
    for (const iface of Object.values(networkInterfaces())) {
      if (!iface) continue;
      for (const item of iface) {
        if (item.family === 'IPv4' && !item.internal) {
          return item.address;
        }
      }
    }
  } catch {
    // fall through
  }

  return 'localhost';
}
