import { particles } from './core.js';

let rafId = null;
let canvas = null;
let ctx = null;
let W = 0, H = 0;

function onResize(){ if(!canvas) return; W = canvas.width = innerWidth; H = canvas.height = innerHeight; }

function _loop(){
  if(!ctx) return;
  ctx.clearRect(0,0,W,H);
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    if(typeof p.update === 'function') p.update();
    if(typeof p.draw === 'function') p.draw(ctx);
    if(p.age > p.life || p.r < 0.6) particles.splice(i,1);
  }
  rafId = requestAnimationFrame(_loop);
}

export function startLoop(target){
  if(typeof target === 'string') canvas = document.querySelector(target);
  else canvas = target;
  if(!canvas) throw new Error('startLoop: canvas not found');
  ctx = canvas.getContext('2d');
  onResize();
  window.addEventListener('resize', onResize);
  if(rafId == null) _loop();
}

export function stopLoop(){
  if(rafId != null) cancelAnimationFrame(rafId);
  rafId = null;
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onResize);
  }
}

export function getCanvasSize(){ return { width: W, height: H }; }
