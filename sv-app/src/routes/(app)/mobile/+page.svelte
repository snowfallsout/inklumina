<svelte:head>
	<title>Colorfield Mobile</title>
</svelte:head>

<script lang="ts">
	import type { PageData } from './$types';
	import JoinExperience from '$lib/components/mobile/JoinExperience.svelte';

	let { data }: { data: PageData } = $props();
</script>

<JoinExperience payload={data.payload} />

<style>
	:global(html),
	:global(body) {
		height: 100%;
		overflow: hidden;
	}

	:global(.mobile-stage),
	:global(.mobile-stage *),
	:global(.mobile-stage *::before),
	:global(.mobile-stage *::after) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
		-webkit-font-smoothing: antialiased;
	}

	:global(.mobile-stage) {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: #f4f5f8;
		color: #1a1a22;
		font-family: 'Inter', -apple-system, sans-serif;
	}

	:global(.mobile-stage::before) {
		content: '';
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.9) 0%, rgba(244, 245, 248, 0) 60%),
			radial-gradient(ellipse 60% 40% at 10% 90%, rgba(220, 225, 240, 0.5) 0%, rgba(244, 245, 248, 0) 70%),
			radial-gradient(ellipse 60% 40% at 90% 90%, rgba(230, 220, 240, 0.45) 0%, rgba(244, 245, 248, 0) 70%);
	}

	:global(.noise-overlay) {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 3;
		opacity: 0.05;
		mix-blend-mode: multiply;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
	}
</style>
