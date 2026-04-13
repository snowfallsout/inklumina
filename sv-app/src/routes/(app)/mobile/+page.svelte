<svelte:head>
	<title>Colorfield Mobile</title>
</svelte:head>

<script lang="ts">
	import type { PageData } from './$types';
	import MobileJoinExperience from './components/MobileJoinExperience.svelte';

	let { data }: { data: PageData } = $props();
</script>

<MobileJoinExperience payload={data.payload} />
