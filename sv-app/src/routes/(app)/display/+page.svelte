<script lang="ts">
	import { onMount } from 'svelte';
	import './display.css';
	import DisplayFrame from './components/DisplayFrame.svelte';
	import { displayState } from '$lib/display/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		displayState.patch(data.sample);
	});
</script>

<DisplayFrame />
