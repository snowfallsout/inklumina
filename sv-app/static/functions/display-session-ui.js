'use strict';

function setSessionName(name) {
  const el = document.getElementById('session-name');
  if (!el) return;
  el.textContent = name ? `— ${name} —` : '';
}

function openSessionPanel() {
  document.getElementById('session-panel')?.classList.add('open');
  loadSessionHistory();
}

function closeSessionPanel() {
  document.getElementById('session-panel')?.classList.remove('open');
}

const sessionPanel = document.getElementById('session-panel');
if (sessionPanel) {
  sessionPanel.addEventListener('click', e => {
    if (e.target === sessionPanel) closeSessionPanel();
  });
}

const historyList = document.getElementById('sp-history-list');
if (historyList) {
  historyList.addEventListener('click', e => {
    const btn = e.target.closest('button[data-session-action]');
    if (!btn) return;
    const action = btn.dataset.sessionAction;
    const id = btn.dataset.sessionId;
    if (action === 'view') viewSession(id);
    if (action === 'delete') deleteSession(id, btn);
  });
}

function createNewSession() {
  const name = document.getElementById('sp-name-input').value.trim();
  if (!confirm(`开始新场次"${name || '新活动'}"？当前数据将存入历史记录。`)) return;

  fetch('/api/sessions/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        document.getElementById('sp-name-input').value = '';
        const ipEl = document.getElementById('sp-ip-input');
        if (ipEl && ipEl.value.trim()) generateJoinQR();
        else closeSessionPanel();
      }
    })
    .catch(e => alert('请求失败: ' + e.message));
}

function loadSessionHistory() {
  fetch('/api/sessions')
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('sp-history-list');
      if (!list) return;

      if (data.active) setSessionName(data.active.name);

      if (!data.history || data.history.length === 0) {
        list.innerHTML = '<div style="color:rgba(30,40,60,0.3);font-size:12px;padding:16px 0">暂无历史记录</div>';
        return;
      }

      list.innerHTML = data.history.map(s => {
        const d = new Date(s.createdAt);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return `
          <div class="sp-row">
            <div class="sp-row-info">
              <div class="sp-row-name">${escHtml(s.name)}</div>
              <div class="sp-row-meta">${dateStr} · ${s.total} 人参与</div>
            </div>
            <button class="sp-btn" data-session-action="view" data-session-id="${s.id}">查看</button>
            <button class="sp-btn danger" data-session-action="delete" data-session-id="${s.id}">删除</button>
          </div>`;
      }).join('');
    })
    .catch(e => console.warn('Failed to load sessions:', e));
}

function viewSession(id) {
  fetch(`/api/sessions/${id}`)
    .then(r => r.json())
    .then(s => {
      const lines = Object.entries(s.counts || {})
        .sort((a, b) => b[1] - a[1])
        .map(([m, n]) => `${m}: ${n}人`)
        .join('\n');
      alert(`${s.name}\n创建: ${new Date(s.createdAt).toLocaleString()}\n总人数: ${s.total}\n\n${lines || '无数据'}`);
    });
}

function deleteSession(id, btn) {
  if (!confirm('确认删除此历史记录？')) return;
  fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    .then(r => r.json())
    .then(d => {
      if (d.ok) btn.closest('.sp-row')?.remove();
    });
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
