<!--
  Canvas.svelte
  Doc: Main display canvas mounting the `ParticleEngine` and driving
  animations via requestAnimationFrame. Responsibilities:
    - Actively consume `spawnQueue` using `popSpawn()` (FIFO, pull model)
    - Convert normalized coords from runes -> pixel coords for engine
    - Wire `ParticleEngine` interactions and render loop
  Notation:
    - Input runes provide normalized coords in [0..1]
    - All engine interactions and drawing use PIXEL space (canvas coords)
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ParticleEngine from '$lib/services/core/particleEngine';
  import { popSpawn } from '$lib/state/particles.svelte';
  import { media } from '$lib/state/media.svelte';
  import { connect as socketConnect } from '$lib/services/socket';
  import { mountCoordinator } from '$lib/utils/coordinator';

  let canvas = $state<HTMLCanvasElement | null>(null);
  let ctx = $state<CanvasRenderingContext2D | null>(null);
  let engine = $state<ParticleEngine | null>(null);
  let rafId = 0;
  let last = 0;
  let videoEl = $state<HTMLVideoElement | null>(null);

  // perFrameSpawnCap: maximum number of spawn events to pull per frame
  let perFrameSpawnCap = 1; // configurable

  function resize() {
    /*
    resize()
      - Resize the canvas element to the current window inner size
      - Notify the `ParticleEngine` of the new pixel dimensions
      - Called on mount and on window `resize` events
   */
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine?.resize(canvas.width, canvas.height);
  }


  function mapToCanvas(normX: number, normY: number) {
    /*
    mapToCanvas(normX, normY)
      - Convert normalized coordinates in [0..1] into canvas pixel coords
      - Mirrors the X axis to match the original project's coordinate system
      - Returns an object `{ x, y }` in PIXEL space
    */
    if (!canvas) return { x: 0, y: 0 };
    const W = canvas.width, H = canvas.height;
    // Prefer a live video element for correct scale/crop mapping when available
    const v = videoEl || (document.getElementById('video-bg') as HTMLVideoElement | null);
    if (!v || v.videoWidth === 0) {
      return { x: (1 - normX) * W, y: normY * H };
    }
    // Compute scale to cover canvas (same logic as static display page)
    const scale = Math.max(W / v.videoWidth, H / v.videoHeight);
    const dw = v.videoWidth * scale;
    const dh = v.videoHeight * scale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2;
    // Mirror X axis and apply crop offsets
    return { x: (1 - normX) * dw + dx, y: normY * dh + dy };
  }

  function loop() {
    /* 
    Main animation loop:
      - Pull from spawnQueue up to perFrameSpawnCap and feed to engine
      - Step engine with delta time
      - Clear canvas and render engine state
    */
    rafId = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = now - last; last = now;
    if (!ctx || !engine) return;

    // consume spawnQueue (active pull)
    for (let i = 0; i < perFrameSpawnCap; i++) {
      const ev = popSpawn();
      if (!ev) break;
      // Backwards-compatible handling for spawn events:
      // - '__seed' events enqueue ambient seed count in `color` field
      // - other events map to spawnMBTI
      if (ev.mbti === '__seed') {
        const n = Number(ev.color) || 25;
        engine.seedAmbient(n);
      } else {
        engine.spawnMBTI(ev.mbti, ev.color, ev.counts as Record<string, number> | undefined);
      }
    }

    engine.step(dt);

    // clear and render
    ctx.fillStyle = 'rgba(245,248,255,1)';
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    engine.render(ctx);
  }

  $effect(() => {
    if (!engine) return;
		media.crowd;
    engine.setFaces(media.crowd.map((p) => {
      const c = mapToCanvas(p.x, p.y);
      return { x: c.x, y: c.y, smile: (p as any).smile || false };
    }));
  });

  $effect(() => {
    if (!engine) return;
		media.activeInteractions;
    engine.setInteractions(media.activeInteractions.map((p) => {
      const c = mapToCanvas(p.x, p.y);
      return { x: c.x, y: c.y, score: p.score || 1 };
    }));
  });

  onMount(() => {
    /*
      Initialization:
        - Get canvas context and create ParticleEngine instance
        - Seed ambient particles for visual interest
        - Subscribe to runes for interaction updates
        - Set up window resize listener and socket connection
    */
    if (!canvas) return; // type guard for TS
    ctx = canvas.getContext('2d'); // assume this succeeds; could add error handling
    engine = new ParticleEngine({ max: 1200 }); // configurable max particles; tune for performance
    resize();
    engine.seedAmbient(25); // initial ambient particles; adds visual interest before interactions start
    // Expose engine for quick debugging in browser console
    try { (window as any).__particleEngine = engine; } catch (e) { /* ignore */ }
    console.debug('ParticleEngine seeded, count=', engine.particles.length);

    // initialize last timestamp and capture video element for mapping
    last = performance.now();
    videoEl = document.getElementById('video-bg') as HTMLVideoElement | null;
    // register video element and start coordinator (camera, socket, UI wiring)
    let coordCleanup: (() => void) | null = null;
    try { coordCleanup = mountCoordinator(videoEl); } catch (e) { /* ignore in SSR or missing APIs */ }

    // subscribe runes for interaction mapping
    window.addEventListener('resize', resize);
    // connect socket (client-only)
    socketConnect();

    loop();

    // periodic debug snapshot (every 2s) to help diagnose missing particles
    const dbg = setInterval(() => {
      try { console.debug('particle debug:', (window as any).__particleEngine?.particles?.length || 0); } catch(e) {}
    }, 2000);

    onDestroy(() => {
      /* 
      Cleanup:
        - Cancel animation frame
      */
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      clearInterval(dbg);
      // stop coordinator if started
      try { if (coordCleanup) coordCleanup(); } catch (e) {}
    });
  });
</script>

<canvas bind:this={canvas} id="canvas"></canvas>

<style>
  canvas { position: fixed; inset: 0; }
</style>
