// @ts-nocheck
// ── Glow sprite cache ──────────────────────────────────────────────────────────
// Three sprite variants per MBTI type, pre-baked at startup:
//   dot   — bright core + halo (160×160)  — for 85% small particles
//   blob  — soft multi-stop gradient + procedural texture (256×256) — 12% medium
//   field — ultra-soft outer wash (320×320) — 3% large color fields
const spriteSetCache = new Map();  // mbti|color → { dot, blob, field }

const DOT_HALF   = 80;    // 160×160
const BLOB_HALF  = 128;   // 256×256
const FIELD_HALF = 160;   // 320×320
const DOT_REF_R  = 16;    // reference radius for dot sprite

function _makeCanvas(half) {
  const sz = half * 2;
  const c  = document.createElement('canvas');
  c.width = c.height = sz;
  return { canvas: c, ctx: c.getContext('2d'), cx: half, cy: half, sz };
}

// Dot sprite — white-hot core + single-color halo (original look)
function _makeDot(color) {
  const { canvas, ctx: g, cx, cy, sz } = _makeCanvas(DOT_HALF);

  // Outer glow
  const g1 = g.createRadialGradient(cx, cy, DOT_REF_R * .4, cx, cy, DOT_HALF);
  g1.addColorStop(0,  color + 'BB');
  g1.addColorStop(.5, color + '44');
  g1.addColorStop(1,  color + '00');
  g.fillStyle = g1;
  g.fillRect(0, 0, sz, sz);

  // Ink-drop core — saturated color center, no white (works on light bg)
  const g2 = g.createRadialGradient(
    cx - DOT_REF_R * .28, cy - DOT_REF_R * .28, DOT_REF_R * .08,
    cx, cy, DOT_REF_R
  );
  g2.addColorStop(0,   color);
  g2.addColorStop(.22, color + 'DD');
  g2.addColorStop(.72, color + 'BB');
  g2.addColorStop(1,   color + '00');
  g.beginPath();
  g.arc(cx, cy, DOT_REF_R, 0, TWO_PI);
  g.fillStyle = g2;
  g.fill();

  return { canvas, half: DOT_HALF, refR: DOT_REF_R };
}

// Blob sprite — 完美复刻偏心渐变流体球
function _makeBlob(palette) {
  const { canvas, ctx: g, cx, cy, sz } = _makeCanvas(BLOB_HALF);
  const R = BLOB_HALF * 0.85;  

  // 核心视觉偏移：让深色核心稍微偏离中心，制造 3D 偏心质感 (参考图效果)
  const offsetX = cx - R * 0.25; 
  const offsetY = cy + R * 0.15; 

  // 使用 Canvas 的径向渐变，从偏心点扩散到全局
  const grad = g.createRadialGradient(offsetX, offsetY, 0, cx, cy, R);
  
  // 完全按照你的 CSS 逻辑进行映射
  grad.addColorStop(0,    palette.core);        // 0% 核心色
  grad.addColorStop(0.45, palette.mid);         // 45% 中间色
  grad.addColorStop(0.85, palette.edge + '88'); // 85% 边缘色 (带透明度过渡)
  grad.addColorStop(1,    palette.edge + '00'); // 100% 边缘色完全透明，融入背景
  
  g.fillStyle = grad;
  g.beginPath();
  g.arc(cx, cy, R, 0, TWO_PI);
  g.fill();

  // (移除掉原来复杂的噪点圆圈，保持参考图中纯净的流体渐变美感)

  return { canvas, half: BLOB_HALF, refR: BLOB_HALF * 0.35 };
}

// Field sprite — ultra-soft low-opacity wash
function _makeField(palette) {
  const { canvas, ctx: g, cx, cy, sz } = _makeCanvas(FIELD_HALF);
  const R = FIELD_HALF * .95;

  // 使用最新的 palette.edge 替换掉旧的 outer 和 accent
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, R);
  grad.addColorStop(0,   palette.mid  + '55');
  grad.addColorStop(.3,  palette.edge + '40');
  grad.addColorStop(.65, palette.edge + '22');
  grad.addColorStop(1,   palette.edge + '00');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(cx, cy, R, 0, TWO_PI);
  g.fill();

  // Subtle procedural wisps
  g.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 12; i++) {
    const bx = cx + (Math.random() - .5) * R;
    const by = cy + (Math.random() - .5) * R;
    const r  = R * (.2 + Math.random() * .35);
    const gw = g.createRadialGradient(bx, by, 0, bx, by, r);
    const c  = i % 2 === 0 ? palette.core : palette.mid;
    gw.addColorStop(0, c + '20');
    gw.addColorStop(1, c + '00');
    g.fillStyle = gw;
    g.beginPath();
    g.arc(bx, by, r, 0, TWO_PI);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';

  return { canvas, half: FIELD_HALF, refR: FIELD_HALF * .25 };
}
function getSpriteSet(mbti) {
  if (spriteSetCache.has(mbti)) return spriteSetCache.get(mbti);
  const color   = MBTI_COLORS[mbti];
  const palette = MBTI_PALETTES[mbti] || { core: color, mid: color, edge: color };
  const set = {
    dot:   _makeDot(color),
    blob:  _makeBlob(palette),
    field: _makeField(palette),
  };
  spriteSetCache.set(mbti, set);
  return set;
}

// Fallback for ambient particles (no MBTI type) — use dot sprite only
function getDotSprite(color) {
  const key = '__dot_' + color;
  if (spriteSetCache.has(key)) return spriteSetCache.get(key);
  const dot = _makeDot(color);
  const set = { dot, blob: dot, field: dot };
  spriteSetCache.set(key, set);
  return set;
}

// Pre-warm all 16 MBTI sprite sets + ambient colors
const AMBIENT_COLS = ['#003153','#C8A2C8','#F9A602','#9DC183','#40E0D0'];
MBTI_ORDER.forEach(m => getSpriteSet(m));
AMBIENT_COLS.forEach(c => getDotSprite(c));

// ── Particle class ─────────────────────────────────────────────────────────────
// Size-class parameters (refined for delicate look + wide size variance):
//   dot:   88% — tiny to small (1.5-8px), varied alpha, full trail
//   blob:   9% — medium soft blobs (12-30px), lower alpha, medium trail
//   field:  3% — large color fields (35-65px), very low alpha, short trail
const SIZE_CLASS_PARAMS = {
  // 保持小而锐利，稍微降低了一点最大速度，让光绘更丝滑
  dot:   { sizeMin:2,  sizeMax:8,  alphaMin:.35, alphaMax:.95, speedCap:5,   drag:.990, accel:.45, trailMax:10 },
  
  // 保持水墨感，阻力稍微调大一点 (drag:.982)，让它们不要像小点一样乱跑
  blob:  { sizeMin:12, sizeMax:30, alphaMin:.12, alphaMax:.30, speedCap:3.5, drag:.982, accel:.20, trailMax:6  },
  
  // 保持巨大的氛围感，速度进一步降低，让它们成为安静的背景光晕
  field: { sizeMin:35, sizeMax:65, alphaMin:.04, alphaMax:.12, speedCap:1.5, drag:.970, accel:.06, trailMax:2  },
};

function pickSizeClass() {
  const r = Math.random();
  if (r < .03) return 'field';
  if (r < .12) return 'blob';
  return 'dot';
}

class Particle {
  constructor(x, y, color, mbtiType) {
    this.x  = x;  this.y  = y;
    this.color   = color;
    this.mbti    = mbtiType || null;

    // Size class determines visual variant + physics
    this.sizeClass = pickSizeClass();
    const p = SIZE_CLASS_PARAMS[this.sizeClass];

    this.vx = (Math.random() - .5) * (this.sizeClass === 'dot' ? 14 : 6);
    this.vy = (Math.random() - .5) * (this.sizeClass === 'dot' ? 14 : 6) - 2;
    this.size    = p.sizeMin + Math.random() * (p.sizeMax - p.sizeMin);
    this.alpha   = 0;
    this.alphaT  = p.alphaMin + Math.random() * (p.alphaMax - p.alphaMin);
    this.state   = 'born';
    this.age     = 0;
    this.trail      = [];
    this.myTrailMax = Math.floor(Math.random() * 4) + 7;  // individual trail length variance (was 5-40, now 4-16)
    this.orbitA  = Math.random() * TWO_PI;
    this.orbitR  = 55 + Math.random() * 90;
    this.orbitSpd= (.022 + Math.random() * .03) * (Math.random() > .5 ? 1 : -1);
    this.targetF = null;
    this.phaseOffset = Math.random() * TWO_PI;  // lifecycle pulse phase

    // Cache sprite set reference
    this._sprites = mbtiType ? getSpriteSet(mbtiType) : getDotSprite(color);
  }

  update(faces, emotion) {
    this.age++;
    this.alpha = Math.min(this.alphaT, this.alpha + .04);

    const p = SIZE_CLASS_PARAMS[this.sizeClass];

    // Trail — per-particle length for visual variety
    if (this.age % 2 === 0) {
      this.trail.push({ x: this.x, y: this.y, s: this.size });
      if (this.trail.length > this.myTrailMax) this.trail.splice(0, this.trail.length - this.myTrailMax);
    }

    // ══════════════════════════════════════════════════════════
    // 双手捏合：最高优先级 — 粒子被最近的手吸引（撕拉效果）
    // ══════════════════════════════════════════════════════════
    if (activePinchPoints.length > 0 && this.sizeClass !== 'field') {
      // 找到距离本粒子最近的捏合点
      let nearest = activePinchPoints[0];
      if (activePinchPoints.length > 1) {
        const d0 = (activePinchPoints[0].x-this.x)**2 + (activePinchPoints[0].y-this.y)**2;
        const d1 = (activePinchPoints[1].x-this.x)**2 + (activePinchPoints[1].y-this.y)**2;
        nearest = d0 < d1 ? activePinchPoints[0] : activePinchPoints[1];
      }
      const pdx = nearest.x - this.x;
      const pdy = nearest.y - this.y;
      const pd  = Math.sqrt(pdx*pdx + pdy*pdy) || 1;
      const str = Math.min(6.0, 500 / pd) * 0.22;
      this.vx += (pdx / pd) * str + (Math.random() - .5) * 0.4;
      this.vy += (pdy / pd) * str + (Math.random() - .5) * 0.4;
      this.vx *= 0.80;
      this.vy *= 0.80;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20) this.x = W + 10;
      if (this.x > W + 20) this.x = -10;
      if (this.y < -20) this.y = H + 10;
      if (this.y > H + 20) this.y = -10;
      return;
    }

    // State machine — 仅在无捏合手势时执行
    if (this.age < 20) {
      this.state = 'born';
    } else if (this.sizeClass === 'field') {
      this.state = 'free';
    } else {
      const nf  = nearestFace(faces, this.x, this.y);
      const d2  = nf ? dist2sq(this.x, this.y, nf.x, nf.y) : Infinity;
      if (nf && d2 < 260 * 260) {
        this.targetF = nf;
        this.state   = nf.smile ? 'swirling' : 'attracted';
      } else {
        this.state = 'free';
      }
    }

    switch (this.state) {
      case 'born':
      case 'free': {
        this.vx += (Math.random() - .5) * p.accel;
        this.vy += (Math.random() - .5) * p.accel;
        if (this.mbti && this.sizeClass === 'dot' && this.age % 4 === 0) {
          const siblings = mbtiParticles[this.mbti];
          if (siblings && siblings.length > 1) {
            const other = siblings[Math.floor(Math.random() * siblings.length)];
            if (other !== this) {
              const dx = other.x - this.x, dy = other.y - this.y;
              const d  = Math.sqrt(dx*dx + dy*dy) || 1;
              if (d > 30 && d < 350) {
                this.vx += (dx / d) * .012;
                this.vy += (dy / d) * .012;
              }
            }
          }
        }
        this.vx += (W * .5 - this.x) * .00003;
        this.vy += (H * .5 - this.y) * .00003;
        const cap2 = p.speedCap * p.speedCap;
        const sp2 = this.vx*this.vx + this.vy*this.vy;
        if (sp2 > cap2) { const inv = p.speedCap / Math.sqrt(sp2); this.vx *= inv; this.vy *= inv; }
        this.vx *= p.drag; this.vy *= p.drag;
        break;
      }
      case 'attracted': {
        const f  = this.targetF;
        const dx = f.x - this.x, dy = f.y - this.y;
        const d  = Math.sqrt(dx*dx + dy*dy) || 1;
        const ft = Math.min(2.2, 90 / d) * .085;
        this.vx += dx/d * ft; this.vy += dy/d * ft;
        this.vx *= .92; this.vy *= .92;
        break;
      }
      case 'swirling': {
        const f = this.targetF;
        this.orbitA += this.orbitSpd * 1.6;
        const tx = f.x + Math.cos(this.orbitA) * this.orbitR;
        const ty = f.y + Math.sin(this.orbitA) * this.orbitR;
        this.vx += (tx - this.x) * .08;
        this.vy += (ty - this.y) * .08;
        this.vx *= .86; this.vy *= .86;
        break;
      }
    }

        // Wrap around edges ...
    this.x += this.vx;
    this.y += this.vy;
    // Wrap around edges — particles never leave the canvas
    if (this.x < -20) this.x = W + 10;
    if (this.x > W + 20) this.x = -10;
    if (this.y < -20) this.y = H + 10;
    if (this.y > H + 20) this.y = -10;
  }

  draw(ctx) {
    // Pick the correct sprite variant for this size class
    const spriteEntry = this._sprites[this.sizeClass];
    const spr  = spriteEntry.canvas;
    const half = spriteEntry.half;
    const refR = spriteEntry.refR;

    // Lifecycle pulse — subtle alpha breathing
    const pulse = 1 + Math.sin(this.age * 0.018 + this.phaseOffset) * 0.2;
    const baseAlpha = this.alpha * pulse;

    // Trail — longer, more visible, creates flowing ribbon effect
    const tr = this.trail;
    for (let i = 1; i < tr.length; i++) {
      const t  = i / tr.length;
      const pt = tr[i];
      const hw = half * (pt.s / refR) * t * .7;
      if (hw < .5) continue;
      ctx.globalAlpha = t * baseAlpha * .45;
      ctx.drawImage(spr, pt.x - hw, pt.y - hw, hw * 2, hw * 2);
    }

    // Core sprite
    const hw = half * (this.size / refR);
    ctx.globalAlpha = baseAlpha;
    ctx.drawImage(spr, this.x - hw, this.y - hw, hw * 2, hw * 2);

    // Diamond sparkle — white rhombus star, more frequent
    if (this.sizeClass === 'dot' && Math.random() < .03) {
      drawDiamondSparkle(ctx, this.x, this.y, this.size, baseAlpha);
    }

    ctx.globalAlpha = 1;
  }
}

// White diamond/rhombus sparkle with 4-pointed star rays
function drawDiamondSparkle(ctx, x, y, size, alpha) {
  const s = size * (2.5 + Math.random() * 2);  // long rays
  const d = s * .22;                             // short rays (diamond shape)
  ctx.globalAlpha = alpha * (.3 + Math.random() * .4);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = .6;
  ctx.beginPath();
  // Vertical + horizontal long rays
  ctx.moveTo(x, y - s);  ctx.lineTo(x, y + s);
  ctx.moveTo(x - s, y);  ctx.lineTo(x + s, y);
  // Diagonal short rays (creates diamond effect)
  ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d);
  ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d);
  ctx.stroke();
  // Bright center dot
  ctx.globalAlpha = alpha * .6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, .8, 0, TWO_PI);
  ctx.fill();
}

// Squared distance — avoids sqrt in the hot path
function dist2sq(ax, ay, bx, by) {
  const dx = ax-bx, dy = ay-by;
  return dx*dx + dy*dy;
}

function nearestFace(faces, px, py) {
  if (!faces.length) return null;
  let best = null, bd = Infinity;
  for (const f of faces) {
    const d = dist2sq(px, py, f.x, f.y);
    if (d < bd) { bd = d; best = f; }
  }
  return best;
}

// ── Particle pool ──────────────────────────────────────────────────────────────
// Design: every MBTI type stays visible forever.
//   - Each type gets a quota = proportional slice of MAX_MBTI_PARTICLES
//     (at least MIN_PER_TYPE, at most MAX_PER_TYPE).
//   - When over quota for a type, oldest of that type is pruned.
//   - Ambient drifters occupy a separate, fixed budget.
const particles        = [];        // all live particles
const mbtiParticles    = {};        // mbti → Particle[]  (index for fast pruning)
const MAX_MBTI_TOTAL   = 800;       // budget shared across all MBTI types
const MIN_PER_TYPE     = 20;        // guaranteed floor so early joiners stay visible
const MAX_PER_TYPE     = 120;       // hard ceiling per type
const SPAWN_PER_JOIN   = 12;        // particles spawned when someone joins (fewer = more delicate)

function quotaForType(mbti) {
  // Total MBTI participants across all types
  const total = Object.values(mbtiCounts).reduce((a, b) => a + b, 0) || 1;
  const count = mbtiCounts[mbti] || 1;
  const raw   = Math.floor((count / total) * MAX_MBTI_TOTAL);
  return Math.max(MIN_PER_TYPE, Math.min(MAX_PER_TYPE, raw));
}

function pruneType(mbti) {
  const arr = mbtiParticles[mbti];
  if (!arr) return;
  const quota = quotaForType(mbti);
  while (arr.length > quota) {
    const p = arr.shift();               // remove oldest of this type
    const idx = particles.indexOf(p);
    if (idx !== -1) particles.splice(idx, 1);
  }
}

function pruneAllTypes() {
  for (const mbti of Object.keys(mbtiParticles)) pruneType(mbti);
}

function spawnMBTI(mbti, color) {
  if (!mbtiParticles[mbti]) mbtiParticles[mbti] = [];

  // Big Bang: all particles burst from screen center
  const bx = W / 2, by = H / 2;

  for (let i = 0; i < SPAWN_PER_JOIN; i++) {
    const p = new Particle(bx, by, color, mbti);
    // Override initial velocity — explosive burst
    p.vx = (Math.random() - .5) * 40;
    p.vy = (Math.random() - .5) * 40;
    particles.push(p);
    mbtiParticles[mbti].push(p);
  }

  // Re-balance: quota shrank for others because this type's share grew
  pruneAllTypes();
}

// ── Camera + MediaPipe ─────────────────────────────────────────────────────────
// Architecture: ONE getUserMedia stream → ONE rAF processing loop → FaceMesh + Hands
// Never use MediaPipe Camera class — it fights with the manual stream for srcObject.

// 核心修复：坐标映射换算器 (修复裁切导致的错位)
function mapToCanvas(normX, normY) {
  if (!video || video.videoWidth === 0) return { x: 0, y: 0 };
  const scale = Math.max(W / video.videoWidth, H / video.videoHeight);
  const dw = video.videoWidth * scale;
  const dh = video.videoHeight * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;
  
  // 结合镜像翻转 (1 - normX) 和裁切偏移量
  return {
    x: dx + (1 - normX) * dw,
    y: dy + normY * dh
  };
}

let faces   = [];
let emotion = 'neutral';
const video = document.getElementById('video-bg');



// Model instances (assigned once models load)
let _faceMesh = null;
let _hands    = null;

// Latest raw hand results for skeleton rendering
let handsResults      = null;
let activePinchPoints = [];   // 最多2个捏合点，每只手独立一个

// ── Draw Mode State Machine ────────────────────────────────────────────────────
// Phases: 'idle' → 'gathering' → 'drawing' → 'dissolving' → 'idle'
const DRAW_MODE = {
  phase: 'idle',       // current phase
  strokePath: [],      // recorded hand trajectory [{x,y,t}]
  gatherTimer: 0,      // frames spent with enough particles near pinch
  dissolveTimer: 0,    // frames since pinch released
};

// Thresholds
const GATHER_RADIUS    = 120;   // px — how close particles must be to count as "gathered"
const GATHER_THRESHOLD = 0.55;  // 55% of non-field particles must be within radius
const GATHER_FRAMES    = 40;    // sustained frames needed to trigger draw mode
const DISSOLVE_FRAMES  = 90;    // frames for dissolve animation before returning to idle
const MAX_PATH_POINTS  = 800;   // max trajectory points stored

// Each particle gets a drawTarget when in drawing mode (a point on the stroke path)
// We store it on the particle itself as p._drawTarget = {x, y}

// Standard MediaPipe hand bone connections (21 landmarks)
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

// 核心修復 1：防崩潰且自動節流的多執行緒非同步處理
let _processing = false;
let _frameCounter = 0;

async function _processFrame() {
  // 先排下一帧：即使本帧 send() 卡死或抛错，循环也不会中断
  requestAnimationFrame(_processFrame);
  if (!_processing || video.readyState < 2) return;

  _frameCounter++;
  try {
    // 错帧推理：FaceMesh 偶数帧、Hands 奇数帧。粒子仍 60fps，检测 30fps 足够
    if (_faceMesh && (_frameCounter & 1) === 0) {
      await _faceMesh.send({ image: video });
    } else if (_hands) {
      await _hands.send({ image: video });
    }
  } catch (e) { /* 吞掉偶然丢帧 */ }
}

// 核心修復 2：強制等待引擎就緒
function setupCamera() {
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
    .then(stream => {
      video.srcObject = stream;
      // 注意這裡加上了 async
      video.onloadedmetadata = async () => {
        video.play();
        video.classList.add('ready');
        
        // 1. 先建立模型的外殼
        _initFaceMesh();
        _initHands();
        
        // 2. 關鍵修復：強制等待底層 WebAssembly 引擎完全載入完畢
        try {
          if (_faceMesh) await _faceMesh.initialize();
          if (_hands)    await _hands.initialize();
        } catch (e) {
          console.warn("AI Engine Init Error:", e);
        }
        
        // 3. 所有引擎確定就緒後，才放行讓 _processFrame 開始塞入畫面
        _processing = true;   
      };
    })
    .catch(err => {
      console.warn('Camera unavailable:', err.message);
      document.getElementById('emotion-badge').textContent = '● NO CAMERA';
    });
}

function _initFaceMesh() {
  if (typeof FaceMesh === 'undefined') return;
  _faceMesh = new FaceMesh({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`
  });
  _faceMesh.setOptions({
    maxNumFaces: 6, refineLandmarks: false,
    minDetectionConfidence: .5, minTrackingConfidence: .5,
  });
  _faceMesh.onResults(results => {
    faces = [];
    let smiles = 0;
    if (results.multiFaceLandmarks) {
      for (const lm of results.multiFaceLandmarks) {
        // 使用新的坐标换算器
        const pt = mapToCanvas(lm[168].x, lm[168].y);
        const mw = Math.abs(lm[291].x - lm[61].x);
        const ew = Math.abs(lm[263].x - lm[33].x);
        const smile = ew > 0 && (mw / ew) > .57;
        if (smile) smiles++;
        faces.push({ x: pt.x, y: pt.y, smile });
      }
    }
    emotion = (smiles > faces.length * .5 && faces.length > 0) ? 'smile' : 'neutral';
    updateEmotionBadge();
  });
}

function _initHands() {
  if (typeof Hands === 'undefined') {
    console.warn('MediaPipe Hands library not loaded');
    return;
  }
  _hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}`
  });
  // 降低检测置信度阈值，让手更容易被识别到
  _hands.setOptions({
    maxNumHands: 2,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6,
    modelComplexity: 0,   // 0=lite速度快, 1=full更准
  });
  _hands.onResults(res => {
    handsResults      = res;
    activePinchPoints = [];   // 每帧清空，重新填充

    const badge = document.getElementById('hand-badge');
    if (!res.multiHandLandmarks || res.multiHandLandmarks.length === 0) {
      if (badge) badge.textContent = '✋ NO HAND';
      return;
    }

    const parts = [`✋ ${res.multiHandLandmarks.length}H`];
    for (const lm of res.multiHandLandmarks) {
      const indexTip  = mapToCanvas(lm[8].x, lm[8].y);
      const thumbTip  = mapToCanvas(lm[4].x, lm[4].y);
      const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
      const pinched   = pinchDist < 60;
      parts.push(`${Math.round(pinchDist)}px${pinched ? '🤌' : ''}`);
      if (pinched) {
        activePinchPoints.push({
          x: (indexTip.x + thumbTip.x) / 2,
          y: (indexTip.y + thumbTip.y) / 2,
        });
      }
    }
    if (badge) badge.textContent = parts.join(' | ');
  });
}

// ── Camera toggle ─────────────────────────────────────────────────────────────
let _camOn = false;   // 默认关闭

function toggleCamera() {
  _camOn = !_camOn;
  const btn = document.getElementById('cam-toggle');
  btn.textContent = _camOn ? '◎ 摄像头 ON' : '◎ 摄像头 OFF';
  btn.classList.toggle('on', _camOn);
}

// ── Smile Emoji System ────────────────────────────────────────────────────────
// emoji 池：色块 + 天气 + 植物
const SMILE_EMOJIS = [
  // 色块 & 光效
  '🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤',
  '🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳',
  '✨','💫','⚡','🔥','💥','🌟','⭐','🌈',
  // 天气
  '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️',
  '❄️','☃️','⛄','🌬️','💨','🌀','🌊','💧','💦','☔',
  '⛱️','🌙','🌛','🌜','🌚','🌝','🌞','☄️','🌪️',
  // 植物
  '🌱','🌿','🍀','🍃','🍂','🍁','🌵','🌾','🎋','🎍',
  '🌺','🌸','🌼','🌻','🌹','🥀','🌷','🪷','🪴',
  '🌲','🌳','🌴','🪵','🪨',
];

function _faceHash(x, y) {
  return `${Math.round(x/32)}_${Math.round(y/32)}`;
}

function _randomEmoji() {
  return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)];
}

// 上一帧每张脸的smile状态，用来检测"刚刚开始笑"的边缘触发
const _prevSmile = new Map();

// 全局唯一的 emoji 元素，微笑时显示，不微笑时隐藏
let _emojiEl = null;

function _getOrCreateEmojiEl() {
  if (!_emojiEl) {
    _emojiEl = document.createElement('div');
    _emojiEl.className = 'smile-emoji-persistent';
    document.getElementById('ui').appendChild(_emojiEl);
  }
  return _emojiEl;
}

// 用全局 bool 追踪"上一帧是否有人笑"
// 不用坐标 hash，避免人物移动时 hash 变化导致 emoji 不断刷新
let _wasAnySmiling = false;

function _tickSmileEmoji() {
  const anySmiling  = faces.some(f => f.smile);
  const el          = _getOrCreateEmojiEl();

  if (anySmiling) {
    const smilingFace = faces.find(f => f.smile);

    if (!_wasAnySmiling) {
      // 从"不笑"→"笑"的第一帧：随机选一个 emoji，此后锁定不再换
      el.textContent = _randomEmoji();
    }
    // 持续跟随人脸位置（emoji 内容不变，只更新坐标）
    el.style.left      = smilingFace.x + 'px';
    el.style.top       = (smilingFace.y - 70) + 'px';
    el.style.opacity   = '1';
    el.style.transform = 'scale(1)';
  } else {
    // 没有人笑：淡出隐藏
    el.style.opacity   = '0';
    el.style.transform = 'scale(0.5)';
  }

  _wasAnySmiling = anySmiling;
}

function updateEmotionBadge() {
  const el = document.getElementById('emotion-badge');
  if (!faces.length) {
    el.className = '';
    el.textContent = '● FACE TRACKING';
  } else if (emotion === 'smile') {
    el.className = 'smile';
    el.textContent = '✦ SMILE DETECTED';
  } else {
    el.className = '';
    el.textContent = `● ${faces.length} FACE${faces.length>1?'S':''} DETECTED`;
  }
}

requestAnimationFrame(_processFrame);  // start loop (paused until _processing = true)
setupCamera();

// ── Socket.IO ──────────────────────────────────────────────────────────────────
const socket     = io();
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
  document.getElementById('total-num').textContent = total || Object.values(mbtiCounts).reduce((a,b)=>a+b,0);
  showToast(`✦ ${mbti} ${nickname} joined`, color);
  if (particles.length > 0) {
    document.getElementById('waiting').style.display = 'none';
  }
});

// When a new session starts, reset the canvas and counts
socket.on('session_reset', data => {
  // Clear all MBTI counts
  for (const k of Object.keys(mbtiCounts)) delete mbtiCounts[k];
  // Remove all MBTI particles (keep ambient)
  for (const mbti of Object.keys(mbtiParticles)) {
    for (const p of mbtiParticles[mbti]) {
      const idx = particles.indexOf(p);
      if (idx !== -1) particles.splice(idx, 1);
    }
    delete mbtiParticles[mbti];
  }
  renderLegend();
  document.getElementById('total-num').textContent = '0';
  document.getElementById('waiting').style.display = '';
  if (data.session) setSessionName(data.session.name);
  showToast('✦ 新场次已开始', '#ffffff');
});

// ── Legend ─────────────────────────────────────────────────────────────────────
(function buildLegend() {
  const root = document.getElementById('legend-rows');
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
  const total = Object.values(mbtiCounts).reduce((a,b)=>a+b,0);
  document.getElementById('total-num').textContent = total;
  for (const m of MBTI_ORDER) {
    const n   = mbtiCounts[m] || 0;
    const pct = total > 0 ? n/total*100 : 0;
    document.getElementById(`r-${m}`)?.classList.toggle('on', n > 0);
    const f = document.getElementById(`f-${m}`);
    const c = document.getElementById(`c-${m}`);
    if (f) f.style.width = pct + '%';
    if (c) c.textContent = n;
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function showToast(msg, color) {
  const ui = document.getElementById('ui');
  ui.querySelectorAll('.toast-wrap').forEach(el => el.remove());
  const wrap = document.createElement('div');
  wrap.className = 'toast-wrap';
  wrap.innerHTML = `<div class="toast-pill" style="border-color:${color}55;text-shadow:0 0 18px ${color}">${msg}</div>`;
  ui.appendChild(wrap);
  setTimeout(() => wrap.remove(), 3000);
}

// ── Ambient particles (separate budget, never pruned by MBTI logic) ───────────
function seedAmbient(n) {
  for (let i = 0; i < n; i++) {
    const col = AMBIENT_COLS[i % AMBIENT_COLS.length];
    const p   = new Particle(Math.random()*W, Math.random()*H, col, null);
    // Override sizeClass: mostly dots, some blobs for visual richness
    if (i < 3) {
      p.sizeClass = 'blob';
      p.size   = 14 + Math.random() * 18;
      p.alphaT = Math.random() * .08 + .04;
      p._sprites = getDotSprite(col);
    } else {
      p.sizeClass = 'dot';
      p.size   = Math.random() * 4 + 1.5;
      p.alphaT = Math.random() * .15 + .05;
    }
    particles.push(p);
  }
}
seedAmbient(25);

// ── Render loop ────────────────────────────────────────────────────────────────
// ── Draw Mode: state machine tick (called once per frame) ────────────────────
function _tickDrawMode() {
  const dm = DRAW_MODE;
  const nonFieldParticles = particles.filter(p => p.sizeClass !== 'field');
  const total = nonFieldParticles.length || 1;

  if (activePinchPoints.length > 0) {
    const _ap = activePinchPoints[0];
    // Count particles within gather radius
    const gathered = nonFieldParticles.filter(p => {
      const dx = p.x - _ap.x, dy = p.y - _ap.y;
      return dx*dx + dy*dy < GATHER_RADIUS * GATHER_RADIUS;
    }).length;
    const ratio = gathered / total;

    if (dm.phase === 'idle' || dm.phase === 'gathering') {
      dm.phase = 'gathering';
      if (ratio >= GATHER_THRESHOLD) {
        dm.gatherTimer++;
        const pct = Math.round(dm.gatherTimer / GATHER_FRAMES * 100);
        const badge = document.getElementById('hand-badge');
        if (badge) badge.textContent = `🤌 GATHERING ${pct}% — keep still…`;
      } else {
        dm.gatherTimer = Math.max(0, dm.gatherTimer - 2);
      }

      if (dm.gatherTimer >= GATHER_FRAMES) {
        dm.phase = 'drawing';
        dm.strokePath = [];
        dm.gatherTimer = 0;
        const badge = document.getElementById('hand-badge');
        if (badge) badge.textContent = '✏️ DRAWING MODE — move to paint!';
      }
    }

    if (dm.phase === 'drawing') {
      dm.strokePath.push({ x: _ap.x, y: _ap.y, t: Date.now() });
      if (dm.strokePath.length > MAX_PATH_POINTS) dm.strokePath.shift();

      // Assign each particle a target point on the stroke path
      // Particles spread evenly along the path for a "living brush stroke" look
      if (dm.strokePath.length > 2) {
        for (let i = 0; i < nonFieldParticles.length; i++) {
          const p = nonFieldParticles[i];
          // Map particle index → position along path
          const t  = (i / nonFieldParticles.length);
          const pi = Math.floor(t * (dm.strokePath.length - 1));
          const pt = dm.strokePath[pi];
          // Add small per-particle jitter so they don't stack exactly
          const jitter = (p.size || 4) * 2.5;
          p._drawTarget = {
            x: pt.x + (Math.sin(i * 2.399) * jitter),  // golden-angle spread
            y: pt.y + (Math.cos(i * 2.399) * jitter),
          };
        }
      }
    }

  } else {
    // 所有手都松开了
    if (dm.phase === 'drawing') {
      dm.phase = 'dissolving';
      dm.dissolveTimer = 0;
      // Clear draw targets — particles will scatter
      for (const p of nonFieldParticles) {
        p._drawTarget = null;
        // Give each particle a strong outward burst from pinch point
        if (dm.strokePath.length > 0) {
          const last = dm.strokePath[dm.strokePath.length - 1];
          const dx = p.x - last.x, dy = p.y - last.y;
          const d  = Math.sqrt(dx*dx + dy*dy) || 1;
          p.vx += (dx / d) * (4 + Math.random() * 6);
          p.vy += (dy / d) * (4 + Math.random() * 6);
        }
      }
      const badge = document.getElementById('hand-badge');
      if (badge) badge.textContent = '💫 DISSOLVING…';
    }

    if (dm.phase === 'dissolving') {
      dm.dissolveTimer++;
      if (dm.dissolveTimer >= DISSOLVE_FRAMES) {
        dm.phase = 'idle';
        dm.strokePath = [];
        const badge = document.getElementById('hand-badge');
        if (badge) badge.textContent = '✋ NO HAND';
      }
    }

    if (dm.phase === 'gathering') {
      dm.phase = 'idle';
      dm.gatherTimer = 0;
    }
  }
}

// ── Draw Mode: render glowing stroke trail overlay ────────────────────────────
function _drawStrokeOverlay() {
  const dm = DRAW_MODE;
  if (dm.phase !== 'drawing' || dm.strokePath.length < 2) return;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  // Draw the stroke path as a glowing ribbon
  const path = dm.strokePath;
  for (let i = 1; i < path.length; i++) {
    const t   = i / path.length;              // 0→1 along path
    const age = (Date.now() - path[i].t) / 1000;  // seconds old
    const fade = Math.max(0, 1 - age * 0.6); // fade older segments

    ctx.beginPath();
    ctx.moveTo(path[i-1].x, path[i-1].y);
    ctx.lineTo(path[i].x,   path[i].y);
    ctx.strokeStyle = `rgba(255,255,255,${t * fade * 0.25})`;
    ctx.lineWidth   = 3 + t * 6;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }

  // Glow dot at current pinch position
  for (const _ap of activePinchPoints) {
    const grd = ctx.createRadialGradient(
      _ap.x, _ap.y, 0,
      _ap.x, _ap.y, 40
    );
    grd.addColorStop(0,   'rgba(255,255,255,0.5)');
    grd.addColorStop(0.4, 'rgba(255,255,255,0.1)');
    grd.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(_ap.x, _ap.y, 40, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();
}

function loop() {
  requestAnimationFrame(loop);

  ctx.globalCompositeOperation = 'source-over';

  // 1. Semi-transparent light base — creates fluid ink-trail effect
  //ctx.fillStyle = 'rgba(245, 248, 255, 1)';
  //ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  // 1. 動態畫布底色：根據攝像頭狀態切換
  if (_camOn) {
    // 攝像頭開啟時：黑色透明（讓鏡頭畫面透出來，並保持粒子拖尾）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; 
  } else {
    // 攝像頭關閉時：純白色不透明
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; 
  }
  
  ctx.fillRect(0, 0, W, H);

  // 2. Camera feed — 受开关 _camOn 控制
  if (_camOn && video.readyState >= 2 && video.videoWidth > 0) {
    const vw = video.videoWidth, vh = video.videoHeight;
    const scale = Math.max(W / vw, H / vh);
    const dw = vw * scale, dh = vh * scale;
    const dx = (W - dw) / 2, dy = (H - dh) / 2;
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.globalAlpha = 0.45;   // 开启时用较高透明度，让观众清晰看到自己
    ctx.drawImage(video, dx, dy, dw, dh);
    ctx.restore();
    ctx.globalAlpha = 1;
    
  }

  // 3. 动态设置混合模式：摄像头开启用 screen（发光感），关闭用 source-over（水墨感）
  ctx.globalCompositeOperation = _camOn ? 'screen' : 'source-over';

  // --- 原有的更新与绘制逻辑 ---
  _tickDrawMode();
  for (const p of particles) {
    p.update(faces, emotion);
    p.draw(ctx);
  }

  // ⚠️ 重要：绘制完粒子后，记得将混合模式重置为默认，否则 UI 和骨架也会被过滤掉
  ctx.globalCompositeOperation = 'source-over';

  _drawStrokeOverlay();  // render the glowing trail overlay
  _tickSmileEmoji();     // spawn emoji floaters on smile edge

  // 4. Hand skeleton — visual feedback for gesture interaction
  if (handsResults && handsResults.multiHandLandmarks) {
      for (const lm of handsResults.multiHandLandmarks) {
        
        // 核心修复：替换掉原来那行错误的 map 公式
        const pts = lm.map(p => mapToCanvas(p.x, p.y));



      // Bone connections
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth   = 1.5;
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
      }
      ctx.stroke();

      // Landmark dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      for (const pt of pts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, TWO_PI);
        ctx.fill();
      }

      // 高亮所有捏合点（支持双手）
      for (const pt of activePinchPoints) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14, 0, TWO_PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth   = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, TWO_PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}

loop();
