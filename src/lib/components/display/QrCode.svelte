<!--
  qrCode.svelte
  Doc: Corner/inline QR widget matching static/display.html styles.
  - Class-based selectors to match `display.html` (.corner-qr-box / .corner-qr / .corner-qr-url / .corner-qr-hint)
  - Uses qrcodejs if available (canvas), falls back to Google Chart img.
  - Exposes copy/open actions and updates when `$sessionName` changes.
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { sessionName } from '$lib/stores/session';

  let origin = '';
  let url = '';
  let qrBox: HTMLDivElement | null = null;
  let urlEl: HTMLDivElement | null = null;
  let currentSessionName: string | null = null;
  let unsubSession: (() => void) | null = null;

  // capture origin on client to build an absolute share URL
  onMount(() => {
    origin = location.origin;
    // subscribe to sessionName changes and update URL accordingly
    unsubSession = sessionName.subscribe((v) => {
      currentSessionName = v;
      updateUrl();
    });
    updateUrl();
  });

  onDestroy(() => {
    if (unsubSession) unsubSession();
  });

  function updateUrl() {
    if (!origin) return;
    if (currentSessionName) url = `${origin}/join/${currentSessionName}`;
    else url = '';
    // update visible URL text without relying on Svelte reactive state
    if (urlEl) urlEl.textContent = url;
    renderQR();
  }

  function renderQR() {
    if (!qrBox) return;
    qrBox.innerHTML = '';
    if (!url) return;

    // Prefer qrcodejs (canvas) if available (to match static/display.html)
    const Q = (window as any).QRCode;
    if (typeof Q === 'function') {
      try {
        // qrcodejs expects an element container
        new Q(qrBox, {
          text: url,
          width: 120,
          height: 120,
          colorDark: '#000',
          colorLight: '#fff',
          correctLevel: Q.CorrectLevel ? Q.CorrectLevel.M : undefined,
        });
        return;
      } catch (e) {
        // fall back to image
      }
    }

    // fallback: Google Chart API image
    const img = document.createElement('img');
    img.alt = 'QR code';
    img.src = `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(url)}`;
    qrBox.appendChild(img);
  }

  function copyUrl() {
    if (!url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      prompt('Copy this URL', url);
    }
  }
</script>

<div class="corner-qr-box">
  <div class="corner-qr" bind:this={qrBox}></div>
  <div class="corner-qr-url" bind:this={urlEl}></div>
  <div class="corner-qr-hint">在活动管理中<br>设置局域网 IP</div>
</div>

<style>
/* Mirror static/display.html styles but class-based for component usage */
.corner-qr-box {
  margin-top: 8px;
  display: inline-block;
  text-align: center;
}

/* qrcodejs appends both a <canvas> and an <img> fallback — show only canvas */
.corner-qr {
  display: inline-block;
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 6px;
  padding: 5px;
  border: 1px solid rgba(200,210,230,0.45);
  box-shadow: 0 2px 8px rgba(31,38,135,0.08);
}
.corner-qr-box canvas {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}
.corner-qr-box img {
  display: none !important;
}
.corner-qr-url {
  font-size: 9px;
  color: rgba(30,40,60,0.4);
  letter-spacing: 0.5px;
  margin-top: 4px;
  word-break: break-all;
  max-width: 120px;
}
.corner-qr-hint {
  font-size: 9px;
  color: rgba(30,40,60,0.35);
  letter-spacing: 1px;
  margin-top: 6px;
  max-width: 130px;
  line-height: 1.6;
}

/* simple action buttons (kept compact similar to CornerQR) */
.placeholder { font-size:12px; color:#666; padding:4px; }
</style>
