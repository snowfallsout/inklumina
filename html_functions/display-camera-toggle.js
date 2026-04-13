'use strict';

let _camOn = false;

function toggleCamera() {
  _camOn = !_camOn;
  const btn = document.getElementById('cam-toggle');
  btn.textContent = _camOn ? '◎ 摄像头 ON' : '◎ 摄像头 OFF';
  btn.classList.toggle('on', _camOn);
}
