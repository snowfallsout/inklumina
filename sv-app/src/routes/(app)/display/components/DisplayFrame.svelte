<svelte:head>
  <title>COLORFIELD - Live Particle Canvas</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { displayState } from '$lib/display/state';
  import { loadSessionOverview } from '$lib/display/session/client';
  import { initDisplayRuntime } from '$lib/display/runtime';
  import DisplayHeader from './DisplayHeader.svelte';
  import DisplayLegend from './DisplayLegend.svelte';
  import DisplayHud from './DisplayHud.svelte';
  import DisplayFooter from './DisplayFooter.svelte';
  import DisplaySessionManager from './DisplaySessionManager.svelte';

  const VENDOR_SCRIPTS = [
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js'
  ] as const;

  function scriptKey(src: string): string {
    return `display-script:${src}`;
  }

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const key = scriptKey(src);
      const existing = document.querySelector<HTMLScriptElement>(`script[data-display-key="${key}"]`);

      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.async = false;
      script.dataset.displayKey = key;
      script.dataset.loaded = 'false';
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  onMount(() => {
    void Promise.all(VENDOR_SCRIPTS.map((src) => loadScript(src))).then(() => {
      initDisplayRuntime();
    });
    void loadSessionOverview();
  });
</script>

<div class="display-route">
  <div class="noise-overlay"></div>

  <video id="video-bg" autoplay muted playsinline></video>
  <canvas id="canvas"></canvas>

  <div id="ui">
    <DisplayHeader />
    <DisplayLegend legend={$displayState.legend} />
    <DisplayHud />
    <DisplayFooter />
  </div>

  <DisplaySessionManager />
</div>
