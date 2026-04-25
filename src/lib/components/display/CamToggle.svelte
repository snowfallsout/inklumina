<!--
  CamToggle.svelte
  Doc: Button to toggle camera on/off. Uses `camOn` and `initCamera`/`stopCamera` from media store.
-->

<script lang="ts">
  import { media, initCamera, stopCamera } from '$lib/runes/media.svelte';
  import { onMount, onDestroy } from 'svelte';

  /*
    toggleCamera()
    - Toggle camera state: call `initCamera()` when turning on, `stopCamera()` when off.
    - Updates store `camOn` is expected to be handled by those helpers.
  */
  function toggleCamera() {
		if (media.camOn) {
      stopCamera();
    } else {
      initCamera().catch(() => {});
    }
  }

  // Expose a global toggle for legacy scripts that call `toggleCamera()`
  onMount(() => {
    if (typeof window !== 'undefined') {
      (window as any).toggleCamera = toggleCamera;
    }
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).toggleCamera === toggleCamera) delete (window as any).toggleCamera;
    }
  });
</script>

<button id="cam-toggle" class="cam-toggle" class:on={media.camOn} onclick={toggleCamera}>
  { media.camOn ? '◎ 摄像头 ON' : '◎ 摄像头 OFF' }
</button>

<style>
  .cam-toggle {
  position: absolute;
  top: 28px;
  right: 22px;
  z-index: 21;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 30px;
  color: rgba(30,40,60,0.5);
  font-size: 10px;
  letter-spacing: 2px;
  padding: 7px 16px;
  cursor: pointer;
  pointer-events: all;
  transition: background .2s, color .2s;
  text-transform: uppercase;
}
  .cam-toggle:hover { background: rgba(255,255,255,0.6); color: rgba(30,40,60,0.85); }
  
  .cam-toggle.on { color: rgba(30,40,60,0.85); border-color: rgba(100,140,255,0.5); }

</style>