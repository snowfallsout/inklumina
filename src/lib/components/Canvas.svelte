<script>
  import { onMount, onDestroy } from 'svelte';
  import { spawn, seedAmbient, clearMBTIParticles } from '$lib/particles/core.js';
  import { startLoop, stopLoop, getCanvasSize } from '$lib/particles/loop.js';
  import { setCounts } from '$lib/stores/mbtiCounts.js';

  let eventSource = null;

  let canvasEl;

  function spawnFromData(data) {
    const { particles: pts, mbti, color } = data || {};
    const { width, height } = getCanvasSize();

    if (pts && pts.length) {
      pts.forEach((p) => {
        spawn(
          (p.x || 0.5) * width,
          (p.y || 0.5) * height,
          p.color || '#92FE9D',
          p.count || 18
        );
      });
    } else if (mbti) {
      spawn(width / 2, height / 2, color || '#92FE9D', data?.count || 18);
    } else {
      spawn(width / 2, height / 2, '#92FE9D', 18);
    }
  }

  onMount(() => {
    // start the rendering loop bound to this canvas
    startLoop(canvasEl);

    // seed ambient so canvas isn't empty immediately
    const { width: W, height: H } = getCanvasSize();
    seedAmbient(48, W, H);

    const connectEvents = () => {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('state', (event) => {
        const data = JSON.parse(event.data);
        setCounts(data.counts || {});
      });

      eventSource.addEventListener('session_reset', () => {
        clearMBTIParticles();
        setCounts({});
      });

      eventSource.addEventListener('spawn_particles', (event) => {
        const data = JSON.parse(event.data);
        spawnFromData(data);
      });

      eventSource.addEventListener('lucky_color', () => {
        // display page does not need to show the response separately
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };
    };

    connectEvents();

    // preserve cf:spawn local dev event compatibility
    const _onLocalSpawn = (e) => {
      const d = e && e.detail ? e.detail : {};
      const { width, height } = getCanvasSize();
      spawn((d.x!=null?d.x:0.5) * width, (d.y!=null?d.y:0.5) * height, d.color || '#92FE9D', d.count || 18);
    };
    window.addEventListener('cf:spawn', _onLocalSpawn);

    return () => {
      window.removeEventListener('cf:spawn', _onLocalSpawn);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  });

  onDestroy(() => { stopLoop(); });
</script>

<canvas bind:this={canvasEl} style="width:100%;height:100%"></canvas>
