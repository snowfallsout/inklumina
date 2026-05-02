<!--
  QrCode.svelte
  Doc: JoinQr widget for the display footer.
  - Renders the scan target used by mobile users to join the active display session.
  - Mirrors the legacy corner QR area from `static/display.html`.
  - Keeps the widget browser-only and dependency-light by using a remote QR image fallback.
-->

<script lang="ts">
  import { session, getJoinUrl } from '$lib/state/session.svelte';

  // Reactive join URL shown below the code and embedded into the QR image source.
  const joinUrl = $derived.by(() => getJoinUrl(session.sessionName ?? undefined));

  // Use a remote QR image as the simplest renderable fallback.
  const joinQrSrc = $derived.by(() => {
    if (!joinUrl) return '';
    return `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(joinUrl)}`;
  });
</script>

<div class="joinqr-box">
  {#if joinQrSrc}
    <img class="joinqr" alt="Join QR code" src={joinQrSrc} />
  {:else}
    <div class="joinqr placeholder" aria-hidden="true"></div>
  {/if}
  <div class="joinqr-url">{joinUrl}</div>
  <div class="joinqr-hint">在活动管理中<br>设置局域网 IP</div>
</div>

<style>
  .joinqr-box {
    margin-top: 8px;
    display: inline-block;
    text-align: center;
  }

  .joinqr {
    display: inline-block;
    width: 120px;
    height: 120px;
    background: #fff;
    border-radius: 6px;
    object-fit: cover;
    padding: 5px;
    border: 1px solid rgba(200, 210, 230, 0.45);
    box-shadow: 0 2px 8px rgba(31, 38, 135, 0.08);
  }

  .joinqr.placeholder {
    box-sizing: border-box;
  }

  .joinqr-url {
    font-size: 9px;
    color: rgba(30, 40, 60, 0.4);
    letter-spacing: 0.5px;
    margin-top: 4px;
    word-break: break-all;
    max-width: 120px;
  }

  .joinqr-hint {
    font-size: 9px;
    color: rgba(30, 40, 60, 0.35);
    letter-spacing: 1px;
    margin-top: 6px;
    max-width: 130px;
    line-height: 1.6;
  }
</style>
