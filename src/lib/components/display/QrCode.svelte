<!--
  QrCode.svelte
  Doc: Corner/inline QR widget matching static/display.html styles.
  - Class-based selectors to match `display.html` (.corner-qr-box / .corner-qr / .corner-qr-url / .corner-qr-hint)
  - Uses a lightweight image QR source to avoid adding new dependencies.
  - Updates when `sessionName` changes.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { sessionName } from '$lib/runes/session.svelte';

  let origin = $state('');

  // Build an absolute join URL after the component mounts on the client.
  const url = $derived.by(() => {
    if (!origin || !sessionName) return '';
    return `${origin}/join/${sessionName}`;
  });

  // Use a remote QR image as the simplest renderable fallback.
  const qrSrc = $derived.by(() => {
    if (!url) return '';
    return `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(url)}`;
  });

  onMount(() => {
    origin = location.origin;
  });
</script>

<div class="corner-qr-box">
  {#if qrSrc}
    <img class="corner-qr" alt="QR code" src={qrSrc} />
  {:else}
    <div class="corner-qr placeholder" aria-hidden="true"></div>
  {/if}
  <div class="corner-qr-url">{url}</div>
  <div class="corner-qr-hint">在活动管理中<br>设置局域网 IP</div>
</div>

<style>
  .corner-qr-box {
    margin-top: 8px;
    display: inline-block;
    text-align: center;
  }

  .corner-qr {
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

  .corner-qr.placeholder {
    box-sizing: border-box;
  }

  .corner-qr-url {
    font-size: 9px;
    color: rgba(30, 40, 60, 0.4);
    letter-spacing: 0.5px;
    margin-top: 4px;
    word-break: break-all;
    max-width: 120px;
  }

  .corner-qr-hint {
    font-size: 9px;
    color: rgba(30, 40, 60, 0.35);
    letter-spacing: 1px;
    margin-top: 6px;
    max-width: 130px;
    line-height: 1.6;
  }
</style>
