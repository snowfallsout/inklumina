'use strict';

function mapToCanvas(normX, normY) {
  if (!video || video.videoWidth === 0) return { x: 0, y: 0 };
  const scale = Math.max(W / video.videoWidth, H / video.videoHeight);
  const dw = video.videoWidth * scale;
  const dh = video.videoHeight * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;

  return {
    x: dx + (1 - normX) * dw,
    y: dy + normY * dh,
  };
}

let faces = [];
let emotion = 'neutral';
const video = document.getElementById('video-bg');

let _faceMesh = null;
let _hands = null;

let handsResults = null;
let activePinchPoints = [];

let _processing = false;
let _frameCounter = 0;

async function _processFrame() {
  requestAnimationFrame(_processFrame);
  if (!_processing || video.readyState < 2) return;

  _frameCounter++;
  try {
    if (_faceMesh && (_frameCounter & 1) === 0) {
      await _faceMesh.send({ image: video });
    } else if (_hands) {
      await _hands.send({ image: video });
    }
  } catch (e) {
  }
}

function setupCamera() {
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = async () => {
        video.play();
        video.classList.add('ready');

        _initFaceMesh();
        _initHands();

        try {
          if (_faceMesh) await _faceMesh.initialize();
          if (_hands) await _hands.initialize();
        } catch (e) {
          console.warn('AI Engine Init Error:', e);
        }

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
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`,
  });
  _faceMesh.setOptions({
    maxNumFaces: 6,
    refineLandmarks: false,
    minDetectionConfidence: .5,
    minTrackingConfidence: .5,
  });
  _faceMesh.onResults(results => {
    faces = [];
    let smiles = 0;
    if (results.multiFaceLandmarks) {
      for (const lm of results.multiFaceLandmarks) {
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
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}`,
  });
  _hands.setOptions({
    maxNumHands: 2,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6,
    modelComplexity: 1,
  });
  _hands.onResults(res => {
    handsResults = res;
    activePinchPoints = [];

    const badge = document.getElementById('hand-badge');
    if (!res.multiHandLandmarks || res.multiHandLandmarks.length === 0) {
      if (badge) badge.textContent = '✋ NO HAND';
      return;
    }

    const parts = [`✋ ${res.multiHandLandmarks.length}H`];
    for (const lm of res.multiHandLandmarks) {
      const indexTip = mapToCanvas(lm[8].x, lm[8].y);
      const thumbTip = mapToCanvas(lm[4].x, lm[4].y);
      const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
      const pinched = pinchDist < 60;
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
    el.textContent = `● ${faces.length} FACE${faces.length > 1 ? 'S' : ''} DETECTED`;
  }
}
