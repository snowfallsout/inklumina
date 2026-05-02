<!--
  Toast.svelte
  Doc: Toast notification area. Subscribes to the `toast` store and
  displays transient messages. Auto-dismiss is handled by the store's
  `showToast` helper, but this component also provides simple enter/exit
  transitions.
-->

<script lang="ts">
  import { fade } from 'svelte/transition';
  import { ui } from '$lib/state/ui.svelte';

  /*
    Behavior:
      - Renders when `$toast` is non-null
      - Uses `fade` transition for appearance/disappearance
      - Honors optional `color` property on the toast object for background
  */
</script>

{#if ui.toast}
  <div class="toast" transition:fade>
    <div class="bubble" style="background: {ui.toast.color || '#222'}">{ui.toast.msg}</div>
  </div>
{/if}

<style>
  .toast { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); z-index: 40; }
  .bubble { color: #fff; padding: 8px 12px; border-radius: 8px; font-weight:600; box-shadow: 0 6px 18px rgba(0,0,0,.12); }
</style>
