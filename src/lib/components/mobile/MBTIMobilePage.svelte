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
import type { LuckyColorPayload } from '$lib/shared/contracts';
import { MBTI_NAMES } from '$lib/utils/mbti';
import { onMount } from 'svelte';

type MobileScreen = 'welcome' | 'mbti' | 'result';
type DimRowSelection = {
  dimension: number;
  value: string;
};
type HoloCardPreviewHandle = {
  generate: (opts?: { mbti?: string; color?: string; nickname?: string; phrase?: string }) => Promise<string | null>;
};

let sel = $state<Array<string | null>>([null, null, null, null]);
let loading = $state(false);
let previewRef = $state<HoloCardPreviewHandle | null>(null);
let screen = $state<MobileScreen>('welcome');

/**
 * onMount: initialize socket connection and listen for server replies.
 * When the server emits `lucky_color` the page transitions to the
 * result screen and instructs the preview to generate the image.
 */
onMount(() => {
  connect();
  socketOn('lucky_color', ({ mbti, color, nickname, luckyPhrase }: LuckyColorPayload) => {
    screen = 'result';
    if (previewRef && typeof previewRef.generate === 'function') {
      void previewRef.generate({
        mbti,
        color,
        nickname: nickname || MBTI_NAMES[mbti] || '',
        phrase: luckyPhrase ?? undefined
      });
    }
    loading = false;
  });
});

/**
 * handleSelect(payload)
 * Receive selection callbacks from child components and update the
 * local `sel` state array.
 */
function handleSelect(payload: DimRowSelection) {
  const { dimension, value } = payload;
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

    <DimRow dimension={0} values={[{value:'E',hint:'Extrovert'},{value:'I',hint:'Introvert'}]} selected={sel[0]} onselect={handleSelect} />
    <DimRow dimension={1} values={[{value:'N',hint:'Intuitive'},{value:'S',hint:'Sensing'}]} selected={sel[1]} onselect={handleSelect} />
    <DimRow dimension={2} values={[{value:'T',hint:'Thinking'},{value:'F',hint:'Feeling'}]} selected={sel[2]} onselect={handleSelect} />
    <DimRow dimension={3} values={[{value:'J',hint:'Judging'},{value:'P',hint:'Perceiving'}]} selected={sel[3]} onselect={handleSelect} />

    <div class="submit-row">
      <SubmitButton disabled={!isComplete()} loading={loading} onsubmit={submitMBTI} />
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
:global(body)::before{
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

.title{font-size:40px;font-weight:100;letter-spacing:14px;text-transform:uppercase;color:#1a1a22;margin-bottom:10px;text-align:center}
.subtitle{font-size:11px;letter-spacing:5px;color:rgba(26,26,34,.5);text-transform:uppercase;margin-bottom:72px;text-align:center}
.desc{font-size:14px;color:rgba(26,26,34,.65);line-height:1.9;text-align:center;max-width:280px;margin-bottom:60px}

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

.h-title{font-size:10px;font-weight:500;letter-spacing:5px;color:rgba(26,26,34,.7);text-transform:uppercase;margin-bottom:4px;text-align:center}
.h-sub{font-size:11px;font-weight:300;letter-spacing:3px;color:rgba(26,26,34,.4);margin-bottom:20px;text-align:center}

.submit-row{margin-top:16px;width:100%;max-width:300px;display:flex;justify-content:center}

</style>
