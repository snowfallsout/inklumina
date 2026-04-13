'use strict';

const particles = [];
const mbtiParticles = {};

function quotaForType(mbti) {
  const total = Object.values(mbtiCounts).reduce((a, b) => a + b, 0) || 1;
  const count = mbtiCounts[mbti] || 1;
  const raw = Math.floor((count / total) * MAX_MBTI_TOTAL);
  return Math.max(MIN_PER_TYPE, Math.min(MAX_PER_TYPE, raw));
}

function pruneType(mbti) {
  const arr = mbtiParticles[mbti];
  if (!arr) return;
  const quota = quotaForType(mbti);
  while (arr.length > quota) {
    const p = arr.shift();
    const idx = particles.indexOf(p);
    if (idx !== -1) particles.splice(idx, 1);
  }
}

function pruneAllTypes() {
  for (const mbti of Object.keys(mbtiParticles)) pruneType(mbti);
}

function spawnMBTI(mbti, color) {
  if (!mbtiParticles[mbti]) mbtiParticles[mbti] = [];

  const bx = W / 2;
  const by = H / 2;

  for (let i = 0; i < SPAWN_PER_JOIN; i++) {
    const p = new Particle(bx, by, color, mbti);
    p.vx = (Math.random() - .5) * 40;
    p.vy = (Math.random() - .5) * 40;
    particles.push(p);
    mbtiParticles[mbti].push(p);
  }

  pruneAllTypes();
}
