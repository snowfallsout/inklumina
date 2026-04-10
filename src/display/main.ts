import { MBTI_COLORS, MBTI_ORDER, type Mbti } from '../shared/constants';
import { element, escapeHtml, getCanvasContext } from '../shared/dom';
import type { SessionRecord, SessionResetPayload, SessionStatePayload, SpawnParticlesPayload } from '../shared/types';
import { createParticleSystem } from './particles';
import type { EmotionState, FacePoint } from './types';
import { startFaceTracking } from './faceMesh';

declare const io: () => SocketLike;

interface SocketLike {
  emit(event: 'state', payload: SessionStatePayload): void;
  emit(event: 'spawn_particles', payload: SpawnParticlesPayload): void;
  emit(event: 'session_reset', payload: SessionResetPayload): void;
  on(event: 'state', handler: (payload: SessionStatePayload) => void): void;
  on(event: 'spawn_particles', handler: (payload: SpawnParticlesPayload) => void): void;
  on(event: 'session_reset', handler: (payload: SessionResetPayload) => void): void;
  on(event: 'lucky_color', handler: (payload: { mbti: Mbti; color: string; nickname: string; luckyPhrase: string }) => void): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

type PartialCounts = Partial<Record<Mbti, number>>;

const canvas = element<HTMLCanvasElement>('canvas');
const ctx = getCanvasContext(canvas);
const joinBlock = element<HTMLElement>('join-block');
const legendRoot = element<HTMLDivElement>('legend-rows');
const totalNum = element<HTMLElement>('total-num');
const waiting = element<HTMLElement>('waiting');
const emotionBadge = element<HTMLElement>('emotion-badge');
const sessionPanel = element<HTMLElement>('session-panel');
const sessionName = element<HTMLElement>('session-name');
const sessionHistoryList = element<HTMLDivElement>('sp-history-list');
const sessionInput = element<HTMLInputElement>('sp-name-input');
const ui = element<HTMLElement>('ui');
const video = element<HTMLVideoElement>('video-bg');

const particleSystem = createParticleSystem();
const socket = io();

canvas.style.touchAction = 'none';

let width = 0;
let height = 0;
let faces: FacePoint[] = [];
let emotion: EmotionState = 'neutral';
const mbtiCounts: PartialCounts = {};

function resizeCanvas(): void {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  particleSystem.resize(width, height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
particleSystem.bindPointer(canvas);

function totalMbtiCounts(): number {
  return Object.values(mbtiCounts).reduce((total, value) => total + (value ?? 0), 0);
}

function buildLegend(): void {
  legendRoot.innerHTML = '';
  for (const mbti of MBTI_ORDER) {
    const color = MBTI_COLORS[mbti];
    legendRoot.insertAdjacentHTML(
      'beforeend',
      `
      <div class="row" id="r-${mbti}">
        <div class="dot" style="background:${color};--c:${color}"></div>
        <span class="lbl">${mbti}</span>
        <div class="track"><div class="fill" id="f-${mbti}" style="background:${color}"></div></div>
        <span class="cnt" id="c-${mbti}">0</span>
      </div>`,
    );
  }
}

function renderLegend(): void {
  const total = totalMbtiCounts();
  totalNum.textContent = String(total);

  for (const mbti of MBTI_ORDER) {
    const count = mbtiCounts[mbti] ?? 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    element<HTMLElement>(`r-${mbti}`).classList.toggle('on', count > 0);
    element<HTMLDivElement>(`f-${mbti}`).style.width = `${percentage}%`;
    element<HTMLSpanElement>(`c-${mbti}`).textContent = String(count);
  }
}

function setJoinUrl(): void {
  joinBlock.innerHTML = `<b>SCAN TO JOIN</b><br>${window.location.origin}/join`;
}

function setSessionName(name: string): void {
  sessionName.textContent = name ? `— ${name} —` : '';
}

function updateEmotionBadge(): void {
  if (!faces.length) {
    emotionBadge.className = '';
    emotionBadge.textContent = '● FACE TRACKING';
    return;
  }

  if (emotion === 'smile') {
    emotionBadge.className = 'smile';
    emotionBadge.textContent = '✦ SMILE DETECTED';
    return;
  }

  emotionBadge.className = '';
  emotionBadge.textContent = `● ${faces.length} FACE${faces.length > 1 ? 'S' : ''} DETECTED`;
}

function showToast(message: string, color: string): void {
  ui.querySelectorAll('.toast-wrap').forEach((toast) => toast.remove());
  const toastWrap = document.createElement('div');
  toastWrap.className = 'toast-wrap';
  toastWrap.innerHTML = `<div class="toast-pill" style="border-color:${color}55;text-shadow:0 0 18px ${color}">${message}</div>`;
  ui.appendChild(toastWrap);
  window.setTimeout(() => toastWrap.remove(), 3000);
}

function openSessionPanel(): void {
  sessionPanel.classList.add('open');
  loadSessionHistory();
}

function closeSessionPanel(): void {
  sessionPanel.classList.remove('open');
}

function createNewSession(): void {
  const name = sessionInput.value.trim();
  if (!window.confirm(`开始新场次"${name || '新活动'}"？当前数据将存入历史记录。`)) {
    return;
  }

  fetch('/api/sessions/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
    .then((response) => response.json() as Promise<{ ok: boolean }>)
    .then((payload) => {
      if (payload.ok) {
        sessionInput.value = '';
        closeSessionPanel();
      }
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      window.alert(`请求失败: ${message}`);
    });
}

function loadSessionHistory(): void {
  fetch('/api/sessions')
    .then((response) => response.json() as Promise<{ active?: SessionRecord | null; history?: Array<{ id: string; name: string; createdAt: string; total: number }> }>)
    .then((data) => {
      if (data.active) {
        setSessionName(data.active.name);
      }

      if (!data.history || data.history.length === 0) {
        sessionHistoryList.innerHTML = '<div style="color:rgba(255,255,255,0.2);font-size:12px;padding:16px 0">暂无历史记录</div>';
        return;
      }

      sessionHistoryList.innerHTML = data.history
        .map((session) => {
          const created = new Date(session.createdAt);
          const dateText = `${created.getMonth() + 1}/${created.getDate()} ${created.getHours().toString().padStart(2, '0')}:${created.getMinutes().toString().padStart(2, '0')}`;
          return `
            <div class="sp-row">
              <div class="sp-row-info">
                <div class="sp-row-name">${escapeHtml(session.name)}</div>
                <div class="sp-row-meta">${dateText} · ${session.total} 人参与</div>
              </div>
              <button class="sp-btn" onclick="viewSession('${session.id}')">查看</button>
              <button class="sp-btn danger" onclick="deleteSession('${session.id}', this)">删除</button>
            </div>`;
        })
        .join('');
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Failed to load sessions:', message);
    });
}

function viewSession(id: string): void {
  fetch(`/api/sessions/${id}`)
    .then((response) => response.json() as Promise<SessionRecord>)
    .then((session) => {
      const lines = Object.entries(session.counts ?? {})
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
        .map(([mbti, count]) => `${mbti}: ${count ?? 0}人`)
        .join('\n');
      window.alert(`${session.name}\n创建: ${new Date(session.createdAt).toLocaleString()}\n总人数: ${session.total}\n\n${lines || '无数据'}`);
    });
}

function deleteSession(id: string, button: HTMLButtonElement): void {
  if (!window.confirm('确认删除此历史记录？')) {
    return;
  }

  fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    .then((response) => response.json() as Promise<{ ok: boolean }>)
    .then((payload) => {
      if (payload.ok) {
        button.closest('.sp-row')?.remove();
      }
    });
}

function loop(): void {
  window.requestAnimationFrame(loop);

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#05050f';
  ctx.fillRect(0, 0, width, height);

  if (video.readyState >= 2) {
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.globalAlpha = 0.38;
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  particleSystem.update(faces);
  particleSystem.draw(ctx);
}

function bootstrap(): void {
  buildLegend();
  setJoinUrl();
  particleSystem.seedAmbient(25);
  updateEmotionBadge();
  renderLegend();
  startFaceTracking(video, {
    onFaces(nextFaces, nextEmotion) {
      faces = nextFaces;
      emotion = nextEmotion;
      updateEmotionBadge();
    },
    onReady() {
      video.classList.add('ready');
    },
    onUnavailable(message) {
      console.warn('Camera unavailable:', message);
      emotionBadge.textContent = '● NO CAMERA';
    },
  });
  loop();
}

socket.on('state', (data) => {
  Object.assign(mbtiCounts, data.counts ?? {});
  particleSystem.setCounts(data.counts ?? {});
  renderLegend();
  if (data.session) {
    setSessionName(data.session.name);
  }
  setJoinUrl();
});

socket.on('spawn_particles', (data) => {
  const { mbti, color, counts, total, nickname } = data;
  Object.assign(mbtiCounts, counts ?? {});
  particleSystem.setCounts(counts ?? {});
  particleSystem.spawnMbti(mbti, color);
  renderLegend();
  totalNum.textContent = String(total || totalMbtiCounts());
  showToast(`✦ ${mbti} ${nickname} joined`, color);
  waiting.style.display = particleSystem.hasParticles() ? 'none' : '';
});

socket.on('session_reset', (data) => {
  for (const mbti of Object.keys(mbtiCounts) as Mbti[]) {
    delete mbtiCounts[mbti];
  }

  particleSystem.reset();
  particleSystem.seedAmbient(25);
  renderLegend();
  totalNum.textContent = '0';
  waiting.style.display = '';
  if (data.session) {
    setSessionName(data.session.name);
  }
  showToast('✦ 新场次已开始', '#ffffff');
});

socket.on('connect', () => {
  setJoinUrl();
});

sessionPanel.addEventListener('click', (event) => {
  if (event.target === sessionPanel) {
    closeSessionPanel();
  }
});

Object.assign(window, {
  openSessionPanel,
  closeSessionPanel,
  createNewSession,
  viewSession,
  deleteSession,
});

bootstrap();
