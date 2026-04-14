'use strict';

(function buildLegend() {
  const root = document.getElementById('legend-rows');
  if (!root) return;
  for (const m of MBTI_ORDER) {
    const c = MBTI_COLORS[m];
    root.insertAdjacentHTML('beforeend', `
      <div class="row" id="r-${m}">
        <div class="dot" style="background:${c};--c:${c}"></div>
        <span class="lbl">${m}</span>
        <div class="track"><div class="fill" id="f-${m}" style="background:${c}"></div></div>
        <span class="cnt" id="c-${m}">0</span>
      </div>`);
  }
})();

function renderLegend() {
  const counts = (typeof mbtiCounts !== 'undefined' && mbtiCounts) ? mbtiCounts : {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalEl = document.getElementById('total-num');
  if (totalEl) totalEl.textContent = total;

  for (const m of MBTI_ORDER) {
    const n = counts[m] || 0;
    const pct = total > 0 ? n / total * 100 : 0;
    document.getElementById(`r-${m}`)?.classList.toggle('on', n > 0);
    const f = document.getElementById(`f-${m}`);
    const c = document.getElementById(`c-${m}`);
    if (f) f.style.width = pct + '%';
    if (c) c.textContent = n;
  }
}
