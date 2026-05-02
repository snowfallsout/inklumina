<script lang="ts">
/**
 * MBTICard.svelte — Presentational MBTI gradient card
 *
 * File-level:
 * Renders a four-letter MBTI preview with a color gradient derived
 * from the current selection. This component is presentational only
 * and does not own selection changes.
 */
import { deriveCardColors, MBTI_NAMES } from '$lib/utils/mbti';
const { sel = [null, null, null, null] as Array<string | null> } = $props();
</script>

<div class="mbti-card" style="--cc0:{deriveCardColors(sel).c0};--cc1:{deriveCardColors(sel).c1};--cc2:{deriveCardColors(sel).c2};--cc3:{deriveCardColors(sel).c3};">
  <div class="card-inner">
    <div class="card-top">
      <div class="card-kicker">
        INSIDE OUT THE COLOR
        <span class="sm">Sixteen Personalities</span>
      </div>
      <div class="card-badge"></div>
    </div>

    <div class="card-letters">
      <div class="preview">
        {#each [0,1,2,3] as i (i)}
          <div class="preview-letter {sel[i] ? '' : 'placeholder'}" id={`pl-${i}`}>
            {sel[i] || ['M','B','T','I'][i]}
          </div>
        {/each}
      </div>
    </div>

    <div class="card-bottom">
      <div>
        <div class="card-name-cn">{sel.every(Boolean) ? MBTI_NAMES[sel.join('')] || '—' : (sel.filter(Boolean).join('') || '—')}</div>
        <div class="card-name-en">{sel.every(Boolean) ? sel.join('') : (sel.filter(Boolean).length ? `${sel.filter(Boolean).length}/4` : 'Select four dimensions')}</div>
      </div>
      <div class="card-num">{sel.every(Boolean) ? sel.join('') : (sel.filter(Boolean).join('') || '—')}</div>
    </div>
  </div>
</div>

<style>
.mbti-card{width:100%;max-width:300px;aspect-ratio:3/4;max-height:38vh;border-radius:20px;position:relative;overflow:hidden;margin-bottom:22px;background:linear-gradient(180deg,var(--cc0) 0%,var(--cc1) 35%,var(--cc2) 70%,var(--cc3) 100%);box-shadow:0 14px 40px rgba(40,50,80,.18),0 2px 8px rgba(40,50,80,.08),inset 0 0 0 1px rgba(255,255,255,.35);transition:background 1.1s ease,box-shadow .6s ease;}
.mbti-card::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,0) 40%)}
.card-inner{position:relative;z-index:2;width:100%;height:100%;display:flex;flex-direction:column;padding:18px 22px}
.card-top{display:flex;justify-content:space-between;align-items:flex-start}
.card-kicker{font-size:8px;font-weight:600;letter-spacing:2px;color:rgba(255,255,255,.95);text-transform:uppercase;line-height:1.5;text-shadow:0 1px 4px rgba(0,0,0,.15)}
.card-kicker .sm{display:block;font-weight:300;opacity:.8;margin-top:1px}
.card-badge{width:18px;height:18px;border-radius:4px;background:rgba(255,255,255,.85);box-shadow:0 1px 4px rgba(0,0,0,.1)}
.card-letters{flex:1;display:flex;align-items:center;justify-content:center}
.preview{display:flex;gap:2px;align-items:baseline;justify-content:center}
.preview-letter{font-size:64px;font-weight:900;letter-spacing:-1px;line-height:1;color:rgba(255,255,255,.95);text-shadow:0 2px 14px rgba(0,0,0,.18);transition:color .4s,opacity .4s,transform .4s;min-width:42px;text-align:center;font-family:'Inter',sans-serif;cursor:default}
.preview-letter.placeholder{color:rgba(255,255,255,.55);font-weight:700;text-shadow:0 1px 6px rgba(0,0,0,.08)}
.card-bottom{display:flex;justify-content:space-between;align-items:flex-end}
.card-name-cn{font-size:13px;font-weight:500;letter-spacing:2px;color:rgba(255,255,255,.98);text-shadow:0 1px 6px rgba(0,0,0,.2)}
.card-name-en{font-size:10px;font-weight:300;letter-spacing:3px;color:rgba(255,255,255,.85);text-transform:uppercase;margin-top:2px;text-shadow:0 1px 4px rgba(0,0,0,.15)}
.card-num{font-size:22px;font-weight:200;color:rgba(255,255,255,.9);letter-spacing:1px;text-shadow:0 1px 6px rgba(0,0,0,.18);font-feature-settings:"tnum"}
</style>
