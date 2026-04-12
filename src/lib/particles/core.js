// Particle core extracted from public/js/display.bundle.js
export const particles = [];

function rand(min, max){ return Math.random()*(max-min)+min; }

export function hexToRgba(hex, a){
  if(hex[0]==='#') hex = hex.slice(1);
  if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const n = parseInt(hex,16);
  const r = (n>>16)&255; const g=(n>>8)&255; const b=n&255;
  return `rgba(${r},${g},${b},${a})`;
}

export class Particle {
  constructor(x,y,opts={}){
    this.x = x; this.y = y;
    this.vx = rand(-1.8,1.8) * (opts.force||1);
    this.vy = rand(-2.2,-0.6) * (opts.force||1);
    this.life = rand(160, 320);
    this.age = 0;
    this.r = rand(6, 18) * (opts.size||1);
    this.color = opts.color || '#ffcc66';
    this.alpha = 1;
    this.spin = rand(-0.03,0.03);
    this.s = 1 + Math.random()*0.6;
  }
  update(){
    this.age++;
    this.vy += 0.04; // gravity
    this.vx *= 0.995; this.vy *= 0.995;
    this.x += this.vx; this.y += this.vy;
    this.alpha = Math.max(0, 1 - this.age/this.life);
    this.r *= 0.998;
  }
  draw(ctx){
    const g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r);
    g.addColorStop(0, hexToRgba(this.color, 0.9*this.alpha));
    g.addColorStop(0.5, hexToRgba(this.color, 0.35*this.alpha));
    g.addColorStop(1, hexToRgba(this.color, 0*this.alpha));
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
}

export function spawn(x,y,c,n){
  for(let i=0;i<n;i++) {
    const particle = new Particle(x + (Math.random()*16-8), y + (Math.random()*16-8), { color: c, size: 1, force: 1+Math.random()*0.9 });
    particle.origin = 'mbti';
    particles.push(particle);
  }
}

// seedAmbient requires container dimensions to place particles
export function seedAmbient(n, W, H){
  const AMBIENT = ['#003153','#C8A2C8','#F9A602','#9DC183','#40E0D0'];
  for(let i=0;i<n;i++){
    const col = AMBIENT[i % AMBIENT.length];
    const x = Math.random()*W, y = Math.random()*H;
    const p = new Particle(x,y,{ color: col, size: Math.random()*0.9 + 0.6, force: 0.2 + Math.random()*0.6 });
    p.r = (Math.random()*6)+1.2;
    p.life = 600 + Math.random()*800;
    p.alpha = 0.2 + Math.random()*0.4;
    p.origin = 'ambient';
    particles.push(p);
  }
}

export function clearMBTIParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].origin !== 'ambient') {
      particles.splice(i, 1);
    }
  }
}
