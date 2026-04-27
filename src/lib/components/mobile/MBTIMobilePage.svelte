<script lang="ts">
/**
 * `MBTIMobilePage.svelte`
 * Page-level composition for the mobile MBTI flow.
 *
 * Responsibilities (stubbed):
 * - Import and compose mobile components (MBTICard, DimRow, SubmitButton, HoloCardPreview).
 * - Hold page-level state (`sel`) and wire socket events via service adapter.
 *
 * This file contains type stubs and import placeholders only — no runtime
 * logic is implemented here yet.
 */

/**
 * MBTIMobilePage.svelte — Mobile MBTI flow page
 *
 * File-level:
 * Page composition for the mobile flow. Orchestrates state between
 * presentational components, wires socket events and triggers
 * holo image generation. Keep page-level behavior here; move heavy
 * logic into `src/lib/utils` or `src/lib/services`.
 */
import MBTICard from '$lib/components/mobile/MBTICard.svelte';
import DimRow from '$lib/components/mobile/DimRow.svelte';
import SubmitButton from '$lib/components/mobile/SubmitButton.svelte';
import HoloCardPreview from '$lib/components/mobile/HoloCardPreview.svelte';
import { connect, emit, on as socketOn } from '$lib/services/socket';
import { MBTI_NAMES } from '$lib/utils/mbti';
import { onMount } from 'svelte';

let sel: Array<string | null> = [null, null, null, null];
let loading = false;
let previewRef: any = null;
let screen: 'welcome' | 'mbti' | 'result' = 'welcome';

/**
 * onMount: initialize socket connection and listen for server replies.
 * When the server emits `lucky_color` the page transitions to the
 * result screen and instructs the preview to generate the image.
 */
onMount(() => {
  connect();
  socketOn('lucky_color', ({ mbti, color, nickname, luckyPhrase }: any) => {
    screen = 'result';
    if (previewRef && typeof previewRef.generate === 'function') {
      previewRef.generate({ mbti, color, nickname: nickname || MBTI_NAMES[mbti] || '', phrase: luckyPhrase });
    }
    loading = false;
  });
});

/**
 * handleSelect(ev)
 * Receive `select` events from child components and update the
 * local `sel` state array.
 */
function handleSelect(ev: CustomEvent) {
  const { dimension, value } = ev.detail;
  sel[dimension] = value;
}

function isComplete() { return sel.every(Boolean); }

/**
 * submitMBTI()
 * Validate selection, set loading state, and emit `submit_mbti` to
 * the server. Uses a short vibration + timeout for UX polish.
 */
function submitMBTI() {
  if (!isComplete()) return;
  loading = true;
  const mbti = sel.join('');
  if (navigator.vibrate) navigator.vibrate(50);
  setTimeout(() => emit('submit_mbti', { mbti }), 350);
}
</script>

<!-- Visual skeleton copied from static/mobile.html (styles below) -->
<div class="noise-overlay"></div>

{#if screen === 'welcome'}
  <div class="screen">
    <div class="title">Colorfield</div>
    <div class="subtitle">MBTI · Particle Art · Live</div>
    <div class="desc">你的 MBTI 将化作一簇专属色彩的粒子<br>汇入现场大屏的流体画布</div>
    <button class="btn accent" onclick={() => screen = 'mbti'}>开始加入 →</button>
  </div>
{:else if screen === 'mbti'}
  <div class="screen">
    <div class="h-title">Inside Out the Color</div>
    <div class="h-sub">选择你的 MBTI</div>

    <MBTICard {sel} />

    <DimRow dimension={0} values={[{value:'E',hint:'Extrovert'},{value:'I',hint:'Introvert'}]} selected={sel[0]} on:select={handleSelect} />
    <DimRow dimension={1} values={[{value:'N',hint:'Intuitive'},{value:'S',hint:'Sensing'}]} selected={sel[1]} on:select={handleSelect} />
    <DimRow dimension={2} values={[{value:'T',hint:'Thinking'},{value:'F',hint:'Feeling'}]} selected={sel[2]} on:select={handleSelect} />
    <DimRow dimension={3} values={[{value:'J',hint:'Judging'},{value:'P',hint:'Perceiving'}]} selected={sel[3]} on:select={handleSelect} />

    <div class="submit-row">
      <SubmitButton disabled={!isComplete()} loading={loading} on:submit={submitMBTI} />
    </div>
  </div>
{:else}
  <div class="screen" style="padding:0;justify-content:center;align-items:center;flex-direction:column">
    <HoloCardPreview bind:this={previewRef} />
    <p style="color:rgba(26,26,34,.55);font-size:12px;letter-spacing:2px;margin-top:14px">长按图片保存</p>
  </div>
{/if}

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;700;900&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased}
:global(html,body){height:100%;overflow:hidden;background:#f4f5f8;color:#1a1a22;font-family:'Inter',-apple-system,sans-serif}

/* Soft ambient wash on the white page so it never looks flat */
body::before{
  content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,255,255,0.9) 0%,rgba(244,245,248,0) 60%),
    radial-gradient(ellipse 60% 40% at 10% 90%,rgba(220,225,240,0.5) 0%,rgba(244,245,248,0) 70%),
    radial-gradient(ellipse 60% 40% at 90% 90%,rgba(230,220,240,0.45) 0%,rgba(244,245,248,0) 70%);
}

.noise-overlay{
  position:fixed;inset:0;pointer-events:none;z-index:3;opacity:.05;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}

.screen{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;z-index:10;transition:opacity .5s ease,transform .5s ease}
.screen.hidden{opacity:0;pointer-events:none;transform:translateY(24px)}

/* ── Welcome ───────────────────────────── */
#s-welcome .title{font-size:40px;font-weight:100;letter-spacing:14px;text-transform:uppercase;color:#1a1a22;margin-bottom:10px;text-align:center}
#s-welcome .subtitle{font-size:11px;letter-spacing:5px;color:rgba(26,26,34,.5);text-transform:uppercase;margin-bottom:72px;text-align:center}
#s-welcome .desc{font-size:14px;color:rgba(26,26,34,.65);line-height:1.9;text-align:center;max-width:280px;margin-bottom:60px}

/* ── Buttons ───────────────────────────── */
.btn{
  background:rgba(255,255,255,.75);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  color:#1a1a22;
  border:1px solid rgba(255,255,255,.9);
  box-shadow:0 4px 20px rgba(60,70,100,.1),inset 0 0 0 1px rgba(255,255,255,.5);
  border-radius:60px;padding:17px 52px;
  font-size:13px;font-weight:500;letter-spacing:4px;text-transform:uppercase;
  cursor:pointer;white-space:nowrap;
  transition:background .25s,transform .15s,opacity .25s,box-shadow .3s,color .3s;
}
.btn:active{transform:scale(.96)}
.btn:hover{background:rgba(255,255,255,.9)}
.btn:disabled{opacity:.45;cursor:not-allowed;pointer-events:none}
.btn.accent{background:#1a1a22;color:#fff;border-color:#1a1a22;font-weight:500}
.btn.accent:hover{background:#2a2a35}

/* ── MBTI Screen layout ───────────────── */
#s-mbti{justify-content:flex-start;padding-top:36px;gap:0}

.h-title{font-size:10px;font-weight:500;letter-spacing:5px;color:rgba(26,26,34,.7);text-transform:uppercase;margin-bottom:4px;text-align:center}
.h-sub{font-size:11px;font-weight:300;letter-spacing:3px;color:rgba(26,26,34,.4);margin-bottom:20px;text-align:center}

/* ── THE CARD — where the MBTI gradient lives ─── */
.mbti-card{
  width:100%;max-width:300px;
  aspect-ratio:3/4;
  max-height:38vh;
  border-radius:20px;
  position:relative;overflow:hidden;
  margin-bottom:22px;
  /* gradient variables set by JS */
  background:
    linear-gradient(180deg,
      var(--cc0,#e8e9ef) 0%,
      var(--cc1,#dcdee7) 35%,
      var(--cc2,#cfd2de) 70%,
      var(--cc3,#bec2d2) 100%);
  box-shadow:
    0 14px 40px rgba(40,50,80,.18),
    0 2px 8px rgba(40,50,80,.08),
    inset 0 0 0 1px rgba(255,255,255,.35);
  transition:background 1.1s ease,box-shadow .6s ease;
  will-change:background;
}
/* subtle glass highlight across the top of the card */
.mbti-card::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,0) 40%);
}
/* grain inside the card only */
.mbti-card::after{
  content:"";position:absolute;inset:0;pointer-events:none;opacity:.08;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
}

.card-inner{
  position:relative;z-index:2;
  width:100%;height:100%;
  display:flex;flex-direction:column;
  padding:18px 22px;
}

/* corner metadata — INSIDE OUT THE COLOR, type name */
.card-top{display:flex;justify-content:space-between;align-items:flex-start}
.card-kicker{font-size:8px;font-weight:600;letter-spacing:2px;color:rgba(255,255,255,.95);text-transform:uppercase;line-height:1.5;text-shadow:0 1px 4px rgba(0,0,0,.15)}
.card-kicker .sm{display:block;font-weight:300;opacity:.8;margin-top:1px}
.card-badge{
  width:18px;height:18px;border-radius:4px;
  background:rgba(255,255,255,.85);
  box-shadow:0 1px 4px rgba(0,0,0,.1);
}

/* huge MBTI letters */
.card-letters{
  flex:1;display:flex;align-items:center;justify-content:center;
}
.preview{display:flex;gap:2px;align-items:baseline;justify-content:center}
.preview-letter{
  font-size:64px;font-weight:900;letter-spacing:-1px;line-height:1;
  color:rgba(255,255,255,.95);
  text-shadow:0 2px 14px rgba(0,0,0,.18);
  transition:color .4s,opacity .4s,transform .4s;
  min-width:42px;text-align:center;
  font-family:'Inter',sans-serif;
}
.preview-letter.placeholder{
  color:rgba(255,255,255,.55);
  font-weight:700;
  text-shadow:0 1px 6px rgba(0,0,0,.08);
}

/* bottom of card: type name */
.card-bottom{
  display:flex;justify-content:space-between;align-items:flex-end;
}
.card-name-cn{font-size:13px;font-weight:500;letter-spacing:2px;color:rgba(255,255,255,.98);text-shadow:0 1px 6px rgba(0,0,0,.2)}
.card-name-en{font-size:10px;font-weight:300;letter-spacing:3px;color:rgba(255,255,255,.85);text-transform:uppercase;margin-top:2px;text-shadow:0 1px 4px rgba(0,0,0,.15)}
.card-num{font-size:22px;font-weight:200;color:rgba(255,255,255,.9);letter-spacing:1px;text-shadow:0 1px 6px rgba(0,0,0,.18);font-feature-settings:"tnum"}

/* ── Dimension buttons (white frosted glass) ─── */
.dim-row{display:flex;gap:8px;margin-bottom:8px;width:100%;max-width:300px}
.dim-btn{
  flex:1;padding:0 6px;height:58px;
  background:rgba(255,255,255,.6);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,.85);
  border-radius:14px;
  color:#1a1a22;cursor:pointer;
  transition:background .22s,border-color .22s,transform .15s,box-shadow .22s,color .22s;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  box-shadow:0 2px 8px rgba(60,70,100,.06),inset 0 0 0 1px rgba(255,255,255,.4);
}
.dim-btn .big{font-size:18px;font-weight:700;color:#1a1a22;letter-spacing:.5px;line-height:1}
.dim-btn .hint{font-size:8px;font-weight:400;letter-spacing:1.2px;color:rgba(26,26,34,.55);text-transform:uppercase}
.dim-btn:active{transform:scale(.95)}
.dim-btn.sel{
  background:#1a1a22;
  border-color:#1a1a22;
  box-shadow:0 4px 14px rgba(26,26,34,.25);
}
.dim-btn.sel .big{color:#fff}
.dim-btn.sel .hint{color:rgba(255,255,255,.65)}

.submit-row{margin-top:16px;width:100%;max-width:300px;display:flex;justify-content:center}

#s-result{text-align:center;overflow:hidden;padding:0}

</style>
