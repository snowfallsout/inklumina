'use strict';

function showToast(msg, color) {
  const ui = document.getElementById('ui');
  if (!ui) return;
  ui.querySelectorAll('.toast-wrap').forEach(el => el.remove());
  const wrap = document.createElement('div');
  wrap.className = 'toast-wrap';
  wrap.innerHTML = `<div class="toast-pill" style="border-color:${color}55;text-shadow:0 0 18px ${color}">${msg}</div>`;
  ui.appendChild(wrap);
  setTimeout(() => wrap.remove(), 3000);
}
