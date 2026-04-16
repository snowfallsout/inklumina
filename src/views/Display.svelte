<script>
  import { onMount } from 'svelte';
  import { connectSocket } from '../lib/socket';
  import { getMeta } from '../lib/api';

  let canvas;
  let particles = $state([]);
  let counts = $state({});
  let total = $state(0);
  let sessionName = $state('');
  let meta = $state({ colors: {}, names: {} });
  const rows = $derived(
    Object.keys(meta.colors).map((mbti) => ({ mbti, count: counts[mbti] || 0, color: meta.colors[mbti] }))
  );

  const draw = () => {
    const g = canvas?.getContext('2d');
    if (!g || !canvas) return;
    const { width, height } = canvas;
    g.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      g.fillStyle = p.color;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    });
  };

  const seed = (color) => {
    const width = canvas?.width || innerWidth;
    const height = canvas?.height || innerHeight;
    particles = [
      ...particles,
      ...Array.from({ length: 24 }, () => ({
        color,
        x: Math.random() * width,
        y: Math.random() * height,
        r: 2 + Math.random() * 6,
      })),
    ].slice(-800);
    draw();
  };

  onMount(() => {
    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      draw();
    };
    resize();
    addEventListener('resize', resize);

    getMeta().then((data) => (meta = data)).catch(() => {});
    const socket = connectSocket();
    socket.on('state', (data) => {
      counts = data.counts || {};
      total = data.total || 0;
      sessionName = data.session?.name || '';
    });
    socket.on('spawn_particles', (data) => {
      counts = data.counts || counts;
      total = data.total || total;
      seed(data.color || '#fff');
    });
    socket.on('session_reset', (data) => {
      particles = [];
      counts = {};
      total = 0;
      sessionName = data.session?.name || '';
      draw();
    });
    return () => {
      removeEventListener('resize', resize);
      socket.close();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>
<aside>
  <h1>Colorfield</h1>
  <p>{sessionName || '默认活动'}</p>
  <p>Total: {total}</p>
  {#each rows as row}
    <div><i style="background:{row.color}"></i>{row.mbti} {row.count}</div>
  {/each}
  <p><a href="/join">/join</a></p>
</aside>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; background: #05060c; color: #fff; }
  canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; }
  aside { position: fixed; top: 12px; left: 12px; padding: 12px; background: #0009; border-radius: 10px; min-width: 160px; }
  h1, p { margin: 0 0 8px; }
  div { display: flex; gap: 8px; align-items: center; font-size: 13px; margin: 2px 0; }
  i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  a { color: #9cf; }
</style>
