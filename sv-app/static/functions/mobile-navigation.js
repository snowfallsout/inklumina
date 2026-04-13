'use strict';

function goTo(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById('s-' + n);
  if (screen) screen.classList.remove('hidden');
}