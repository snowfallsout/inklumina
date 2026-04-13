'use strict';

function generateJoinQR() {
  const raw = document.getElementById('sp-ip-input').value.trim();
  if (!raw) { alert('请先填写 PC 的局域网 IPv4 地址（ipconfig → WLAN 适配器 IPv4 Address）'); return; }

  let host = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!/^[\d.]+(:\d+)?$/.test(host)) {
    alert('IP 格式看起来不对，示例：192.168.0.68  或  192.168.0.68:3000');
    return;
  }
  if (!host.includes(':') && location.port) host = host + ':' + location.port;

  const url = `http://${host}/mobile.html`;
  try { localStorage.setItem('colorfield_pc_ip', raw); } catch (e) {}

  const wrap = document.getElementById('sp-qr-wrap');
  const qrBox = document.getElementById('sp-qr');
  qrBox.innerHTML = '';
  new QRCode(qrBox, {
    text: url,
    width: 180,
    height: 180,
    colorDark: '#000',
    colorLight: '#fff',
    correctLevel: QRCode.CorrectLevel.M,
  });
  document.getElementById('sp-qr-url').textContent = url;
  wrap.style.display = 'block';
  refreshCornerQR();
}

function refreshCornerQR() {
  const box = document.getElementById('corner-qr');
  const urlEl = document.getElementById('corner-qr-url');
  const hint = document.getElementById('corner-qr-hint');
  if (!box) return;

  let raw;
  try { raw = localStorage.getItem('colorfield_pc_ip'); } catch (e) {}

  if (!raw) {
    box.innerHTML = '';
    if (urlEl) urlEl.textContent = '';
    if (hint) hint.style.display = '';
    return;
  }

  let host = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!host.includes(':') && location.port) host = host + ':' + location.port;
  const url = `http://${host}/mobile.html`;

  box.innerHTML = '';
  if (hint) hint.style.display = 'none';
  new QRCode(box, {
    text: url,
    width: 120,
    height: 120,
    colorDark: '#000',
    colorLight: '#fff',
    correctLevel: QRCode.CorrectLevel.M,
  });
  if (urlEl) urlEl.textContent = url;
}

function restoreSavedIP() {
  try {
    const saved = localStorage.getItem('colorfield_pc_ip');
    if (saved) {
      const el = document.getElementById('sp-ip-input');
      if (el) el.value = saved;
    }
  } catch (e) {}
}
