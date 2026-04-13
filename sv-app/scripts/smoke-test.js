import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';
const API_SESSIONS = `${SERVER_URL}/api/sessions`;
const SCRIPTS_ROOT = process.cwd();
const SVAPP_DIR = path.join(SCRIPTS_ROOT, 'sv-app');

function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function waitForApi(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const j = await fetchJson(url);
      return j;
    } catch (e) {
      await wait(500);
    }
  }
  throw new Error(`timeout waiting for ${url}`);
}

function startServerChild() {
  console.log('Starting sv-app server (child)...');
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: SVAPP_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (d) => process.stdout.write(`[sv-app] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[sv-app] ERR: ${d}`));

  child.on('exit', (code) => console.log(`sv-app server exited (${code})`));
  return child;
}

function waitForEventOnce(target, ev, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => {
      target.off(ev, handler);
      reject(new Error(`timeout waiting for event ${ev}`));
    }, timeout);
    function handler(payload) {
      clearTimeout(to);
      resolve(payload);
    }
    target.once(ev, handler);
  });
}

async function runTests() {
  let childServer = null;
  let startedByScript = false;

  // try API first (server already running?)
  try {
    console.log('Checking existing server...');
    await waitForApi(API_SESSIONS, 2000);
    console.log('Server already running.');
  } catch (e) {
    // start child
    childServer = startServerChild();
    startedByScript = true;
    await waitForApi(API_SESSIONS, 20000);
    console.log('Server started and API reachable.');
  }

  // API smoke
  console.log('Fetching /api/sessions ...');
  const sessions = await fetchJson(API_SESSIONS);
  if (!sessions) throw new Error('No JSON returned from /api/sessions');
  console.log('API sessions OK — keys:', Object.keys(sessions));

  // Socket smoke
  console.log('Running socket smoke test...');
  const socket = io(SERVER_URL, { transports: ['websocket'], reconnectionAttempts: 3, timeout: 5000 });

  await new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('socket connect timeout')), 8000);
    socket.on('connect', () => {
      clearTimeout(to);
      resolve();
    });
    socket.on('connect_error', (err) => {
      clearTimeout(to);
      reject(err);
    });
  });
  console.log('Socket connected.');

  // wait for initial state
  const state = await waitForEventOnce(socket, 'state', 3000);
  console.log('Received state event.');

  // prepare submit
  const testMbti = 'INTJ';
  socket.emit('submit_mbti', { mbti: testMbti });

  const lucky = await waitForEventOnce(socket, 'lucky_color', 3000);
  console.log('Received lucky_color:', lucky);

  const spawn = await waitForEventOnce(socket, 'spawn_particles', 3000);
  console.log('Received spawn_particles:', { mbti: spawn.mbti, total: spawn.total });

  socket.close();

  // cleanup child server if we started it
  if (startedByScript && childServer) {
    console.log('Stopping child server...');
    childServer.kill();
    await wait(500);
  }

  console.log('SMOKE TESTS PASSED');
}

(async () => {
  try {
    await runTests();
    process.exit(0);
  } catch (err) {
    console.error('SMOKE TESTS FAILED:', err);
    process.exit(2);
  }
})();
