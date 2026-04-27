<script lang="ts">
/**
 * SubmitButton.svelte — Primary submit control
 *
 * File-level:
 * Small reusable submit button with `loading` and `disabled` states.
 * Emits `submit` when activated by the user.
 */
import { createEventDispatcher } from 'svelte';
const { disabled = true as boolean, loading = false as boolean } = $props();
const dispatch = createEventDispatcher();

/**
 * handleClick()
 * Trigger the `submit` event if the control is not disabled or loading.
 */
function handleClick() { if (!disabled && !loading) dispatch('submit'); }
</script>

<button class="btn accent" id="submit-btn" onclick={handleClick} disabled={disabled}>
  {#if loading}色彩解析中…{:else}加入画布{/if}
</button>

<style>
/* Reuse global .btn styles present in page styles; keep local fallback */
.btn{border-radius:60px;padding:12px 36px;border:none}
</style>
