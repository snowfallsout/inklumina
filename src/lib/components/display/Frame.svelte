<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { displayState } from '$lib/features/display/state';
	import DisplayHeader from './Header.svelte';
	import DisplayLegend from './Legend.svelte';
	import DisplayHud from './Hud.svelte';
	import DisplayFooter from './Footer.svelte';
	import DisplaySessionManager from './SessionManager.svelte';

	let bootPhase = $state<1 | 2 | 3>(1);
	let showStartup = $state(true);

	onMount(() => {
		const timers = [
			window.setTimeout(() => (bootPhase = 2), 280),
			window.setTimeout(() => (bootPhase = 3), 620),
			window.setTimeout(() => (showStartup = false), 980),
		];
		return () => timers.forEach((t) => window.clearTimeout(t));
	});
</script>

<div class="display-route">
	<div class="noise-overlay"></div>
	<div id="scene-bg"></div>

	<video id="video-bg" autoplay muted playsinline></video>
	<canvas id="canvas"></canvas>

	<div id="ui">
		<DisplayHeader />
		<DisplayLegend legend={$displayState.legend} />
		<DisplayHud />
		<DisplayFooter />
	</div>

	<!-- Detect badges live OUTSIDE #ui stacking context for crisp rendering at z-index 30 -->
	<div id="emotion-badge">{$displayState.header.emotionBadge}</div>
	<div id="hand-badge">{$displayState.header.handBadge}</div>

	<DisplaySessionManager />

	{#if showStartup}
		<div class="startup-overlay" transition:fade={{ duration: 180 }}>
			<div class="startup-card">
				<div class="startup-label">正在啟動</div>
				<div class="startup-flow" aria-label="startup progress 1 2 3">
					<span class:active={bootPhase >= 1}>1</span>
					<span class="startup-arrow">&gt;</span>
					<span class:active={bootPhase >= 2}>2</span>
					<span class="startup-arrow">&gt;</span>
					<span class:active={bootPhase >= 3}>3</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Detect badges at page-level z-index, outside #ui stacking context */
	#emotion-badge {
		position: fixed;
		top: 28px;
		left: 28px;
		color: rgba(30,40,60,0.28);
		font-size: 10px;
		letter-spacing: 2px;
		text-transform: uppercase;
		transition: color 0.5s;
		z-index: 30;
		display: inline-block;
		white-space: nowrap;
		max-width: 40vw;
		overflow: hidden;
		text-overflow: ellipsis;
		pointer-events: none;
	}

	:global(#emotion-badge.smile) { color: #B08800; }
	:global(#emotion-badge.sad) { color: #4169E1; }

	#hand-badge {
		position: fixed;
		top: 54px;
		left: 28px;
		color: rgba(30,40,60,0.28);
		font-size: 10px;
		letter-spacing: 2px;
		text-transform: uppercase;
		transition: color 0.3s;
		z-index: 30;
		pointer-events: none;
	}

	.startup-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(245, 248, 255, 0.85);
		backdrop-filter: blur(12px);
		pointer-events: none;
	}

	.startup-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		padding: 36px 52px;
		background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4));
		border: 1px solid rgba(255,255,255,0.7);
		border-radius: 24px;
		box-shadow: 0 8px 32px rgba(31,38,135,0.08);
	}

	.startup-label {
		font-size: 11px;
		letter-spacing: 4px;
		text-transform: uppercase;
		color: rgba(30,40,60,0.4);
	}

	.startup-flow {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 18px;
		font-weight: 100;
		letter-spacing: 6px;
		color: rgba(30,40,60,0.18);
	}

	.startup-flow span {
		transition: color 0.3s ease, opacity 0.3s ease;
		opacity: 0.25;
	}

	.startup-flow span.active {
		color: rgba(30,40,60,0.75);
		opacity: 1;
	}

	.startup-arrow {
		font-size: 10px;
		opacity: 0.3 !important;
		letter-spacing: 0;
	}
</style>
