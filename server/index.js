const http = require('http');
const { Server } = require('socket.io');
const getLocalIP = require('os').networkInterfaces;
const createApp = require('./app');
const sessions = require('./sessions');
const mbti = require('./mbti');
const attachSocket = require('./socket');

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
    const { networkInterfaces } = require('os');
    for (const iface of Object.values(networkInterfaces())) {
      for (const item of iface) {
        if (item.family === 'IPv4' && !item.internal) return item.address;
      }
    }
  } catch (_) {}
  return 'localhost';
}
