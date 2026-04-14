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

// Simple structured logger
function log(level, ...args) {
  const ts = new Date().toISOString();
  console.log(`${ts} [${level.toUpperCase()}]`, ...args);
}

// expose io to routes (used for session_reset)
app.locals.io = io;

// attach socket handlers
attachSocket(io, sessions, mbti);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIPAddress();
  log('info', '🎨 --- COLORFIELD --- 🎨');
  log('info', '✅ Server Status: Online');
  log('info', '---------------------------');
  log('info', `📍 Big Screen: http://localhost:${PORT}/display`);
  log('info', `📲 Mobile App: http://${ip}:${PORT}/mobile`);
  log('info', '---------------------------');
  log('info', '⚡ Ensure all devices are on the SAME WiFi!\n');
  log('info', `\n  Put the mobile URL / QR on the big screen!\n`);
});

// Graceful shutdown
function shutdown(code = 0) {
  log('info', 'Received shutdown signal, closing HTTP server...');
  try {
    server.close(() => {
      log('info', 'HTTP server closed');
      try {
        io.close(() => {
          log('info', 'Socket.IO closed');
          process.exit(code);
        });
      } catch (e) {
        log('error', 'Error closing Socket.IO', e);
        process.exit(code);
      }
    });
  } catch (e) {
    log('error', 'Error during shutdown', e);
    process.exit(code || 1);
  }
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (err) => {
  log('error', 'Uncaught exception:', err);
  shutdown(1);
});
process.on('unhandledRejection', (reason) => {
  log('error', 'Unhandled Rejection:', reason);
  shutdown(1);
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
