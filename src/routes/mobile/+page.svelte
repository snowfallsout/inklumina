<script>
  const mbtiOptions = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  let mbti = 'INTJ';
  let status = '请选择你的 MBTI，然后提交加入活动。';
  let busy = false;
  let luckyColor = '';

  async function submit() {
    busy = true;
    status = '提交中…';

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbti }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || '提交失败');
      }

      luckyColor = data.color;
      status = `${data.mbti} · ${data.nickname} · ${data.luckyPhrase}`;
    } catch (error) {
      status = error.message || '提交失败';
    } finally {
      busy = false;
    }
  }
</script>

<main class="mobile-shell">
  <section class="card">
    <p class="eyebrow">Colorfield Join</p>
    <h1>手机加入</h1>
    <p class="status">{status}</p>

    <label>
      <span>MBTI</span>
      <select bind:value={mbti}>
        {#each mbtiOptions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>

    <button class="submit" on:click={submit} disabled={busy}>
      {busy ? '处理中…' : '提交加入'}
    </button>

    {#if luckyColor}
      <div class="result" style={`border-color:${luckyColor}; color:${luckyColor}`}>
        幸运色：{luckyColor}
      </div>
    {/if}
  </section>
</main>

<style>
  .mobile-shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: radial-gradient(circle at top, #ffffff 0%, #eff2ff 38%, #e8ecff 100%);
    color: #24324a;
  }

  .card {
    width: min(100%, 440px);
    padding: 28px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(120, 140, 210, 0.18);
    box-shadow: 0 18px 60px rgba(50, 70, 120, 0.14);
    backdrop-filter: blur(18px);
  }

  .eyebrow {
    font-size: 12px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(36, 50, 74, 0.45);
    margin: 0 0 10px;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 32px;
    font-weight: 700;
  }

  .status {
    min-height: 24px;
    margin: 0 0 18px;
    color: rgba(36, 50, 74, 0.68);
  }

  label {
    display: grid;
    gap: 8px;
    margin-bottom: 18px;
  }

  label span {
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(36, 50, 74, 0.52);
  }

  select {
    width: 100%;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid rgba(120, 140, 210, 0.22);
    background: rgba(255, 255, 255, 0.85);
    color: inherit;
    font: inherit;
  }

  .submit {
    width: 100%;
    padding: 14px 18px;
    border: 0;
    border-radius: 14px;
    background: linear-gradient(135deg, #2c5cff, #5f7cff);
    color: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }

  .submit:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .result {
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid;
    background: rgba(255, 255, 255, 0.5);
    font-weight: 700;
  }
</style>
