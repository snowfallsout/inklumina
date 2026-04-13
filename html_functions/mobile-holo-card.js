'use strict';

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function showHoloCard(mbti, color, nickname, phrase) {
  goTo('result');
  const CW = 1080, CH = 1920;
  const cv = document.createElement('canvas');
  cv.width = CW;
  cv.height = CH;
  const g = cv.getContext('2d');

  const pageBg = g.createRadialGradient(CW * .5, 0, 0, CW * .5, CH * .3, CW);
  pageBg.addColorStop(0, '#ffffff');
  pageBg.addColorStop(1, '#f4f5f8');
  g.fillStyle = pageBg;
  g.fillRect(0, 0, CW, CH);

  const cardW = CW - 120, cardH = CH - 220;
  const cardX = (CW - cardW) / 2, cardY = (CH - cardH) / 2 - 20;
  const radius = 56;

  g.save();
  g.shadowColor = 'rgba(40,50,80,0.22)';
  g.shadowBlur = 80;
  g.shadowOffsetY = 30;
  g.fillStyle = '#fff';
  roundRect(g, cardX, cardY, cardW, cardH, radius);
  g.fill();
  g.restore();

  g.save();
  roundRect(g, cardX, cardY, cardW, cardH, radius);
  g.clip();

  const top = lighten(color, .55);
  const upper = lighten(color, .25);
  const mid = color;
  const grad = g.createLinearGradient(0, cardY, 0, cardY + cardH);
  grad.addColorStop(0, top);
  grad.addColorStop(.35, upper);
  grad.addColorStop(.75, mid);
  grad.addColorStop(1, mid);
  g.fillStyle = grad;
  g.fillRect(cardX, cardY, cardW, cardH);

  const hl = g.createLinearGradient(0, cardY, 0, cardY + cardH * .4);
  hl.addColorStop(0, 'rgba(255,255,255,0.28)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hl;
  g.fillRect(cardX, cardY, cardW, cardH * .4);

  g.textBaseline = 'top';
  g.textAlign = 'left';
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.font = '600 26px Inter, sans-serif';
  g.fillText('COLORFIELD', cardX + 60, cardY + 60);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.font = '300 22px Inter, sans-serif';
  g.fillText('MBTI · PARTICLE ART', cardX + 60, cardY + 96);

  const now = new Date();
  const ts = now.getFullYear() + '.' + String(now.getMonth() + 1).padStart(2, '0') + '.' + String(now.getDate()).padStart(2, '0');
  g.textAlign = 'right';
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.font = '300 22px Inter, sans-serif';
  g.fillText(ts, cardX + cardW - 60, cardY + 96);
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.font = '600 26px Inter, sans-serif';
  g.fillText('Sixteen Personalities', cardX + cardW - 60, cardY + 60);

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const centerY = cardY + cardH * .42;
  g.fillStyle = 'rgba(0,0,0,0.18)';
  g.font = '900 360px Inter, Arial Black, sans-serif';
  g.fillText(mbti, CW / 2 + 6, centerY + 8);
  g.fillStyle = '#ffffff';
  g.fillText(mbti, CW / 2, centerY);

  if (nickname) {
    g.fillStyle = 'rgba(255,255,255,0.98)';
    g.font = '500 72px "PingFang SC", "Hiragino Sans GB", sans-serif';
    g.fillText(nickname, CW / 2, cardY + cardH * .70);
  }

  if (phrase) {
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.font = '300 44px "PingFang SC", "Hiragino Sans GB", serif';
    g.fillText(phrase, CW / 2, cardY + cardH * .76);
  }

  g.textBaseline = 'bottom';
  g.textAlign = 'left';
  g.fillStyle = 'rgba(255,255,255,0.65)';
  g.font = '300 18px Inter, sans-serif';
  g.fillText('INSIDE OUT THE COLOR', cardX + 60, cardY + cardH - 95);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.font = '600 28px Inter, sans-serif';
  g.fillText(mbti, cardX + 60, cardY + cardH - 60);

  g.textAlign = 'right';
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.font = '300 18px Inter, sans-serif';
  g.fillText('colorfield.live', cardX + cardW - 60, cardY + cardH - 95);
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.font = '500 28px Inter, sans-serif';
  g.fillText('@snowfallsout', cardX + cardW - 60, cardY + cardH - 60);

  g.restore();

  g.save();
  roundRect(g, cardX, cardY, cardW, cardH, radius);
  g.clip();
  g.globalAlpha = 0.06;
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = Math.random() > .5 ? '#fff' : '#000';
    g.fillRect(cardX + Math.random() * cardW, cardY + Math.random() * cardH, 1.5, 1.5);
  }
  g.restore();

  const img = document.getElementById('holo-card');
  if (img) {
    img.src = cv.toDataURL('image/jpeg', 0.92);
    img.style.display = 'block';
  }

  const hint = document.getElementById('save-hint');
  if (hint) hint.style.display = 'block';
}