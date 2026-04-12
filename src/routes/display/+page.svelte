<script>
  import Canvas from '$lib/components/Canvas.svelte';
  import Legend from './components/Legend.svelte';
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Controls from './components/Controls.svelte';
  import SessionPanel from './components/SessionPanel.svelte';
  import Toast from './components/Toast.svelte';
  import EmotionBadge from './components/EmotionBadge.svelte';

  import { mbtiCounts } from '$lib/stores/mbtiCounts.js';
  import { derived } from 'svelte/store';

  let sessionOpen = false;
  const total = derived(mbtiCounts, $c => Object.values($c || {}).reduce((s,n)=>s+(n||0),0));

  function onToggleSession(){ sessionOpen = !sessionOpen; }
  function onSpawnTest(){ /* spawn is emitted from Controls via cf:spawn already */ }
</script>

<main>
  <div class="canvas-wrap"><Canvas /></div>

  <div class="ui-layer">
    <Header />
    <EmotionBadge />
    <Legend />
    <Footer total={$total} />
    <Controls on:toggleSession={onToggleSession} on:spawnTest={onSpawnTest} />
    <Toast />
    <SessionPanel open={sessionOpen} on:close={() => sessionOpen = false} />
  </div>
</main>

<style>
  main { position:relative; width:100%; height:100vh; overflow:hidden }
  .canvas-wrap { position:fixed; inset:0; z-index:10 }
  .ui-layer { position:fixed; inset:0; z-index:20; pointer-events:none }
</style>
