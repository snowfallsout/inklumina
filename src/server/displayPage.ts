import { renderHtmlPage } from './pageShell';

const DISPLAY_HEAD_TAGS = [
  '<link rel="stylesheet" href="/styles/common.css">',
  '<link rel="stylesheet" href="/styles/display.css">',
];

const DISPLAY_BODY = String.raw`
<video id="video-bg" autoplay muted playsinline></video>
<canvas id="canvas"></canvas>

<div id="ui">
  <div id="header">
    <h1>Colorfield</h1>
    <p>MBTI · Emotion · Particle Art</p>
  </div>

  <div id="emotion-badge">● FACE TRACKING</div>

  <div id="legend">
    <h3>Present</h3>
    <div id="legend-rows"></div>
  </div>

  <div id="footer">
    <div id="total-block">
      Participants
      <strong id="total-num">0</strong>
    </div>
    <div id="join-block">
      <b>SCAN TO JOIN</b>
      Phone → /join
    </div>
  </div>

  <div id="session-name"></div>
  <div id="waiting">Waiting for participants to join…</div>
  <button id="session-btn" onclick="openSessionPanel()">⊕ 新场次 / 历史</button>
</div>

<div id="session-panel">
  <span id="sp-close" onclick="closeSessionPanel()">×</span>
  <div id="session-box">
    <h2>活动场次管理</h2>
    <div class="sp-new">
      <input id="sp-name-input" type="text" placeholder="新活动名称（可留空）" maxlength="30">
      <button class="sp-btn" onclick="createNewSession()">开始新场次</button>
    </div>
    <div id="sp-history-title">历史记录</div>
    <div id="sp-history-list">
      <div style="color:rgba(255,255,255,0.2);font-size:12px;padding:16px 0">暂无历史记录</div>
    </div>
  </div>
</div>`;

const DISPLAY_SCRIPTS = [
  '<script src="/socket.io/socket.io.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js" crossorigin="anonymous"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js" crossorigin="anonymous"></script>',
  '<script src="/assets/display.js"></script>',
];

export function renderDisplayPage(): string {
  return renderHtmlPage({
    lang: 'zh',
    title: 'COLORFIELD — Live Particle Canvas',
    headTags: DISPLAY_HEAD_TAGS,
    body: DISPLAY_BODY,
    scripts: DISPLAY_SCRIPTS,
  });
}
