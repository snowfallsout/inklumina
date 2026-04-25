// @ts-nocheck
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
