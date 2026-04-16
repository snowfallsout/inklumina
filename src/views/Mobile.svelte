<script>
  import { onMount } from 'svelte';
  import { connectSocket } from '../lib/socket';
  import { getMeta } from '../lib/api';

  let mbti = $state('');
  let submitted = $state('');
  let lucky = $state('');
  let meta = $state({ colors: {}, names: {}, luckyPhrases: {} });
  const list = $derived(Object.keys(meta.colors));
  let socket;

  const submit = () => {
    if (!mbti) return;
    submitted = mbti;
    socket.emit('submit_mbti', { mbti });
  };

  onMount(() => {
    getMeta().then((data) => (meta = data)).catch(() => {});
    socket = connectSocket();
    socket.on('lucky_color', ({ luckyPhrase }) => (lucky = luckyPhrase || ''));
    return () => socket.close();
  });
</script>

<main>
  <h1>Join Colorfield</h1>
  <select bind:value={mbti}>
    <option value="">Select MBTI</option>
    {#each list as item}
      <option value={item}>{item} · {meta.names[item]}</option>
    {/each}
  </select>
  <button on:click={submit} disabled={!mbti}>加入画布</button>
  {#if submitted}
    <p>{submitted} {meta.names[submitted]}</p>
    {#if lucky}<p>{lucky}</p>{/if}
  {/if}
</main>

<style>
  :global(body) { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #111; color: #fff; font-family: system-ui, sans-serif; }
  main { width: min(92vw, 360px); display: grid; gap: 10px; }
  select, button { padding: 12px; border-radius: 10px; border: 0; font-size: 16px; }
  button { background: #4f7cff; color: #fff; }
  button:disabled { opacity: 0.5; }
  p { margin: 0; }
</style>
