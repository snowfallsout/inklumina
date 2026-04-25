<!--
  HandBadge.svelte
  Doc: Displays brief hand-tracking status text from the `ui` store.
  Notation:
    - Subscribes to `$handBadgeText` from `$lib/runes/ui`.
    - Styled to match original absolute placement and typography.
-->

<script lang="ts">
  import { ui } from '$lib/runes/ui.svelte';
</script>

<div class="hand-badge">{ui.handBadgeText}</div>

<style>
  /* Match static/display.html hand-badge styles (placement and transition) */
  .hand-badge { position:absolute; top:54px; left:28px; color:rgba(30,40,60,1); font-size:10px; letter-spacing:2px; text-transform:uppercase; transition:color 0.3s; z-index:22 }
</style>