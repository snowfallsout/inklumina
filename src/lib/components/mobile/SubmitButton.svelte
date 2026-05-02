<script lang="ts">
/**
 * SubmitButton.svelte — Primary submit control
 *
 * File-level:
 * Small reusable submit button with `loading` and `disabled` states.
 * Calls `onsubmit` when activated by the user.
 */
interface Props {
  disabled?: boolean;
  loading?: boolean;
  onsubmit?: () => void;
}

const {
  disabled = true as boolean,
  loading = false as boolean,
  onsubmit
}: Props = $props();

/**
 * handleClick()
 * Trigger the submit callback if the control is not disabled or loading.
 */
function handleClick() { if (!disabled && !loading) onsubmit?.(); }
</script>

<button class="btn accent" id="submit-btn" onclick={handleClick} disabled={disabled}>
  {#if loading}色彩解析中…{:else}加入画布{/if}
</button>

<style>
/* Reuse global .btn styles present in page styles; keep local fallback */
.btn{border-radius:60px;padding:12px 36px;border:none}
</style>
