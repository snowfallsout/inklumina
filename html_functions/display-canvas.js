'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let W = 0;
let H = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);
