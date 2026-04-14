<script lang="ts">
  import { displayState, displaySessionPanelOpen } from '$lib/features/display/state';
  import { createDisplaySession, deleteDisplaySession, regenerateJoinQr, viewDisplaySession } from '$lib/features/display/session';

  function formatSessionDate(value: string | undefined): string {
    if (!value) return 'Unknown time';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }
</script>

<div
  id="session-panel"
  class:open={$displaySessionPanelOpen}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
  onclick={(event) => {
    if (event.target === event.currentTarget) {
      displayState.closeSessionPanel();
    }
  }}
  onkeydown={(event) => {
    if (event.key === 'Escape') {
      displayState.closeSessionPanel();
    }
  }}
>
  <button id="sp-close" type="button" aria-label={$displayState.sessionPanel.closeLabel} onclick={() => displayState.closeSessionPanel()}>×</button>
  <div id="session-box">
    <h2>{$displayState.sessionPanel.title}</h2>
    <div class="sp-new">
      <input
      id="sp-name-input"
      type="text"
      placeholder={$displayState.sessionPanel.newSessionPlaceholder}
      maxlength="30"
      value={$displayState.sessionPanel.draftName}
      oninput={(event) => displayState.setSessionDraftName((event.currentTarget as HTMLInputElement).value)}
    />
      <button id="sp-create-btn" class="sp-btn" type="button" disabled={$displayState.sessionPanel.saving} onclick={() => void createDisplaySession()}>
      {$displayState.sessionPanel.newSessionButtonLabel}
    </button>
    </div>

    <div class="sp-join-settings">
      <div class="sp-join-row">
        <input
      id="sp-ip-input"
      type="text"
      placeholder={$displayState.sessionPanel.ipPlaceholder}
      value={$displayState.sessionPanel.hostInput}
      oninput={(event) => displayState.setSessionHostInput((event.currentTarget as HTMLInputElement).value)}
    />
        <button id="sp-generate-qr-btn" class="sp-btn" type="button" onclick={() => void regenerateJoinQr()}>
      {$displayState.sessionPanel.generateQrButtonLabel}
    </button>
      </div>
      <div id="sp-qr-wrap" class:open={Boolean($displayState.sessionPanel.joinQrDataUrl)}>
        {#if $displayState.sessionPanel.joinQrDataUrl}
      <img id="sp-qr" alt="Session join QR code" src={$displayState.sessionPanel.joinQrDataUrl} />
    {/if}
        <div id="sp-qr-url">{$displayState.sessionPanel.joinUrl}</div>
        <div class="sp-qr-hint">{$displayState.sessionPanel.qrHint}</div>
      </div>
    </div>

  {#if $displayState.sessionPanel.error}
    <div class="sp-error">{$displayState.sessionPanel.error}</div>
  {/if}

    <div id="sp-history-title">{$displayState.sessionPanel.historyTitle}</div>
    <div id="sp-history-list">
    {#if $displayState.sessionPanel.loading}
      <div class="sp-empty">Loading…</div>
    {:else if $displayState.sessionPanel.history.length === 0}
      <div class="sp-empty">{$displayState.sessionPanel.emptyHistory}</div>
    {:else}
      {#each $displayState.sessionPanel.history as session (session.id)}
        <div class="sp-row">
          <div class="sp-row-info">
            <div class="sp-row-name">{session.name}</div>
            <div class="sp-row-meta">{formatSessionDate(session.createdAt)} · {session.total} 人参与</div>
          </div>
          <button class="sp-btn" type="button" onclick={() => void viewDisplaySession(session.id)}>查看</button>
          <button class="sp-btn danger" type="button" onclick={() => void deleteDisplaySession(session.id)}>删除</button>
        </div>
      {/each}
    {/if}
    </div>

  {#if $displayState.sessionPanel.selected}
    <div class="sp-detail">
      <div class="sp-detail-title">{$displayState.sessionPanel.selected.name}</div>
      <div class="sp-detail-meta">建立: {formatSessionDate($displayState.sessionPanel.selected.createdAt)}</div>
      <div class="sp-detail-meta">总人数: {$displayState.sessionPanel.selected.total}</div>

      {#if Object.keys($displayState.sessionPanel.selected.counts).length > 0}
        <div class="sp-detail-list">
          {#each Object.entries($displayState.sessionPanel.selected.counts).sort((left, right) => right[1] - left[1]) as [mbti, count] (mbti)}
            <div class="sp-detail-item">
              <span>{mbti}</span>
              <strong>{count}</strong>
            </div>
          {/each}
        </div>
      {/if}

      {#if $displayState.sessionPanel.selected.participants?.length}
        <div class="sp-participants-title">参与者</div>
        <div class="sp-participants-list">
          {#each $displayState.sessionPanel.selected.participants as participant (participant.id)}
            <div class="sp-participant-item">
              <span>{participant.mbti} · {participant.nickname}</span>
              <time>{formatSessionDate(participant.createdAt)}</time>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  </div>
</div>

<style>
  #session-panel {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(220,228,255,0.55);
    backdrop-filter: blur(24px);
    pointer-events: all;
    align-items: center;
    justify-content: center;
  }

  :global(#session-panel.open) {
    display: flex;
  }

  #session-box {
    background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4));
    border: 1px solid rgba(255,255,255,0.7);
    box-shadow: 0 8px 32px rgba(31,38,135,0.1), inset 0 0 16px rgba(255,255,255,0.4);
    border-radius: 24px;
    padding: 36px 40px;
    width: 480px;
    max-height: 80vh;
    overflow-y: auto;
    color: #333;
  }

  #session-box h2 {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(30,40,60,0.45);
    margin-bottom: 28px;
  }

  .sp-new {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
  }

  .sp-new input,
  #sp-ip-input {
    flex: 1;
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(100,120,180,0.25);
    border-radius: 12px;
    color: #333;
    font-size: 13px;
    padding: 10px 16px;
    outline: none;
    letter-spacing: 1px;
  }

  .sp-new input::placeholder,
  #sp-ip-input::placeholder { color: rgba(30,40,60,0.3); }

  .sp-btn {
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(100,120,180,0.3);
    border-radius: 12px;
    color: #444;
    font-size: 11px;
    letter-spacing: 2px;
    padding: 10px 20px;
    cursor: pointer;
    text-transform: uppercase;
    transition: background .15s;
    white-space: nowrap;
  }

  .sp-btn:hover { background: rgba(255,255,255,0.8); }

  .sp-join-settings {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.15);
  }

  .sp-join-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
  }

  #sp-qr-wrap {
    display: none;
    text-align: center;
    padding: 14px;
    background: rgba(255,255,255,0.92);
    border-radius: 10px;
  }

  #sp-qr-wrap.open {
    display: block;
  }

  #sp-qr {
    width: 180px;
    height: 180px;
    display: block;
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
  }

  #sp-qr-url {
    margin-top: 8px;
    font-size: 11px;
    color: #333;
    word-break: break-all;
    letter-spacing: 0.5px;
  }

  .sp-qr-hint {
    margin-top: 4px;
    font-size: 10px;
    color: #888;
    letter-spacing: 2px;
  }

  #sp-history-title {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(30,40,60,0.3);
    margin-top: 14px;
    margin-bottom: 12px;
  }

  .sp-empty {
    color: rgba(30,40,60,0.3);
    font-size: 12px;
    padding: 16px 0;
  }

  .sp-error {
    margin-top: 12px;
    color: #b42318;
    font-size: 12px;
    letter-spacing: 0.4px;
  }

  .sp-detail {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.25);
  }

  .sp-detail-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(30,40,60,0.85);
    margin-bottom: 8px;
  }

  .sp-detail-meta {
    font-size: 11px;
    color: rgba(30,40,60,0.55);
    margin-bottom: 4px;
  }

  .sp-detail-list,
  .sp-participants-list {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }

  .sp-detail-item,
  .sp-participant-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: rgba(30,40,60,0.78);
  }

  .sp-participants-title {
    margin-top: 16px;
    font-size: 10px;
    color: rgba(30,40,60,0.45);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .sp-participant-item time {
    color: rgba(30,40,60,0.45);
    white-space: nowrap;
  }

  #sp-close {
    position: absolute;
    top: 24px;
    right: 28px;
    font-size: 22px;
    color: rgba(30,40,60,0.3);
    line-height: 1;
	background: transparent;
	border: 0;
	cursor: pointer;
  }
</style>
