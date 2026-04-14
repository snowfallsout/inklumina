'use strict';

const socket = io();

function submitMBTI() {
  if (!sel.every(Boolean)) return;

  const mbti = sel.join('');
  const button = document.getElementById('submit-btn');
  if (button) {
    button.disabled = true;
    button.textContent = '色彩解析中…';
  }

  if (navigator.vibrate) navigator.vibrate(50);
  setTimeout(() => socket.emit('submit_mbti', { mbti }), 1500);
}

socket.on('lucky_color', ({ mbti, color, nickname, luckyPhrase }) => {
  showHoloCard(mbti, color, nickname || MBTI_NAMES[mbti], luckyPhrase);
});