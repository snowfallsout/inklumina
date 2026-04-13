<script lang="ts">
  import { displayState } from '$lib/display/state';
</script>

<div id="footer">
  <div id="total-block">
    {$displayState.footer.participantsLabel}
    <strong id="total-num">{$displayState.footer.participantCount}</strong>
  </div>
  <div id="join-block">
    <b>{$displayState.footer.scanToJoinLabel}</b>
    <div id="corner-qr-box">
      {#if $displayState.sessionPanel.joinQrDataUrl}
        <img id="corner-qr" alt="Join QR code" src={$displayState.sessionPanel.joinQrDataUrl} />
      {/if}
      <div id="corner-qr-url">{$displayState.sessionPanel.joinUrl}</div>
      {#if !$displayState.sessionPanel.joinQrDataUrl}
        <div id="corner-qr-hint">
          {#each $displayState.footer.qrHintLines as line, index (line)}
            {line}{#if index < $displayState.footer.qrHintLines.length - 1}<br />{/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  #footer {
    position: absolute;
    bottom: 26px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 30px;
  }

  #total-block {
    color: rgba(30,40,60,0.38);
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  #total-block strong {
    color: rgba(30,40,60,0.75);
    font-size: 26px;
    font-weight: 100;
    letter-spacing: 6px;
    display: block;
    margin-top: 2px;
  }

  #join-block {
    text-align: right;
    color: rgba(30,40,60,0.35);
    font-size: 10px;
    letter-spacing: 2px;
    line-height: 1.9;
  }

  #join-block b {
    color: rgba(30,40,60,0.65);
    font-size: 13px;
    font-weight: 400;
    display: block;
    letter-spacing: 3px;
  }

  #corner-qr-box {
    margin-top: 8px;
    display: inline-block;
    text-align: center;
  }

  #corner-qr {
    background: #fff;
    border-radius: 6px;
    padding: 5px;
    border: 1px solid rgba(200,210,230,0.45);
    box-shadow: 0 2px 8px rgba(31,38,135,0.08);
    width: 120px;
    height: 120px;
    display: block;
  }

  #corner-qr-url {
    font-size: 9px;
    color: rgba(30,40,60,0.4);
    letter-spacing: 0.5px;
    margin-top: 4px;
    word-break: break-all;
    max-width: 120px;
  }

  #corner-qr-hint {
    font-size: 9px;
    color: rgba(30,40,60,0.35);
    letter-spacing: 1px;
    margin-top: 6px;
    max-width: 130px;
    line-height: 1.6;
  }
</style>
