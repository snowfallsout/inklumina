<script>
  import { mbtiCounts } from '$lib/stores/mbtiCounts.js';
  import { derived } from 'svelte/store';

  // derive sorted entries from store
  const entries = derived(mbtiCounts, $c => {
    const arr = Object.entries($c || {}).map(([k,v])=>({k,v}));
    arr.sort((a,b)=> (b.v||0) - (a.v||0));
    return arr.slice(0,12);
  });

  const total = derived(mbtiCounts, $c => Object.values($c || {}).reduce((s,n)=>s+(n||0),0));

  const colorFor = (k) => {
    // deterministic color by key
    const colors = ['#FF8FB3','#92FE9D','#66CCFF','#FFD36A','#C38CFF','#FFB47A','#9EE2F2','#FF9DDC'];
    let n = 0; for (let i=0;i<k.length;i++) n = (n*31 + k.charCodeAt(i)) >>> 0;
    return colors[n % colors.length];
  };
</script>

<div id="legend" style="pointer-events:auto">
  <h3>Present</h3>
  {#if $total === 0}
    <div style="padding:8px 0;color:rgba(0,0,0,0.35)">No participants yet</div>
  {:else}
    {#each $entries as e}
      <div class="row on" style="--c: {colorFor(e.k)}; display:flex; align-items:center; gap:8px; padding:6px 0;">
        <div class="dot" style="background:{colorFor(e.k)}"></div>
        <div class="lbl">{e.k}</div>
        <div class="track">
          <div class="fill" style="width:{Math.round((e.v/$total)*100)}%; background:{colorFor(e.k)}"></div>
        </div>
        <div class="cnt">{e.v}</div>
      </div>
    {/each}
  {/if}
</div>

<style>
  #legend { position:absolute; left:22px; top:50%; transform:translateY(-50%); min-width:180px; padding:18px; border-radius:16px; background:linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35)); box-shadow:0 8px 32px rgba(31,38,135,0.06); }
  #legend h3 { font-size:9px; letter-spacing:3px; text-transform:uppercase; color:rgba(0,0,0,0.35); margin:0 0 12px 0 }
  .dot{ width:10px; height:10px; border-radius:50%; flex-shrink:0 }
  .lbl{ color:#333; font-weight:700; min-width:36px }
  .track{ flex:1; height:6px; background:rgba(0,0,0,0.06); border-radius:4px; overflow:hidden }
  .fill{ height:100%; border-radius:4px }
  .cnt{ min-width:28px; text-align:right; color:rgba(0,0,0,0.45) }
</style>
