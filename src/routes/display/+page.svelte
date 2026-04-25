<script lang="ts">
	import Header from '../../lib/components/display/Header.svelte';
	import Canvas from '../../lib/components/display/Canvas.svelte';
	import Legend from '../../lib/components/display/Legend.svelte';
	import SessionPanel from '../../lib/components/display/SessionPanel.svelte';
	import { panelOpen } from '../../lib/runes/session.svelte';
	import Toast from '../../lib/components/display/Toast.svelte';
	import EmotionBadge from '../../lib/components/display/EmotionBadge.svelte';
	import SmileEmoji from '../../lib/components/display/SmileEmoji.svelte';
	import HandBadge from '../../lib/components/display/HandBadge.svelte';
	import CamToggle from '../../lib/components/display/CamToggle.svelte';
	import Footer from '../../lib/components/display/Footer.svelte';
</script>

<Header />
<Canvas />

<!-- UI overlays -->
<Legend />
{#if panelOpen}
	<SessionPanel />
{/if}
<EmotionBadge />
<SmileEmoji />
<HandBadge />
<CamToggle />
<Toast />
<Footer />

<style>
	:global(body) { margin: 0; }
</style>
