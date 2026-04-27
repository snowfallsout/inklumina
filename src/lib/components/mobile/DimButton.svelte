<script lang="ts">
/**
 * DimButton.svelte — Single MBTI dimension button
 *
 * File-level:
 * Small presentational button used by `DimRow`. Emits `toggle` when
 * activated. Keep logic minimal to stay declarative.
 */
import { createEventDispatcher } from 'svelte';
const { value = '' as string, selected = false as boolean, hint = '' as string } = $props();
const dispatch = createEventDispatcher();

/**
 * handleClick()
 * Emit a `toggle` event with the current `value`.
 */
function handleClick() { dispatch('toggle', { value }); }
</script>

  <button class="dim-btn" class:sel={selected} onclick={handleClick} aria-pressed={selected}>
  <span class="big">{value}</span>
  <span class="hint">{hint}</span>
</button>

<style>
.dim-btn{flex:1;padding:0 6px;height:58px;background:rgba(255,255,255,.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.85);border-radius:14px;color:#1a1a22;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 2px 8px rgba(60,70,100,.06),inset 0 0 0 1px rgba(255,255,255,.4)}
.dim-btn .big{font-size:18px;font-weight:700;color:#1a1a22}
.dim-btn .hint{font-size:8px;color:rgba(26,26,34,.55);text-transform:uppercase}
.dim-btn:active{transform:scale(.95)}
.dim-btn.sel{background:#1a1a22;border-color:#1a1a22;box-shadow:0 4px 14px rgba(26,26,34,.25)}
.dim-btn.sel .big{color:#fff}
.dim-btn.sel .hint{color:rgba(255,255,255,.65)}
</style>
