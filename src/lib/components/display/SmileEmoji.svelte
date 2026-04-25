<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { start as startSmile, stop as stopSmile, registerElement, unregisterElement } from '$lib/runes/smile.svelte';

  let el: HTMLDivElement | null = null;

  onMount(() => {
    startSmile();
    if (el) registerElement(el);
  });

  onDestroy(() => {
    unregisterElement();
    stopSmile();
  });
</script>

<!-- component-rendered emoji element (store will update its content/position) -->
<div bind:this={el} class="smile-emoji-persistent" aria-hidden="true"></div>

<style>
  .smile-emoji-persistent {
    position: absolute;
    font-size: 52px;
    pointer-events: none;
    user-select: none;
    line-height: 1;
    opacity: 0;
    transform: scale(0.5);
    translate: -50% 0;
    transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.18));
    z-index: 25;
  }
</style>
