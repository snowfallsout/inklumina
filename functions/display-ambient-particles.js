'use strict';

function seedAmbient(n) {
  for (let i = 0; i < n; i++) {
    const col = AMBIENT_COLS[i % AMBIENT_COLS.length];
    const p = new Particle(Math.random() * W, Math.random() * H, col, null);
    if (i < 3) {
      p.sizeClass = 'blob';
      p.size = 14 + Math.random() * 18;
      p.alphaT = Math.random() * .08 + .04;
      p._sprites = getDotSprite(col);
    } else {
      p.sizeClass = 'dot';
      p.size = Math.random() * 4 + 1.5;
      p.alphaT = Math.random() * .15 + .05;
    }
    particles.push(p);
  }
}
