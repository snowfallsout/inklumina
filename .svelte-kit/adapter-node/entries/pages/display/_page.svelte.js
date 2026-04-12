import { c as create_ssr_component, o as onDestroy, b as add_attribute, a as subscribe, d as each, e as escape, f as createEventDispatcher, n as null_to_empty, v as validate_component } from "../../../chunks/ssr.js";
import { w as writable, d as derived } from "../../../chunks/index.js";
let rafId = null;
function onResize() {
  return;
}
function stopLoop() {
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = null;
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", onResize);
  }
}
const mbtiCounts = writable({});
const Canvas = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let canvasEl;
  onDestroy(() => {
    stopLoop();
  });
  return `<canvas style="width:100%;height:100%"${add_attribute("this", canvasEl, 0)}></canvas>`;
});
const css$7 = {
  code: "#legend.svelte-16asely.svelte-16asely{position:absolute;left:22px;top:50%;transform:translateY(-50%);min-width:180px;padding:18px;border-radius:16px;background:linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35));box-shadow:0 8px 32px rgba(31,38,135,0.06)}#legend.svelte-16asely h3.svelte-16asely{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(0,0,0,0.35);margin:0 0 12px 0 }.dot.svelte-16asely.svelte-16asely{width:10px;height:10px;border-radius:50%;flex-shrink:0 }.lbl.svelte-16asely.svelte-16asely{color:#333;font-weight:700;min-width:36px }.track.svelte-16asely.svelte-16asely{flex:1;height:6px;background:rgba(0,0,0,0.06);border-radius:4px;overflow:hidden }.fill.svelte-16asely.svelte-16asely{height:100%;border-radius:4px }.cnt.svelte-16asely.svelte-16asely{min-width:28px;text-align:right;color:rgba(0,0,0,0.45) }",
  map: `{"version":3,"file":"Legend.svelte","sources":["Legend.svelte"],"sourcesContent":["<script>\\r\\n  import { mbtiCounts } from '$lib/stores/mbtiCounts.js';\\r\\n  import { derived } from 'svelte/store';\\r\\n\\r\\n  // derive sorted entries from store\\r\\n  const entries = derived(mbtiCounts, $c => {\\r\\n    const arr = Object.entries($c || {}).map(([k,v])=>({k,v}));\\r\\n    arr.sort((a,b)=> (b.v||0) - (a.v||0));\\r\\n    return arr.slice(0,12);\\r\\n  });\\r\\n\\r\\n  const total = derived(mbtiCounts, $c => Object.values($c || {}).reduce((s,n)=>s+(n||0),0));\\r\\n\\r\\n  const colorFor = (k) => {\\r\\n    // deterministic color by key\\r\\n    const colors = ['#FF8FB3','#92FE9D','#66CCFF','#FFD36A','#C38CFF','#FFB47A','#9EE2F2','#FF9DDC'];\\r\\n    let n = 0; for (let i=0;i<k.length;i++) n = (n*31 + k.charCodeAt(i)) >>> 0;\\r\\n    return colors[n % colors.length];\\r\\n  };\\r\\n<\/script>\\r\\n\\r\\n<div id=\\"legend\\" style=\\"pointer-events:auto\\">\\r\\n  <h3>Present</h3>\\r\\n  {#if $total === 0}\\r\\n    <div style=\\"padding:8px 0;color:rgba(0,0,0,0.35)\\">No participants yet</div>\\r\\n  {:else}\\r\\n    {#each $entries as e}\\r\\n      <div class=\\"row on\\" style=\\"--c: {colorFor(e.k)}; display:flex; align-items:center; gap:8px; padding:6px 0;\\">\\r\\n        <div class=\\"dot\\" style=\\"background:{colorFor(e.k)}\\"></div>\\r\\n        <div class=\\"lbl\\">{e.k}</div>\\r\\n        <div class=\\"track\\">\\r\\n          <div class=\\"fill\\" style=\\"width:{Math.round((e.v/$total)*100)}%; background:{colorFor(e.k)}\\"></div>\\r\\n        </div>\\r\\n        <div class=\\"cnt\\">{e.v}</div>\\r\\n      </div>\\r\\n    {/each}\\r\\n  {/if}\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  #legend { position:absolute; left:22px; top:50%; transform:translateY(-50%); min-width:180px; padding:18px; border-radius:16px; background:linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35)); box-shadow:0 8px 32px rgba(31,38,135,0.06); }\\r\\n  #legend h3 { font-size:9px; letter-spacing:3px; text-transform:uppercase; color:rgba(0,0,0,0.35); margin:0 0 12px 0 }\\r\\n  .dot{ width:10px; height:10px; border-radius:50%; flex-shrink:0 }\\r\\n  .lbl{ color:#333; font-weight:700; min-width:36px }\\r\\n  .track{ flex:1; height:6px; background:rgba(0,0,0,0.06); border-radius:4px; overflow:hidden }\\r\\n  .fill{ height:100%; border-radius:4px }\\r\\n  .cnt{ min-width:28px; text-align:right; color:rgba(0,0,0,0.45) }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAwCE,qCAAQ,CAAE,SAAS,QAAQ,CAAE,KAAK,IAAI,CAAE,IAAI,GAAG,CAAE,UAAU,WAAW,IAAI,CAAC,CAAE,UAAU,KAAK,CAAE,QAAQ,IAAI,CAAE,cAAc,IAAI,CAAE,WAAW,gBAAgB,MAAM,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAE,WAAW,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,EAAE,CAAC,EAAE,CAAC,GAAG,CAAC,IAAI,CAAG,CAC/P,sBAAO,CAAC,iBAAG,CAAE,UAAU,GAAG,CAAE,eAAe,GAAG,CAAE,eAAe,SAAS,CAAE,MAAM,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAE,OAAO,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CACpH,kCAAI,CAAE,MAAM,IAAI,CAAE,OAAO,IAAI,CAAE,cAAc,GAAG,CAAE,YAAY,CAAC,CAAC,CAChE,kCAAI,CAAE,MAAM,IAAI,CAAE,YAAY,GAAG,CAAE,UAAU,IAAI,CAAC,CAClD,oCAAM,CAAE,KAAK,CAAC,CAAE,OAAO,GAAG,CAAE,WAAW,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAE,cAAc,GAAG,CAAE,SAAS,MAAM,CAAC,CAC5F,mCAAK,CAAE,OAAO,IAAI,CAAE,cAAc,GAAG,CAAC,CACtC,kCAAI,CAAE,UAAU,IAAI,CAAE,WAAW,KAAK,CAAE,MAAM,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC"}`
};
const Legend = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $total, $$unsubscribe_total;
  let $entries, $$unsubscribe_entries;
  const entries = derived(mbtiCounts, ($c) => {
    const arr = Object.entries($c || {}).map(([k, v]) => ({ k, v }));
    arr.sort((a, b) => (b.v || 0) - (a.v || 0));
    return arr.slice(0, 12);
  });
  $$unsubscribe_entries = subscribe(entries, (value) => $entries = value);
  const total = derived(mbtiCounts, ($c) => Object.values($c || {}).reduce((s, n) => s + (n || 0), 0));
  $$unsubscribe_total = subscribe(total, (value) => $total = value);
  const colorFor = (k) => {
    const colors = [
      "#FF8FB3",
      "#92FE9D",
      "#66CCFF",
      "#FFD36A",
      "#C38CFF",
      "#FFB47A",
      "#9EE2F2",
      "#FF9DDC"
    ];
    let n = 0;
    for (let i = 0; i < k.length; i++) n = n * 31 + k.charCodeAt(i) >>> 0;
    return colors[n % colors.length];
  };
  $$result.css.add(css$7);
  $$unsubscribe_total();
  $$unsubscribe_entries();
  return `<div id="legend" style="pointer-events:auto" class="svelte-16asely"><h3 class="svelte-16asely" data-svelte-h="svelte-7i97fj">Present</h3> ${$total === 0 ? `<div style="padding:8px 0;color:rgba(0,0,0,0.35)" data-svelte-h="svelte-s72dyj">No participants yet</div>` : `${each($entries, (e) => {
    return `<div class="row on" style="${"--c: " + escape(colorFor(e.k), true) + "; display:flex; align-items:center; gap:8px; padding:6px 0;"}"><div class="dot svelte-16asely" style="${"background:" + escape(colorFor(e.k), true)}"></div> <div class="lbl svelte-16asely">${escape(e.k)}</div> <div class="track svelte-16asely"><div class="fill svelte-16asely" style="${"width:" + escape(Math.round(e.v / $total * 100), true) + "%; background:" + escape(colorFor(e.k), true)}"></div></div> <div class="cnt svelte-16asely">${escape(e.v)}</div> </div>`;
  })}`} </div>`;
});
const css$6 = {
  code: "#header.svelte-1tfyfm5.svelte-1tfyfm5{position:absolute;top:28px;left:50%;transform:translateX(-50%);text-align:center;pointer-events:none }#header.svelte-1tfyfm5 h1.svelte-1tfyfm5{color:rgba(30,40,60,0.85);font-size:30px;font-weight:100;letter-spacing:18px;text-transform:uppercase }#header.svelte-1tfyfm5 p.svelte-1tfyfm5{color:rgba(30,40,60,0.38);font-size:10px;letter-spacing:5px;margin-top:6px;text-transform:uppercase }",
  map: `{"version":3,"file":"Header.svelte","sources":["Header.svelte"],"sourcesContent":["<script>\\r\\n  export let title = 'COLORFIELD';\\r\\n  export let subtitle = 'Live Particle Canvas';\\r\\n<\/script>\\r\\n\\r\\n<header id=\\"header\\">\\r\\n  <h1>{title}</h1>\\r\\n  <p>{subtitle}</p>\\r\\n</header>\\r\\n\\r\\n<style>\\r\\n  #header { position:absolute; top:28px; left:50%; transform:translateX(-50%); text-align:center; pointer-events:none }\\r\\n  #header h1 { color: rgba(30,40,60,0.85); font-size:30px; font-weight:100; letter-spacing:18px; text-transform:uppercase }\\r\\n  #header p { color: rgba(30,40,60,0.38); font-size:10px; letter-spacing:5px; margin-top:6px; text-transform:uppercase }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAWE,qCAAQ,CAAE,SAAS,QAAQ,CAAE,IAAI,IAAI,CAAE,KAAK,GAAG,CAAE,UAAU,WAAW,IAAI,CAAC,CAAE,WAAW,MAAM,CAAE,eAAe,IAAI,CAAC,CACpH,sBAAO,CAAC,iBAAG,CAAE,KAAK,CAAE,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAI,CAAE,YAAY,GAAG,CAAE,eAAe,IAAI,CAAE,eAAe,SAAS,CAAC,CACxH,sBAAO,CAAC,gBAAE,CAAE,KAAK,CAAE,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAI,CAAE,eAAe,GAAG,CAAE,WAAW,GAAG,CAAE,eAAe,SAAS,CAAC"}`
};
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title = "COLORFIELD" } = $$props;
  let { subtitle = "Live Particle Canvas" } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.subtitle === void 0 && $$bindings.subtitle && subtitle !== void 0) $$bindings.subtitle(subtitle);
  $$result.css.add(css$6);
  return `<header id="header" class="svelte-1tfyfm5"><h1 class="svelte-1tfyfm5">${escape(title)}</h1> <p class="svelte-1tfyfm5">${escape(subtitle)}</p> </header>`;
});
const css$5 = {
  code: "#footer.svelte-1qq4ocv.svelte-1qq4ocv{position:absolute;bottom:26px;left:0;right:0;display:flex;justify-content:space-between;align-items:flex-end;padding:0 30px;pointer-events:none }#total-block.svelte-1qq4ocv.svelte-1qq4ocv{color:rgba(30,40,60,0.38);font-size:10px;letter-spacing:2px;text-transform:uppercase }#total-block.svelte-1qq4ocv strong.svelte-1qq4ocv{color:rgba(30,40,60,0.75);font-size:26px;font-weight:100;letter-spacing:6px;display:block;margin-top:2px }#join-block.svelte-1qq4ocv.svelte-1qq4ocv{text-align:right;color:rgba(30,40,60,0.35);font-size:10px;letter-spacing:2px;line-height:1.9 }#join-block.svelte-1qq4ocv b.svelte-1qq4ocv{color:rgba(30,40,60,0.65);font-size:13px;font-weight:400;display:block;letter-spacing:3px }",
  map: '{"version":3,"file":"Footer.svelte","sources":["Footer.svelte"],"sourcesContent":["<script>\\r\\n  export let total = 0;\\r\\n<\/script>\\r\\n\\r\\n<div id=\\"footer\\">\\r\\n  <div id=\\"total-block\\">\\r\\n    TOTAL\\r\\n    <strong>{total}</strong>\\r\\n  </div>\\r\\n  <div id=\\"join-block\\">\\r\\n    Join with mobile\\r\\n    <b>Scan QR to join</b>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  #footer { position:absolute; bottom:26px; left:0; right:0; display:flex; justify-content:space-between; align-items:flex-end; padding:0 30px; pointer-events:none }\\r\\n  #total-block { color: rgba(30,40,60,0.38); font-size:10px; letter-spacing:2px; text-transform:uppercase }\\r\\n  #total-block strong { color: rgba(30,40,60,0.75); font-size:26px; font-weight:100; letter-spacing:6px; display:block; margin-top:2px }\\r\\n  #join-block { text-align:right; color: rgba(30,40,60,0.35); font-size:10px; letter-spacing:2px; line-height:1.9 }\\r\\n  #join-block b { color: rgba(30,40,60,0.65); font-size:13px; font-weight:400; display:block; letter-spacing:3px }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAgBE,qCAAQ,CAAE,SAAS,QAAQ,CAAE,OAAO,IAAI,CAAE,KAAK,CAAC,CAAE,MAAM,CAAC,CAAE,QAAQ,IAAI,CAAE,gBAAgB,aAAa,CAAE,YAAY,QAAQ,CAAE,QAAQ,CAAC,CAAC,IAAI,CAAE,eAAe,IAAI,CAAC,CAClK,0CAAa,CAAE,KAAK,CAAE,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAI,CAAE,eAAe,GAAG,CAAE,eAAe,SAAS,CAAC,CACxG,2BAAY,CAAC,qBAAO,CAAE,KAAK,CAAE,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAI,CAAE,YAAY,GAAG,CAAE,eAAe,GAAG,CAAE,QAAQ,KAAK,CAAE,WAAW,GAAG,CAAC,CACrI,yCAAY,CAAE,WAAW,KAAK,CAAE,KAAK,CAAE,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAI,CAAE,eAAe,GAAG,CAAE,YAAY,GAAG,CAAC,CAChH,0BAAW,CAAC,gBAAE,CAAE,KAAK,CAAE,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAI,CAAE,YAAY,GAAG,CAAE,QAAQ,KAAK,CAAE,eAAe,GAAG,CAAC"}'
};
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { total = 0 } = $$props;
  if ($$props.total === void 0 && $$bindings.total && total !== void 0) $$bindings.total(total);
  $$result.css.add(css$5);
  return `<div id="footer" class="svelte-1qq4ocv"><div id="total-block" class="svelte-1qq4ocv">TOTAL
    <strong class="svelte-1qq4ocv">${escape(total)}</strong></div> <div id="join-block" class="svelte-1qq4ocv" data-svelte-h="svelte-1cm6e6k">Join with mobile
    <b class="svelte-1qq4ocv">Scan QR to join</b></div> </div>`;
});
const css$4 = {
  code: ".controls-root.svelte-7o1ek6{position:fixed;bottom:18px;left:18px;pointer-events:auto}.session-btn.svelte-7o1ek6{padding:7px 16px;border-radius:30px;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:2px;cursor:pointer }.spawn-btn.svelte-7o1ek6{margin-left:10px;padding:8px 12px;border-radius:8px;background:#fff;border:1px solid #ddd;cursor:pointer }",
  map: `{"version":3,"file":"Controls.svelte","sources":["Controls.svelte"],"sourcesContent":["<script>\\r\\n  import { createEventDispatcher } from 'svelte';\\r\\n  const dispatch = createEventDispatcher();\\r\\n\\r\\n  function toggleSession(){ dispatch('toggleSession'); }\\r\\n  function spawnTest(){\\r\\n    window.dispatchEvent(new CustomEvent('cf:spawn', { detail: { color: '#FF00FF', count: 32 } }));\\r\\n    dispatch('spawnTest');\\r\\n  }\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"controls-root\\">\\r\\n  <button id=\\"session-btn\\" on:click={toggleSession} class=\\"session-btn\\">Session</button>\\r\\n  <button on:click={spawnTest} class=\\"spawn-btn\\">Spawn Test</button>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  .controls-root { position:fixed; bottom:18px; left:18px; pointer-events:auto; }\\r\\n  .session-btn { padding:7px 16px; border-radius:30px; background:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:2px; cursor:pointer }\\r\\n  .spawn-btn { margin-left:10px; padding:8px 12px; border-radius:8px; background:#fff; border:1px solid #ddd; cursor:pointer }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAiBE,4BAAe,CAAE,SAAS,KAAK,CAAE,OAAO,IAAI,CAAE,KAAK,IAAI,CAAE,eAAe,IAAM,CAC9E,0BAAa,CAAE,QAAQ,GAAG,CAAC,IAAI,CAAE,cAAc,IAAI,CAAE,WAAW,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,eAAe,SAAS,CAAE,eAAe,GAAG,CAAE,OAAO,OAAO,CAAC,CAC5L,wBAAW,CAAE,YAAY,IAAI,CAAE,QAAQ,GAAG,CAAC,IAAI,CAAE,cAAc,GAAG,CAAE,WAAW,IAAI,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,IAAI,CAAE,OAAO,OAAO,CAAC"}`
};
const Controls = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  $$result.css.add(css$4);
  return `<div class="controls-root svelte-7o1ek6"><button id="session-btn" class="session-btn svelte-7o1ek6" data-svelte-h="svelte-12utpkz">Session</button> <button class="spawn-btn svelte-7o1ek6" data-svelte-h="svelte-pht1c7">Spawn Test</button> </div>`;
});
const css$3 = {
  code: "#session-panel.svelte-16nidvf.svelte-16nidvf{display:none;position:fixed;inset:0;z-index:100;background:rgba(220,228,255,0.55);backdrop-filter:blur(24px);align-items:center;justify-content:center;pointer-events:auto }#session-panel.open.svelte-16nidvf.svelte-16nidvf{display:flex }#session-box.svelte-16nidvf.svelte-16nidvf{position:relative;background:linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4));border:1px solid rgba(255,255,255,0.7);box-shadow:0 8px 32px rgba(31,38,135,0.1);border-radius:24px;padding:36px 40px;width:min(520px, calc(100vw - 24px));max-height:80vh;overflow-y:auto }#sp-close.svelte-16nidvf.svelte-16nidvf{position:absolute;top:24px;right:28px;font-size:22px;color:rgba(30,40,60,0.3);cursor:pointer }.sp-new.svelte-16nidvf.svelte-16nidvf{display:flex;gap:10px;margin-bottom:32px }.sp-new.svelte-16nidvf input.svelte-16nidvf{flex:1;background:rgba(255,255,255,0.5);border:1px solid rgba(100,120,180,0.25);border-radius:12px;padding:10px 16px }.sp-btn.svelte-16nidvf.svelte-16nidvf{background:rgba(255,255,255,0.5);border:1px solid rgba(100,120,180,0.3);border-radius:12px;padding:10px 20px }.sp-btn.danger.svelte-16nidvf.svelte-16nidvf{border-color:rgba(200,60,60,0.35);color:rgba(180,50,50,0.9)}.sp-actions.svelte-16nidvf.svelte-16nidvf{display:flex;gap:8px}.active-line.svelte-16nidvf.svelte-16nidvf{font-size:12px;color:rgba(30,40,60,0.5);margin-bottom:16px}.empty.svelte-16nidvf.svelte-16nidvf{padding:12px 0;color:rgba(30,40,60,0.35);font-size:12px}",
  map: `{"version":3,"file":"SessionPanel.svelte","sources":["SessionPanel.svelte"],"sourcesContent":["<script>\\r\\n  import { createEventDispatcher } from 'svelte';\\r\\n  export let open = false;\\r\\n  const dispatch = createEventDispatcher();\\r\\n\\r\\n  let active = null;\\r\\n  let history = [];\\r\\n  let sessionName = '';\\r\\n  let loading = false;\\r\\n  let previousOpen = false;\\r\\n\\r\\n  function close(){ dispatch('close'); }\\r\\n\\r\\n  async function loadSessions() {\\r\\n    loading = true;\\r\\n    try {\\r\\n      const response = await fetch('/api/sessions');\\r\\n      const data = await response.json();\\r\\n      active = data.active;\\r\\n      history = data.history || [];\\r\\n    } finally {\\r\\n      loading = false;\\r\\n    }\\r\\n  }\\r\\n\\r\\n  async function createSession() {\\r\\n    const response = await fetch('/api/sessions/new', {\\r\\n      method: 'POST',\\r\\n      headers: { 'Content-Type': 'application/json' },\\r\\n      body: JSON.stringify({ name: sessionName }),\\r\\n    });\\r\\n\\r\\n    const data = await response.json();\\r\\n    if (data?.ok) {\\r\\n      sessionName = '';\\r\\n      await loadSessions();\\r\\n    }\\r\\n  }\\r\\n\\r\\n  async function deleteSession(id) {\\r\\n    const response = await fetch(\`/api/sessions/\${id}\`, { method: 'DELETE' });\\r\\n    const data = await response.json();\\r\\n    if (data?.ok) await loadSessions();\\r\\n  }\\r\\n\\r\\n  async function viewSession(id) {\\r\\n    const response = await fetch(\`/api/sessions/\${id}\`);\\r\\n    const data = await response.json();\\r\\n    const counts = Object.entries(data.counts || {})\\r\\n      .sort((a, b) => b[1] - a[1])\\r\\n      .map(([m, n]) => \`\${m}: \${n} 人\`)\\r\\n      .join('\\\\n');\\r\\n    alert(\`\${data.name}\\\\n创建: \${new Date(data.createdAt).toLocaleString()}\\\\n总人数: \${data.total}\\\\n\\\\n\${counts || '无数据'}\`);\\r\\n  }\\r\\n\\r\\n  $: if (open && !previousOpen) {\\r\\n    loadSessions();\\r\\n  }\\r\\n\\r\\n  $: previousOpen = open;\\r\\n<\/script>\\r\\n\\r\\n<div id=\\"session-panel\\" class:open={open} on:click={close}>\\r\\n  <div id=\\"session-box\\" on:click|stopPropagation>\\r\\n    <div id=\\"sp-close\\" on:click={close}>✕</div>\\r\\n    <h2>Session Manager</h2>\\r\\n    <div class=\\"sp-new\\">\\r\\n      <input bind:value={sessionName} placeholder=\\"Session name\\" />\\r\\n      <button class=\\"sp-btn\\" on:click={createSession}>Create</button>\\r\\n    </div>\\r\\n    <div class=\\"active-line\\">\\r\\n      当前场次：{active?.name || '—'}\\r\\n    </div>\\r\\n    <div id=\\"sp-history-title\\">Recent Sessions</div>\\r\\n    {#if loading}\\r\\n      <div class=\\"empty\\">Loading…</div>\\r\\n    {:else if history.length === 0}\\r\\n      <div class=\\"empty\\">暂无历史记录</div>\\r\\n    {:else}\\r\\n      {#each history as item}\\r\\n        <div class=\\"sp-row\\">\\r\\n          <div class=\\"sp-row-info\\">\\r\\n            <div class=\\"sp-row-name\\">{item.name}</div>\\r\\n            <div class=\\"sp-row-meta\\">{item.total} participants • {new Date(item.createdAt).toLocaleString()}</div>\\r\\n          </div>\\r\\n          <div class=\\"sp-actions\\">\\r\\n            <button class=\\"sp-btn\\" on:click={() => viewSession(item.id)}>View</button>\\r\\n            <button class=\\"sp-btn danger\\" on:click={() => deleteSession(item.id)}>Delete</button>\\r\\n          </div>\\r\\n        </div>\\r\\n      {/each}\\r\\n    {/if}\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  #session-panel { display:none; position:fixed; inset:0; z-index:100; background:rgba(220,228,255,0.55); backdrop-filter:blur(24px); align-items:center; justify-content:center; pointer-events:auto }\\r\\n  #session-panel.open { display:flex }\\r\\n  #session-box { position:relative; background:linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4)); border:1px solid rgba(255,255,255,0.7); box-shadow:0 8px 32px rgba(31,38,135,0.1); border-radius:24px; padding:36px 40px; width:min(520px, calc(100vw - 24px)); max-height:80vh; overflow-y:auto }\\r\\n  #sp-close { position:absolute; top:24px; right:28px; font-size:22px; color:rgba(30,40,60,0.3); cursor:pointer }\\r\\n  .sp-new { display:flex; gap:10px; margin-bottom:32px }\\r\\n  .sp-new input { flex:1; background:rgba(255,255,255,0.5); border:1px solid rgba(100,120,180,0.25); border-radius:12px; padding:10px 16px }\\r\\n  .sp-btn { background:rgba(255,255,255,0.5); border:1px solid rgba(100,120,180,0.3); border-radius:12px; padding:10px 20px }\\r\\n  .sp-btn.danger { border-color: rgba(200,60,60,0.35); color: rgba(180,50,50,0.9); }\\r\\n  .sp-actions { display:flex; gap:8px; }\\r\\n  .active-line { font-size:12px; color:rgba(30,40,60,0.5); margin-bottom:16px; }\\r\\n  .empty { padding:12px 0; color:rgba(30,40,60,0.35); font-size:12px; }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAgGE,4CAAe,CAAE,QAAQ,IAAI,CAAE,SAAS,KAAK,CAAE,MAAM,CAAC,CAAE,QAAQ,GAAG,CAAE,WAAW,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAE,gBAAgB,KAAK,IAAI,CAAC,CAAE,YAAY,MAAM,CAAE,gBAAgB,MAAM,CAAE,eAAe,IAAI,CAAC,CACpM,cAAc,mCAAM,CAAE,QAAQ,IAAI,CAAC,CACnC,0CAAa,CAAE,SAAS,QAAQ,CAAE,WAAW,gBAAgB,MAAM,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,WAAW,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,EAAE,CAAC,EAAE,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,cAAc,IAAI,CAAE,QAAQ,IAAI,CAAC,IAAI,CAAE,MAAM,IAAI,KAAK,CAAC,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAE,WAAW,IAAI,CAAE,WAAW,IAAI,CAAC,CACrT,uCAAU,CAAE,SAAS,QAAQ,CAAE,IAAI,IAAI,CAAE,MAAM,IAAI,CAAE,UAAU,IAAI,CAAE,MAAM,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,GAAG,CAAC,CAAE,OAAO,OAAO,CAAC,CAC9G,qCAAQ,CAAE,QAAQ,IAAI,CAAE,IAAI,IAAI,CAAE,cAAc,IAAI,CAAC,CACrD,sBAAO,CAAC,oBAAM,CAAE,KAAK,CAAC,CAAE,WAAW,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAE,cAAc,IAAI,CAAE,QAAQ,IAAI,CAAC,IAAI,CAAC,CACzI,qCAAQ,CAAE,WAAW,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,cAAc,IAAI,CAAE,QAAQ,IAAI,CAAC,IAAI,CAAC,CAC1H,OAAO,qCAAQ,CAAE,YAAY,CAAE,KAAK,GAAG,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,KAAK,CAAE,KAAK,GAAG,CAAC,EAAE,CAAC,EAAE,CAAC,GAAG,CAAG,CACjF,yCAAY,CAAE,QAAQ,IAAI,CAAE,IAAI,GAAK,CACrC,0CAAa,CAAE,UAAU,IAAI,CAAE,MAAM,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,GAAG,CAAC,CAAE,cAAc,IAAM,CAC7E,oCAAO,CAAE,QAAQ,IAAI,CAAC,CAAC,CAAE,MAAM,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAM"}`
};
const SessionPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { open = false } = $$props;
  createEventDispatcher();
  let active = null;
  let history = [];
  let sessionName = "";
  let loading = false;
  let previousOpen = false;
  async function loadSessions() {
    loading = true;
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      active = data.active;
      history = data.history || [];
    } finally {
      loading = false;
    }
  }
  if ($$props.open === void 0 && $$bindings.open && open !== void 0) $$bindings.open(open);
  $$result.css.add(css$3);
  previousOpen = open;
  {
    if (open && !previousOpen) {
      loadSessions();
    }
  }
  return `<div id="session-panel" class="${["svelte-16nidvf", open ? "open" : ""].join(" ").trim()}"><div id="session-box" class="svelte-16nidvf"><div id="sp-close" class="svelte-16nidvf" data-svelte-h="svelte-1wzkgib">✕</div> <h2 data-svelte-h="svelte-8a97nv">Session Manager</h2> <div class="sp-new svelte-16nidvf"><input placeholder="Session name" class="svelte-16nidvf"${add_attribute("value", sessionName, 0)}> <button class="sp-btn svelte-16nidvf" data-svelte-h="svelte-146aczr">Create</button></div> <div class="active-line svelte-16nidvf">当前场次：${escape(active?.name || "—")}</div> <div id="sp-history-title" data-svelte-h="svelte-g5dybx">Recent Sessions</div> ${loading ? `<div class="empty svelte-16nidvf" data-svelte-h="svelte-1sn2szo">Loading…</div>` : `${history.length === 0 ? `<div class="empty svelte-16nidvf" data-svelte-h="svelte-13jo5zl">暂无历史记录</div>` : `${each(history, (item) => {
    return `<div class="sp-row"><div class="sp-row-info"><div class="sp-row-name">${escape(item.name)}</div> <div class="sp-row-meta">${escape(item.total)} participants • ${escape(new Date(item.createdAt).toLocaleString())}</div></div> <div class="sp-actions svelte-16nidvf"><button class="sp-btn svelte-16nidvf" data-svelte-h="svelte-pvqz64">View</button> <button class="sp-btn danger svelte-16nidvf" data-svelte-h="svelte-15u0amd">Delete</button></div> </div>`;
  })}`}`}</div> </div>`;
});
const toast = writable(null);
const css$2 = {
  code: ".toast-wrap.svelte-1ru8gui{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none }.toast-pill.svelte-1ru8gui{display:inline-block;padding:10px 28px;border-radius:50px;background:linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25));backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.6);box-shadow:0 4px 16px rgba(31,38,135,0.08);color:#333 }",
  map: `{"version":3,"file":"Toast.svelte","sources":["Toast.svelte"],"sourcesContent":["<script>\\r\\n  import { toast } from '$lib/stores/ui.js';\\r\\n<\/script>\\r\\n\\r\\n{#if $toast}\\r\\n  <div class=\\"toast-wrap\\"><div class=\\"toast-pill\\">{$toast.msg}</div></div>\\r\\n{/if}\\r\\n\\r\\n<style>\\r\\n  .toast-wrap { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none }\\r\\n  .toast-pill { display:inline-block; padding:10px 28px; border-radius:50px; background:linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25)); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.6); box-shadow:0 4px 16px rgba(31,38,135,0.08); color:#333 }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AASE,0BAAY,CAAE,SAAS,QAAQ,CAAE,IAAI,GAAG,CAAE,KAAK,GAAG,CAAE,UAAU,UAAU,IAAI,CAAC,IAAI,CAAC,CAAE,eAAe,IAAI,CAAC,CACxG,0BAAY,CAAE,QAAQ,YAAY,CAAE,QAAQ,IAAI,CAAC,IAAI,CAAE,cAAc,IAAI,CAAE,WAAW,gBAAgB,MAAM,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAE,gBAAgB,KAAK,IAAI,CAAC,CAAE,OAAO,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAE,WAAW,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,EAAE,CAAC,EAAE,CAAC,GAAG,CAAC,IAAI,CAAC,CAAE,MAAM,IAAI,CAAC"}`
};
const Toast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $toast, $$unsubscribe_toast;
  $$unsubscribe_toast = subscribe(toast, (value) => $toast = value);
  $$result.css.add(css$2);
  $$unsubscribe_toast();
  return `${$toast ? `<div class="toast-wrap svelte-1ru8gui"><div class="toast-pill svelte-1ru8gui">${escape($toast.msg)}</div></div>` : ``}`;
});
const css$1 = {
  code: "#emotion-badge.svelte-zd1fs3{position:absolute;top:28px;left:28px;color:rgba(30,40,60,0.28);font-size:10px;letter-spacing:2px;text-transform:uppercase;transition:color .5s }.SMILE.svelte-zd1fs3{color:#B08800 }.SAD.svelte-zd1fs3{color:#4169E1 }",
  map: `{"version":3,"file":"EmotionBadge.svelte","sources":["EmotionBadge.svelte"],"sourcesContent":["<script>\\r\\n  export let mood = 'NEUTRAL';\\r\\n  $: moodClass = mood;\\r\\n<\/script>\\r\\n\\r\\n<div id=\\"emotion-badge\\" class={moodClass}>{mood}</div>\\r\\n\\r\\n<style>\\r\\n  #emotion-badge { position:absolute; top:28px; left:28px; color:rgba(30,40,60,0.28); font-size:10px; letter-spacing:2px; text-transform:uppercase; transition:color .5s }\\r\\n  .SMILE { color: #B08800 }\\r\\n  .SAD { color: #4169E1 }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAQE,4BAAe,CAAE,SAAS,QAAQ,CAAE,IAAI,IAAI,CAAE,KAAK,IAAI,CAAE,MAAM,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,UAAU,IAAI,CAAE,eAAe,GAAG,CAAE,eAAe,SAAS,CAAE,WAAW,KAAK,CAAC,GAAG,CAAC,CACvK,oBAAO,CAAE,KAAK,CAAE,OAAO,CAAC,CACxB,kBAAK,CAAE,KAAK,CAAE,OAAO,CAAC"}`
};
const EmotionBadge = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let moodClass;
  let { mood = "NEUTRAL" } = $$props;
  if ($$props.mood === void 0 && $$bindings.mood && mood !== void 0) $$bindings.mood(mood);
  $$result.css.add(css$1);
  moodClass = mood;
  return `<div id="emotion-badge" class="${escape(null_to_empty(moodClass), true) + " svelte-zd1fs3"}">${escape(mood)}</div>`;
});
const css = {
  code: "main.svelte-484jga{position:relative;width:100%;height:100vh;overflow:hidden }.canvas-wrap.svelte-484jga{position:fixed;inset:0;z-index:10 }.ui-layer.svelte-484jga{position:fixed;inset:0;z-index:20;pointer-events:none }",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\r\\n  import Canvas from '$lib/components/Canvas.svelte';\\r\\n  import Legend from './components/Legend.svelte';\\r\\n  import Header from './components/Header.svelte';\\r\\n  import Footer from './components/Footer.svelte';\\r\\n  import Controls from './components/Controls.svelte';\\r\\n  import SessionPanel from './components/SessionPanel.svelte';\\r\\n  import Toast from './components/Toast.svelte';\\r\\n  import EmotionBadge from './components/EmotionBadge.svelte';\\r\\n\\r\\n  import { mbtiCounts } from '$lib/stores/mbtiCounts.js';\\r\\n  import { derived } from 'svelte/store';\\r\\n\\r\\n  let sessionOpen = false;\\r\\n  const total = derived(mbtiCounts, $c => Object.values($c || {}).reduce((s,n)=>s+(n||0),0));\\r\\n\\r\\n  function onToggleSession(){ sessionOpen = !sessionOpen; }\\r\\n  function onSpawnTest(){ /* spawn is emitted from Controls via cf:spawn already */ }\\r\\n<\/script>\\r\\n\\r\\n<main>\\r\\n  <div class=\\"canvas-wrap\\"><Canvas /></div>\\r\\n\\r\\n  <div class=\\"ui-layer\\">\\r\\n    <Header />\\r\\n    <EmotionBadge />\\r\\n    <Legend />\\r\\n    <Footer total={$total} />\\r\\n    <Controls on:toggleSession={onToggleSession} on:spawnTest={onSpawnTest} />\\r\\n    <Toast />\\r\\n    <SessionPanel open={sessionOpen} on:close={() => sessionOpen = false} />\\r\\n  </div>\\r\\n</main>\\r\\n\\r\\n<style>\\r\\n  main { position:relative; width:100%; height:100vh; overflow:hidden }\\r\\n  .canvas-wrap { position:fixed; inset:0; z-index:10 }\\r\\n  .ui-layer { position:fixed; inset:0; z-index:20; pointer-events:none }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAmCE,kBAAK,CAAE,SAAS,QAAQ,CAAE,MAAM,IAAI,CAAE,OAAO,KAAK,CAAE,SAAS,MAAM,CAAC,CACpE,0BAAa,CAAE,SAAS,KAAK,CAAE,MAAM,CAAC,CAAE,QAAQ,EAAE,CAAC,CACnD,uBAAU,CAAE,SAAS,KAAK,CAAE,MAAM,CAAC,CAAE,QAAQ,EAAE,CAAE,eAAe,IAAI,CAAC"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $total, $$unsubscribe_total;
  let sessionOpen = false;
  const total = derived(mbtiCounts, ($c) => Object.values($c || {}).reduce((s, n) => s + (n || 0), 0));
  $$unsubscribe_total = subscribe(total, (value) => $total = value);
  $$result.css.add(css);
  $$unsubscribe_total();
  return `<main class="svelte-484jga"><div class="canvas-wrap svelte-484jga">${validate_component(Canvas, "Canvas").$$render($$result, {}, {}, {})}</div> <div class="ui-layer svelte-484jga">${validate_component(Header, "Header").$$render($$result, {}, {}, {})} ${validate_component(EmotionBadge, "EmotionBadge").$$render($$result, {}, {}, {})} ${validate_component(Legend, "Legend").$$render($$result, {}, {}, {})} ${validate_component(Footer, "Footer").$$render($$result, { total: $total }, {}, {})} ${validate_component(Controls, "Controls").$$render($$result, {}, {}, {})} ${validate_component(Toast, "Toast").$$render($$result, {}, {}, {})} ${validate_component(SessionPanel, "SessionPanel").$$render($$result, { open: sessionOpen }, {}, {})}</div> </main>`;
});
export {
  Page as default
};
