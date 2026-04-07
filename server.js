const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route shortcuts
app.get('/', (req, res) => res.redirect('/display.html'));
app.get('/join', (req, res) => res.redirect('/mobile.html'));

// ── MBTI Data ─────────────────────────────────────────────────────────────────
const MBTI_COLORS = {
  INTJ: '#9D4EDD', INTP: '#00F5FF', ENTJ: '#FF073A', ENTP: '#FF6B00',
  INFJ: '#CC00FF', INFP: '#FF1493', ENFJ: '#FFD700', ENFP: '#39FF14',
  ISTJ: '#1E90FF', ISFJ: '#00FFCD', ESTJ: '#FF4500', ESFJ: '#FF69B4',
  ISTP: '#B8C0FF', ISFP: '#E040FB', ESTP: '#FFE600', ESFP: '#FF6EC7',
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

// ── State ─────────────────────────────────────────────────────────────────────
const mbtiCounts = {};
let totalJoined = 0;

// ── Socket.IO ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  // Sync new client
  socket.emit('state', { counts: mbtiCounts, colors: MBTI_COLORS, total: totalJoined });

  socket.on('submit_mbti', (data) => {
    const mbti = (data.mbti || '').toUpperCase().trim();
    if (!MBTI_COLORS[mbti]) return;

    mbtiCounts[mbti] = (mbtiCounts[mbti] || 0) + 1;
    totalJoined++;

    const payload = {
      mbti,
      color: MBTI_COLORS[mbti],
      nickname: MBTI_NAMES[mbti],
      luckyPhrase: MBTI_LUCKY_PHRASES[mbti],
      count: mbtiCounts[mbti],
    };

    // Reply to submitter
    socket.emit('lucky_color', payload);

    // Broadcast to all screens
    io.emit('spawn_particles', { ...payload, counts: mbtiCounts, total: totalJoined });

    console.log(`[+] ${mbti} (${MBTI_NAMES[mbti]}) joined — total: ${totalJoined}`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║         COLORFIELD  SERVER            ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`\n  Display  →  http://localhost:${PORT}/display.html`);
  console.log(`  Mobile   →  http://${ip}:${PORT}/mobile.html`);
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
