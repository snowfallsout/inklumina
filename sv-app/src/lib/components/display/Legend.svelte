<script lang="ts">
  import { displayLegendRows, displayState } from '$lib/features/display/state';
  import type { DisplaySampleData } from '$lib/features/display/types';

  let { legend = undefined }: { legend?: DisplaySampleData['legend'] } = $props();
</script>

<div id="legend">
  <h3>{legend?.title ?? $displayState.legend.title}</h3>
  <div id="legend-rows">
    {#each $displayLegendRows as row (row.label)}
      <div class="row">
        <div class="dot" style={`background:${row.color};--c:${row.color}`}></div>
        <span class="lbl">{row.label}</span>
        <div class="track">
          <div class="fill" style={`background:${row.color};width:${row.fillPercent}%`}></div>
        </div>
        <span class="cnt">{row.count}</span>
      </div>
    {/each}
  </div>
</div>

<style>
	#legend-rows {
		display: block;
	}
</style>
