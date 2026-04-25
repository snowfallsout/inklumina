<!--
  EmotionBadge.svelte
  Doc: Badge matching static/display.html's `#emotion-badge` behaviour.
  - Subscribes to `crowd` and `emotion` runes and renders status text.
  - Mirrors display.html styles and `.smile` / `.sad` classes.
-->

<script lang="ts">
  import { emotion } from '$lib/runes/media.svelte';
</script>

<!-- Minimal behavior: only react to `emotion === 'smile'` as in display.html; no extra features added -->
<div class="emotion-badge" class:smile={emotion === 'smile'}>{ emotion === 'smile' ? '✦ SMILE DETECTED' : '● FACE TRACKING' }</div>

<style>
  /* Match static/display.html #emotion-badge */
  .emotion-badge { position: absolute; top: 28px; left: 28px; color: rgba(30,40,60,0.9); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; transition: color 0.5s; }
  .emotion-badge.smile { color: #B08800; }
</style>