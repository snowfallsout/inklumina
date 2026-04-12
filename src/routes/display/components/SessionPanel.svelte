<script>
  import { createEventDispatcher } from 'svelte';
  export let open = false;
  const dispatch = createEventDispatcher();

  let active = null;
  let history = [];
  let sessionName = '';
  let loading = false;
  let previousOpen = false;

  function close(){ dispatch('close'); }

  async function loadSessions() {
    loading = true;
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      active = data.active;
      history = data.history || [];
    } finally {
      loading = false;
    }
  }

  async function createSession() {
    const response = await fetch('/api/sessions/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sessionName }),
    });

    const data = await response.json();
    if (data?.ok) {
      sessionName = '';
      await loadSessions();
    }
  }

  async function deleteSession(id) {
    const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (data?.ok) await loadSessions();
  }

  async function viewSession(id) {
    const response = await fetch(`/api/sessions/${id}`);
    const data = await response.json();
    const counts = Object.entries(data.counts || {})
      .sort((a, b) => b[1] - a[1])
      .map(([m, n]) => `${m}: ${n} 人`)
      .join('\n');
    alert(`${data.name}\n创建: ${new Date(data.createdAt).toLocaleString()}\n总人数: ${data.total}\n\n${counts || '无数据'}`);
  }

  $: if (open && !previousOpen) {
    loadSessions();
  }

  $: previousOpen = open;
</script>

<div id="session-panel" class:open={open} on:click={close}>
  <div id="session-box" on:click|stopPropagation>
    <div id="sp-close" on:click={close}>✕</div>
    <h2>Session Manager</h2>
    <div class="sp-new">
      <input bind:value={sessionName} placeholder="Session name" />
      <button class="sp-btn" on:click={createSession}>Create</button>
    </div>
    <div class="active-line">
      当前场次：{active?.name || '—'}
    </div>
    <div id="sp-history-title">Recent Sessions</div>
    {#if loading}
      <div class="empty">Loading…</div>
    {:else if history.length === 0}
      <div class="empty">暂无历史记录</div>
    {:else}
      {#each history as item}
        <div class="sp-row">
          <div class="sp-row-info">
            <div class="sp-row-name">{item.name}</div>
            <div class="sp-row-meta">{item.total} participants • {new Date(item.createdAt).toLocaleString()}</div>
          </div>
          <div class="sp-actions">
            <button class="sp-btn" on:click={() => viewSession(item.id)}>View</button>
            <button class="sp-btn danger" on:click={() => deleteSession(item.id)}>Delete</button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  #session-panel { display:none; position:fixed; inset:0; z-index:100; background:rgba(220,228,255,0.55); backdrop-filter:blur(24px); align-items:center; justify-content:center; pointer-events:auto }
  #session-panel.open { display:flex }
  #session-box { position:relative; background:linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4)); border:1px solid rgba(255,255,255,0.7); box-shadow:0 8px 32px rgba(31,38,135,0.1); border-radius:24px; padding:36px 40px; width:min(520px, calc(100vw - 24px)); max-height:80vh; overflow-y:auto }
  #sp-close { position:absolute; top:24px; right:28px; font-size:22px; color:rgba(30,40,60,0.3); cursor:pointer }
  .sp-new { display:flex; gap:10px; margin-bottom:32px }
  .sp-new input { flex:1; background:rgba(255,255,255,0.5); border:1px solid rgba(100,120,180,0.25); border-radius:12px; padding:10px 16px }
  .sp-btn { background:rgba(255,255,255,0.5); border:1px solid rgba(100,120,180,0.3); border-radius:12px; padding:10px 20px }
  .sp-btn.danger { border-color: rgba(200,60,60,0.35); color: rgba(180,50,50,0.9); }
  .sp-actions { display:flex; gap:8px; }
  .active-line { font-size:12px; color:rgba(30,40,60,0.5); margin-bottom:16px; }
  .empty { padding:12px 0; color:rgba(30,40,60,0.35); font-size:12px; }
</style>
