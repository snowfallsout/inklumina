/*
  ui-network.ts
  說明：UI 與 socket 事件的輕量封裝（legend、toasts、session name、socket handlers）。
*/
import { MBTI_ORDER, MBTI_COLORS } from '../config/constants';

export function buildLegend(rootEl: HTMLElement | null): void {
  if (!rootEl) return;
  rootEl.innerHTML = '';
  for (const m of MBTI_ORDER) {
    const c = MBTI_COLORS[m];
    rootEl.insertAdjacentHTML('beforeend', `
      <div class="row" id="r-${m}">
        <div class="dot" style="background:${c};--c:${c}"></div>
        <span class="lbl">${m}</span>
        <div class="track"><div class="fill" id="f-${m}" style="background:${c}"></div></div>
        <span class="cnt" id="c-${m}">0</span>
      </div>`);
  }
}

export function renderLegend(mbtiCounts: Record<string, number>): void {
  const total = Object.values(mbtiCounts).reduce((a,b)=>a+b,0);
  const totalEl = document.getElementById('total-num'); if (totalEl) totalEl.textContent = String(total);
  for (const m of MBTI_ORDER) {
    const n   = mbtiCounts[m] || 0; const pct = total > 0 ? n/total*100 : 0;
    document.getElementById(`r-${m}`)?.classList.toggle('on', n > 0);
    const f = document.getElementById(`f-${m}`); const c = document.getElementById(`c-${m}`);
    if (f) (f as HTMLElement).style.width = pct + '%'; if (c) c.textContent = String(n);
  }
}

export function showToast(msg: string, color: string) {
  const ui = document.getElementById('ui'); if (!ui) return;
  ui.querySelectorAll('.toast-wrap').forEach(el => el.remove());
  const wrap = document.createElement('div'); wrap.className = 'toast-wrap';
  wrap.innerHTML = `<div class="toast-pill" style="border-color:${color}55;text-shadow:0 0 18px ${color}">${msg}</div>`;
  ui.appendChild(wrap); setTimeout(() => wrap.remove(), 3000);
}

export function setSessionName(name: string) { const el = document.getElementById('session-name'); if (el) el.textContent = name ? `— ${name} —` : ''; }

export function initSocketHandlers(socket: any, mbtiCounts: Record<string,number>, handlers: any = {}) {
  socket.on('state', (data: any) => { Object.assign(mbtiCounts, data.counts || {}); if (handlers.renderLegend) handlers.renderLegend(mbtiCounts); if (data.session && handlers.setSessionName) handlers.setSessionName(data.session.name); });
  socket.on('spawn_particles', (data: any) => { const { mbti, color, counts, total, nickname } = data; Object.assign(mbtiCounts, counts || {}); if (handlers.spawnMBTI) handlers.spawnMBTI(mbti, color); if (handlers.renderLegend) handlers.renderLegend(mbtiCounts); const totalEl = document.getElementById('total-num'); if (totalEl) totalEl.textContent = String(total || Object.values(mbtiCounts).reduce((a,b)=>a+b,0)); if (handlers.showToast) handlers.showToast(`✦ ${mbti} ${nickname} joined`, color); if (handlers.onFirstParticle && handlers.onFirstParticle()) { const w = document.getElementById('waiting'); if (w) (w as HTMLElement).style.display = 'none'; } });
  socket.on('session_reset', (data: any) => { for (const k of Object.keys(mbtiCounts)) delete mbtiCounts[k]; if (handlers.clearMBTIParticles) handlers.clearMBTIParticles(); if (handlers.renderLegend) handlers.renderLegend(mbtiCounts); const totalEl = document.getElementById('total-num'); if (totalEl) totalEl.textContent = '0'; const wait = document.getElementById('waiting'); if (wait) (wait as HTMLElement).style.display = ''; if (data.session && handlers.setSessionName) handlers.setSessionName(data.session.name); if (handlers.showToast) handlers.showToast('✦ 新场次已开始', '#ffffff'); });
}
