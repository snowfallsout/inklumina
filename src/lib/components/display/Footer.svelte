<!--
  Footer.svelte
  Doc: Bottom footer with participant totals and join / QR area.
  Notation:
    - Uses `$total` from `$lib/runes/mbti` and composes `CornerQR` component.
-->

<script lang="ts">
	import QrCode from './QrCode.svelte';
  import { getTotal } from '$lib/runes/mbti.svelte';
  import { session, setPanelOpen } from '$lib/runes/session.svelte';
  import { ui } from '$lib/runes/ui.svelte';

	let total = $derived.by(() => getTotal());
</script>

<footer class="display-footer">
  <div class="left-col">
    <div class="total-block">
      <div class="label">Participants</div>
      <strong class="num">{total}</strong>
    </div>
  </div>

  <div class="center-col">
    <div class="center-block">
      <div id="session-name">{session.sessionName || '— 默认活动 —'}</div>
      {#if ui.waitingVisible}
        <div id="waiting">Waiting for participants to join…</div>
      {/if}
      <div id="interaction-hint">Try smiling &nbsp;·&nbsp; Pinch your fingers and move your hands</div>
    </div>
    <button id="session-btn" onclick={() => setPanelOpen(true)} title="Open sessions">⊕ 新场次 / 历史</button>
  </div>

  <div class="right-col">
    <div class="join-block">
      <b>SCAN TO JOIN</b>
      <div class="corner-qr-box">
        <QrCode />
      </div>
    </div>
  </div>
</footer>

<style>
  /* Mirror static/display.html #footer styles */
  .display-footer { position: absolute; bottom: 26px; left: 0; right: 0; display:flex; justify-content:space-between; align-items:flex-end; padding: 0 30px; z-index:20 }
  .left-col { display:flex; align-items:flex-end }
  .total-block { color: rgba(30,40,60,0.38); font-size: 10px; letter-spacing: 2px; text-transform: uppercase }
  .total-block .num, .total-block strong { color: rgba(30,40,60,0.75); font-size: 26px; font-weight: 100; letter-spacing: 6px; display: block; margin-top: 2px }
  .center-col { display:flex; flex-direction:column; align-items:center; gap:8px }
  .center-block { display:flex; flex-direction:column; gap:6px; align-items:center }
  #session-name { color: rgba(30,40,60,0.28); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; text-align: center }
  #waiting { color: rgba(30,40,60,0.28); font-size: 12px; letter-spacing: 3px }
  #interaction-hint { font-size: 11px; color: rgba(30,40,60,0.72); letter-spacing: 3px }

  .right-col { display:flex; align-items:flex-end }
  .join-block { text-align: right; color: rgba(30,40,60,0.35); font-size: 10px; letter-spacing: 2px; line-height: 1.9 }
  .join-block b { color: rgba(30,40,60,0.65); font-size: 13px; font-weight: 400; display: block; letter-spacing: 3px }

  #session-btn { background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15));
    backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.5); border-radius: 30px;
    color: rgba(30,40,60,0.5); font-size: 10px; letter-spacing: 2px; padding: 7px 18px; cursor: pointer;
    pointer-events: all; transition: background .2s, color .2s; text-transform: uppercase; margin-top:8px }
  #session-btn:hover { background: rgba(255,255,255,0.6); color: rgba(30,40,60,0.85); }
</style>
