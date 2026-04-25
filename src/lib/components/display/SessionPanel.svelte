<!--
  SessionPanel.svelte
  Doc: Displays session metadata and history and provides simple share/copy
  actions.
  Notation:
    - Reads `sessionName` and `history` from `$lib/runes/session`.
    - Does not mutate session state; actions are client-side only.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { sessionName, history, loadHistory, getJoinUrl, panelOpen, setPanelOpen } from '$lib/runes/session.svelte';
  import { createSession, deleteSession, viewSession } from '$lib/runes/session.svelte';
  import { showToast } from '$lib/runes/ui.svelte';

  onMount(() => {
    // attempt to populate history if an implementation exists
    loadHistory().catch(() => {});
  });

  let newName = $state('');

  function copySession() {
    if (!sessionName) return;
    const url = getJoinUrl(sessionName);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      prompt('Copy session URL', url);
    }
  }

  // New session actions (use store helpers)
  function handleCreate() {
    const name = newName && newName.trim() ? newName.trim() : undefined;
    createSession(name).then(() => {
      newName = '';
      loadHistory().catch(()=>{});
      showToast('✦ 新场次已開始', '#ffffff');
    });
  }

  function handleView(id: string) {
    viewSession(id);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete session?')) return;
    deleteSession(id);
    loadHistory().catch(()=>{});
  }
</script>

<div class="session-panel" role="dialog" tabindex="0" onkeydown={(e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOpen(false); }} onclick={(e) => {
    const el = e.target as Element | null;
    // don't close when clicking inside the panel box
    if (el && el.closest && el.closest('.session-box')) return;
    // ignore clicks originating from toast elements
    if (el && el.closest && el.closest('.toast-pill, .toast-wrap')) return;
    setPanelOpen(false);
  }}>
  <div class="session-box">
    <button id="sp-close" class="sp-close-btn" aria-label="Close sessions" onclick={() => setPanelOpen(false)} onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPanelOpen(false); } }}>
      ×
    </button>
    <div class="session-top">
      <div class="label">Session</div>
      <div class="name">{sessionName || '—'}</div>
      <div class="actions">
        <button class="sp-btn" onclick={copySession} title="Copy session link">Copy</button>
      </div>
    </div>

    <h2>活动场次管理</h2>
    <div class="sp-new">
      <input placeholder="New session name" bind:value={newName} />
      <button class="sp-btn" onclick={handleCreate}>开始新场次</button>
    </div>

    <div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.15)">
      <!-- QR / IP helpers could go here (kept minimal) -->
    </div>

    <div id="sp-history-title">历史记录</div>
    <div id="sp-history-list">
      {#if history.length}
        <ul>
          {#each history as item}
            <li>
              <div class="sp-row">
                <div class="sp-row-info">
                  <div class="sp-row-name">{item.name || item.id}</div>
                  {#if item.createdAt}
                    <div class="sp-row-meta">{new Date(item.createdAt).toLocaleString()}</div>
                  {/if}
                </div>
                <div class="sp-row-actions">
                  <button class="sp-btn" onclick={() => handleView(item.id)}>View</button>
                  <button class="sp-btn danger" onclick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <div style="color:rgba(255,255,255,0.2);font-size:12px;padding:16px 0">暂无历史记录</div>
      {/if}
    </div>
  </div>
</div>

<style>
.session-panel { position: fixed; inset: 0; z-index: 100; background: rgba(220,228,255,0.55); backdrop-filter: blur(24px); display:flex; align-items:center; justify-content:center; pointer-events: all }
.session-box { position: relative; background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4)); border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 8px 32px rgba(31,38,135,0.1), inset 0 0 16px rgba(255,255,255,0.4); border-radius: 24px; padding: 36px 40px; width: 480px; max-height: 80vh; overflow-y: auto; color: #333 }
.session-top { display:flex; align-items:center; gap:8px }
.label { font-size:12px; color:#666 }
.name { flex:1; font-weight:700 }
.actions button { font-size:12px; padding:6px 8px }
.sp-new { display:flex; gap:10px; margin-bottom:32px }
.sp-new input { flex:1; background: rgba(255,255,255,0.5); border: 1px solid rgba(100,120,180,0.25); border-radius: 12px; color: #333; font-size: 13px; padding: 10px 16px; outline: none }
.sp-new input::placeholder { color: rgba(30,40,60,0.3) }
.sp-btn { background: rgba(255,255,255,0.5); border: 1px solid rgba(100,120,180,0.3); border-radius: 12px; color: #444; font-size: 11px; letter-spacing: 2px; padding: 10px 20px; cursor: pointer; text-transform: uppercase }
.sp-btn.danger { border-color: rgba(200,60,60,0.35); color: rgba(180,50,50,0.9) }
#sp-history-title { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(30,40,60,0.3); margin-bottom: 12px }
.sp-row { display:flex; align-items:center; gap:10px; padding:11px 0; border-bottom: 1px solid rgba(0,0,0,0.06) }
.sp-row:last-child { border-bottom: none }
.sp-row-info { flex: 1 }
.sp-row-name { font-size: 13px; color: rgba(30,40,60,0.85) }
.sp-row-meta { font-size: 10px; color: rgba(30,40,60,0.4); letter-spacing: 1px; margin-top: 2px }
.sp-close-btn { position: absolute; top: 12px; right: 12px; font-size: 20px; color: rgba(30,40,60,0.45); cursor: pointer; pointer-events: all; line-height: 1; background: transparent; border: none; padding: 6px; border-radius: 6px }
.sp-close-btn:hover { color: rgba(30,40,60,0.75); background: rgba(0,0,0,0.03) }
</style>
