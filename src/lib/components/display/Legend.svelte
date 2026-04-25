<!--
  Legend.svelte
  Doc: Visual legend showing MBTI counts and totals.
  Notation:
    - Reads `mbtiCounts` and `total` from `$lib/runes/mbti` (counts are simple integers)
    - Presentation-only; generates simple colors deterministically from MBTI key.
-->

<script lang="ts">
  import { mbtiCounts, total } from '$lib/runes/mbti.svelte';
  import { MBTI_ORDER, MBTI_PALETTES } from '$lib/config/mbti';

  type MbtiKey = keyof typeof MBTI_PALETTES;
  type Entry = { k: MbtiKey; v: number; pct: number };

  /*
    colorFor(key)
    - Deterministically generate a pleasant color hex from a short key string.
    - Lightweight fallback when no explicit palette is available.
  */
  function colorFor(key: string) {
    const seed = Array.from(key).reduce((s, c) => s + c.charCodeAt(0), 0);
    const r = (seed * 137) % 200 + 30;
    const g = (seed * 61) % 200 + 30;
    const b = (seed * 29) % 200 + 30;
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Derive a list of all MBTI types (preserve MBTI_ORDER), include zero-counts
  let entries = $derived.by((): Entry[] => MBTI_ORDER.map((k) => {
    const v = mbtiCounts[k] ? mbtiCounts[k] : 0;
    return { k, v, pct: total ? v / total : 0 };
  }));

  // Determine the currently-most-participating MBTI (top) for glow/hover color
  let top = $derived.by(() => {
    const fallback: Entry = { k: MBTI_ORDER[0], v: 0, pct: 0 };
    return entries.reduce((best: Entry, it: Entry) => (it.v > best.v ? it : best), entries[0] ?? fallback);
  });
</script>
<aside class="legend" style="--glow: {top.k ? (MBTI_PALETTES[top.k]?.mid || colorFor(top.k)) : 'transparent'}">
  <h3 class="legend-title">Present</h3>
  <div class="legend-rows">
    {#if entries.length === 0}
      <div class="row empty">No participants yet</div>
    {/if}
    {#each entries as item}
      <div class="row" class:on={item.v > 0} class:top={item.k === top.k}>
        <div class="dot" style="--c: {MBTI_PALETTES[item.k]?.mid || colorFor(item.k)}; background: {MBTI_PALETTES[item.k]?.mid || colorFor(item.k)}"></div>
        <div class="lbl">{item.k}</div>
        <div class="track">
          <div class="fill" style="width: {total ? Math.round(item.pct * 100) + '%' : '0%'}; background: {colorFor(item.k)}"></div>
        </div>
        <div class="cnt">{item.v}</div>
      </div>
    {/each}
  </div>
</aside>

<style>
  /* Glass-style left panel inspired by static/display.html */
  .legend { position: absolute; left: 22px; top: 50%; transform: translateY(-50%); background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 32px rgba(31,38,135,0.07), inset 0 0 12px rgba(255,255,255,0.3); border-radius: 20px; padding: 18px 14px; min-width: 158px; z-index:25; --glow: transparent; animation: breathe 3.6s ease-in-out infinite; }
  .legend-title { color: rgba(0,0,0,0.55); font-size: 9px; letter-spacing: 3px; text-align: center; text-transform: uppercase; margin-bottom: 14px }
  .legend-rows { display:flex; flex-direction:column; gap:6px }
  .row { display:flex; align-items:center; gap:7px; padding:2.5px 0; opacity:0.9; transform: translateX(6px); transition: opacity 0.4s, transform 0.4s }
  .row.on { opacity:1; transform: translateX(0) }
  .row.empty { color:#444; font-size:13px; opacity:1; transform:none }
  .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; filter: drop-shadow(0 0 4px var(--c)); }
  .lbl { color:#444; font-size:11px; font-weight:700; min-width:34px }
  .track { flex:1; height:3px; background: rgba(255,255,255,0.06); border-radius:2px; overflow:hidden }
  .fill { height:100%; border-radius:2px; transition: width 0.7s cubic-bezier(0.4,0,0.2,1); width:0% }
  .cnt { color: rgba(0,0,0,0.45); font-size:10px; min-width:16px; text-align:right }

  /* breathing glow animation applied to legend border and top row/dot */
  @keyframes breathe {
    0% { box-shadow: 0 8px 32px rgba(31,38,135,0.07), inset 0 0 12px rgba(255,255,255,0.3), 0 0 6px var(--glow); }
    50% { box-shadow: 0 12px 44px rgba(31,38,135,0.08), inset 0 0 14px rgba(255,255,255,0.36), 0 0 18px var(--glow); }
    100% { box-shadow: 0 8px 32px rgba(31,38,135,0.07), inset 0 0 12px rgba(255,255,255,0.3), 0 0 6px var(--glow); }
  }

  @keyframes breathe-fast {
    0% { box-shadow: 0 4px 10px rgba(0,0,0,0.06), 0 0 6px var(--glow); transform: scale(1); }
    50% { box-shadow: 0 8px 20px rgba(0,0,0,0.08), 0 0 22px var(--glow); transform: scale(1.03); }
    100% { box-shadow: 0 4px 10px rgba(0,0,0,0.06), 0 0 6px var(--glow); transform: scale(1); }
  }

  /* Top MBTI row styling and hover (legend hover) effects */
  .row.top { border-radius: 8px; padding:4px 2px; transition: transform 0.35s, box-shadow 0.35s; }
  .row.top .dot { transition: transform 0.35s, filter 0.35s; }
  .legend:hover .row.top { transform: translateX(0) scale(1.04); box-shadow: 0 6px 20px rgba(0,0,0,0.08), 0 0 22px var(--glow); animation: breathe-fast 2.6s ease-in-out infinite; }
  .legend:hover .row.top .dot { transform: scale(1.25); filter: drop-shadow(0 0 12px var(--glow)); }

  /* Make the dot glow subtly even when not hovered */
  .row.top .dot { filter: drop-shadow(0 0 6px var(--glow)); }
</style>
