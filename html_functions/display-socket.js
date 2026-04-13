'use strict';

const socket = io();
const mbtiCounts = {};

socket.on('state', data => {
  Object.assign(mbtiCounts, data.counts || {});
  renderLegend();
  if (data.session) setSessionName(data.session.name);
});

socket.on('spawn_particles', data => {
  const { mbti, color, counts, total, nickname } = data;
  Object.assign(mbtiCounts, counts || {});
  spawnMBTI(mbti, color);
  renderLegend();
  const totalEl = document.getElementById('total-num');
  if (totalEl) totalEl.textContent = total || Object.values(mbtiCounts).reduce((a, b) => a + b, 0);
  showToast(`✦ ${mbti} ${nickname} joined`, color);
  if (particles.length > 0) {
    document.getElementById('waiting').style.display = 'none';
  }
});

socket.on('session_reset', data => {
  for (const k of Object.keys(mbtiCounts)) delete mbtiCounts[k];
  for (const mbti of Object.keys(mbtiParticles)) {
    for (const p of mbtiParticles[mbti]) {
      const idx = particles.indexOf(p);
      if (idx !== -1) particles.splice(idx, 1);
    }
    delete mbtiParticles[mbti];
  }
  renderLegend();
  const totalEl = document.getElementById('total-num');
  if (totalEl) totalEl.textContent = '0';
  document.getElementById('waiting').style.display = '';
  if (data.session) setSessionName(data.session.name);
  showToast('✦ 新场次已开始', '#ffffff');
});
