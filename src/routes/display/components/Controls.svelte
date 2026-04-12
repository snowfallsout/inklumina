<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function toggleSession(){ dispatch('toggleSession'); }
  function spawnTest(){
    window.dispatchEvent(new CustomEvent('cf:spawn', { detail: { color: '#FF00FF', count: 32 } }));
    dispatch('spawnTest');
  }
</script>

<div class="controls-root">
  <button id="session-btn" on:click={toggleSession} class="session-btn">Session</button>
  <button on:click={spawnTest} class="spawn-btn">Spawn Test</button>
</div>

<style>
  .controls-root { position:fixed; bottom:18px; left:18px; pointer-events:auto; }
  .session-btn { padding:7px 16px; border-radius:30px; background:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:2px; cursor:pointer }
  .spawn-btn { margin-left:10px; padding:8px 12px; border-radius:8px; background:#fff; border:1px solid #ddd; cursor:pointer }
</style>
