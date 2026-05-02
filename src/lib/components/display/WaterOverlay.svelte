<script lang="ts">
  import { ui } from '$lib/state/ui.svelte';
</script>

{#if ui.waterOverlay}
  <div class="water-overlay" aria-hidden="true"></div>
{/if}

<style>
.water-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 18;
  display: block;
  /* subtle watery visual — tweak as needed */
  background: radial-gradient(ellipse at center, rgba(180,220,255,0.10), rgba(180,220,255,0.04));
  mix-blend-mode: overlay;
  backdrop-filter: blur(2px) saturate(120%);
}
</style>
