<script lang="ts">
/**
 * DimRow.svelte — A row of two dimension buttons
 *
 * File-level:
 * Renders a horizontal pair of `DimButton` controls representing a
 * single MBTI dimension. Calls `onselect` with `{ dimension, value }`.
 */
import DimButton from './DimButton.svelte';
interface Props {
  dimension?: number;
  values?: { value: string; hint?: string }[];
  selected?: string | null;
  onselect?: (payload: { dimension: number; value: string }) => void;
}

const {
  dimension = 0 as number,
  values = [] as { value: string; hint?: string }[],
  selected = null as string | null,
  onselect
}: Props = $props();

/**
 * handleToggle(payload)
 * Relay a child's toggle callback up as a row-level selection.
 *
 * @param payload - Value callback from `DimButton`
 */
function handleToggle(payload: { value: string }) { onselect?.({ dimension, value: payload.value }); }
</script>

<div class="dim-row">
  {#each values as v (v.value)}
    <DimButton value={v.value} hint={v.hint} selected={selected === v.value} ontoggle={handleToggle} />
  {/each}
</div>

<style>
.dim-row{display:flex;gap:8px;margin-bottom:8px;width:100%;max-width:300px}
</style>
