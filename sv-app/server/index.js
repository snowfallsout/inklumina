import http from 'http';
import { Server } from 'socket.io';
import { networkInterfaces } from 'os';
import createApp from './app.js';
import * as sessions from './sessions.js';
import * as mbti from './mbti.js';
import attachSocket from './socket.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// expose io to routes (used for session_reset)
app.locals.io = io;

// attach socket handlers
attachSocket(io, sessions, mbti);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIPAddress();
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║         COLORFIELD  SERVER            ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`\n  Display  →  http://localhost:${PORT}/display.html`);
  console.log(`  Mobile   →  http://${ip}:${PORT}/mobile.html`);
  console.log(`\n  Put the mobile URL / QR on the big screen!\n`);
});

function getLocalIPAddress() {
  try {
    for (const iface of Object.values(networkInterfaces())) {
      for (const item of iface) {
        if (item.family === 'IPv4' && !item.internal) return item.address;
      }
    }
  } catch (_) {}
  return 'localhost';
}
