'use strict';

let _emojiEl = null;
let _wasAnySmiling = false;

function _randomEmoji() {
  return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)];
}

function _getOrCreateEmojiEl() {
  if (!_emojiEl) {
    _emojiEl = document.createElement('div');
    _emojiEl.className = 'smile-emoji-persistent';
    document.getElementById('ui').appendChild(_emojiEl);
  }
  return _emojiEl;
}

function _tickSmileEmoji() {
  const anySmiling = faces.some(f => f.smile);
  const el = _getOrCreateEmojiEl();

  if (anySmiling) {
    const smilingFace = faces.find(f => f.smile);

    if (!_wasAnySmiling) {
      el.textContent = _randomEmoji();
    }

    el.style.left = smilingFace.x + 'px';
    el.style.top = (smilingFace.y - 70) + 'px';
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  } else {
    el.style.opacity = '0';
    el.style.transform = 'scale(0.5)';
  }

  _wasAnySmiling = anySmiling;
}
