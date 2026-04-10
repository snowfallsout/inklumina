import { renderHtmlPage } from './pageShell';

const MOBILE_HEAD_TAGS = [
  '<link rel="stylesheet" href="/styles/common.css">',
  '<link rel="stylesheet" href="/styles/mobile.css">',
];

const MOBILE_BODY = String.raw`
<div class="bg-orbs">
  <div class="orb" style="width:220px;height:220px;background:#9D4EDD;top:5%;left:5%;animation-delay:0s"></div>
  <div class="orb" style="width:160px;height:160px;background:#00F5FF;bottom:20%;right:8%;animation-delay:3s"></div>
  <div class="orb" style="width:130px;height:130px;background:#39FF14;bottom:8%;left:15%;animation-delay:6s"></div>
</div>

<div id="s-welcome" class="screen">
  <div class="title">Colorfield</div>
  <div class="subtitle">MBTI · Particle Art · Live</div>
  <div class="desc">你的 MBTI 将化作一簇专属色彩的粒子<br>汇入现场大屏的流体画布</div>
  <button class="btn accent" onclick="goTo('mbti')">开始加入 →</button>
</div>

<div id="s-mbti" class="screen hidden">
  <h2>选择你的 MBTI 类型</h2>
  <div class="preview" id="preview">
    <div class="preview-letter" id="pl-0">_</div>
    <div class="preview-letter" id="pl-1">_</div>
    <div class="preview-letter" id="pl-2">_</div>
    <div class="preview-letter" id="pl-3">_</div>
  </div>
  <div class="dim-row">
    <button class="dim-btn" data-d="0" data-v="E" onclick="pick(0,'E',this)"><span class="big">E</span><span class="hint">Extrovert</span></button>
    <button class="dim-btn" data-d="0" data-v="I" onclick="pick(0,'I',this)"><span class="big">I</span><span class="hint">Introvert</span></button>
  </div>
  <div class="dim-row">
    <button class="dim-btn" data-d="1" data-v="N" onclick="pick(1,'N',this)"><span class="big">N</span><span class="hint">Intuitive</span></button>
    <button class="dim-btn" data-d="1" data-v="S" onclick="pick(1,'S',this)"><span class="big">S</span><span class="hint">Sensing</span></button>
  </div>
  <div class="dim-row">
    <button class="dim-btn" data-d="2" data-v="T" onclick="pick(2,'T',this)"><span class="big">T</span><span class="hint">Thinking</span></button>
    <button class="dim-btn" data-d="2" data-v="F" onclick="pick(2,'F',this)"><span class="big">F</span><span class="hint">Feeling</span></button>
  </div>
  <div class="dim-row">
    <button class="dim-btn" data-d="3" data-v="J" onclick="pick(3,'J',this)"><span class="big">J</span><span class="hint">Judging</span></button>
    <button class="dim-btn" data-d="3" data-v="P" onclick="pick(3,'P',this)"><span class="big">P</span><span class="hint">Perceiving</span></button>
  </div>
  <div class="submit-row"><button class="btn" id="submit-btn" disabled onclick="submitMBTI()">加入画布</button></div>
</div>

<div id="s-result" class="screen hidden">
  <canvas id="sparkle-cv"></canvas>
  <div id="color-wash"></div>
  <div class="result-inner">
    <div class="lucky-label">Today's Lucky Color</div>
    <div class="result-orb" id="r-orb"></div>
    <div class="lucky-hex" id="r-hex">#------</div>
    <div class="result-mbti" id="r-mbti">----</div>
    <div class="result-nick" id="r-nick">------</div>
    <div class="look-up">↑ 抬头看大屏幕</div>
  </div>
</div>`;

const MOBILE_SCRIPTS = [
  '<script src="/socket.io/socket.io.js"></script>',
  '<script src="/assets/mobile.js"></script>',
];

export function renderMobilePage(): string {
  return renderHtmlPage({
    lang: 'zh',
    title: 'Colorfield · Join',
    headTags: MOBILE_HEAD_TAGS,
    body: MOBILE_BODY,
    scripts: MOBILE_SCRIPTS,
  });
}
