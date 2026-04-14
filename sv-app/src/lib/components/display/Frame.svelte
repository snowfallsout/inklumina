<script lang="ts">
	import { displayState } from '$lib/features/display/state';
  import DisplayHeader from './Header.svelte';
  import DisplayLegend from './Legend.svelte';
  import DisplayHud from './Hud.svelte';
  import DisplayFooter from './Footer.svelte';
  import DisplaySessionManager from './SessionManager.svelte';
</script>

<div class="display-route">
  <div class="noise-overlay"></div>
  <div id="scene-bg"></div>

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
