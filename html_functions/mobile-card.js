'use strict';

const sel = [null, null, null, null];

function updateCard() {
  const card = document.getElementById('mbti-card');
  if (!card) return;

  const complete = sel.every(Boolean);
  let c0, c1, c2, c3;

  if (complete) {
    const main = MBTI_COLORS[sel.join('')] || '#888';
    c0 = lighten(main, .55);
    c1 = lighten(main, .25);
    c2 = mix(main, LETTER_COLORS[sel[2]] || main, .25);
    c3 = main;
  } else if (sel.some(Boolean)) {
    const picks = sel.map(s => s ? LETTER_COLORS[s] : null);
    const fallback = '#cfd2de';
    c0 = picks[0] ? lighten(picks[0], .6) : '#eceef5';
    c1 = picks[1] ? lighten(picks[1], .35) : (picks[0] ? lighten(picks[0], .4) : '#dcdee7');
    c2 = picks[2] ? lighten(picks[2], .1) : (picks[1] ? lighten(picks[1], .15) : '#cfd2de');
    c3 = picks[3] || picks[2] || picks[1] || picks[0] || fallback;
  } else {
    c0 = '#eceef5'; c1 = '#dcdee7'; c2 = '#cfd2de'; c3 = '#bec2d2';
  }

  card.style.setProperty('--cc0', c0);
  card.style.setProperty('--cc1', c1);
  card.style.setProperty('--cc2', c2);
  card.style.setProperty('--cc3', c3);
}

function pick(dim, val, btn) {
  document.querySelectorAll('[data-d="' + dim + '"]').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  sel[dim] = val;

  const placeholders = ['M', 'B', 'T', 'I'];
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('pl-' + i);
    if (!el) continue;
    if (sel[i]) {
      el.textContent = sel[i];
      el.classList.remove('placeholder');
    } else {
      el.textContent = placeholders[i];
      el.classList.add('placeholder');
    }
  }

  updateCard();

  const complete = sel.every(Boolean);
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.disabled = !complete;

  if (complete) {
    const mbti = sel.join('');
    const cnEl = document.getElementById('card-name-cn');
    const enEl = document.getElementById('card-name-en');
    const numEl = document.getElementById('card-num');
    if (cnEl) cnEl.textContent = MBTI_NAMES[mbti] || '';
    if (enEl) enEl.textContent = mbti;
    if (numEl) numEl.textContent = mbti;
  } else {
    const partial = sel.filter(Boolean).join('');
    const cnEl = document.getElementById('card-name-cn');
    const enEl = document.getElementById('card-name-en');
    const numEl = document.getElementById('card-num');
    if (cnEl) cnEl.textContent = partial || '—';
    if (enEl) enEl.textContent = partial ? `${partial.length}/4` : 'Select four dimensions';
    if (numEl) numEl.textContent = partial || '—';
  }
}