<script lang="ts">
	let { error, status } = $props<{ error: { message?: string }; status: number }>();

	const fallbackMessage = 'Display route failed to render.';
</script>

<svelte:head>
	<title>{status} | Display Error</title>
</svelte:head>

<main class="display-route-error">
	<p class="eyebrow">Display Route Error</p>
	<h1>{status}</h1>
	<p class="message">{error?.message ?? fallbackMessage}</p>
	<div class="actions">
		<a href="/display">Retry /display</a>
		<a href="/">Back to home</a>
	</div>
</main>

<style>
	.display-route-error {
		min-height: 100vh;
		display: grid;
		place-content: center;
		gap: 0.85rem;
		padding: 2rem;
		text-align: center;
		background: radial-gradient(circle at 30% 20%, #f8fbff 0%, #eef3ff 55%, #e4ebff 100%);
		color: #1f2937;
	}

	.eyebrow {
		font-size: 0.8rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(31, 41, 55, 0.55);
	}

	h1 {
		font-size: clamp(2.2rem, 8vw, 4rem);
		line-height: 1;
		margin: 0;
	}

	.message {
		max-width: 44ch;
		margin: 0 auto;
		color: rgba(31, 41, 55, 0.8);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.actions a {
		display: inline-block;
		padding: 0.6rem 1rem;
		border-radius: 999px;
		border: 1px solid rgba(99, 102, 241, 0.24);
		background: rgba(255, 255, 255, 0.72);
		text-decoration: none;
		color: #1f2937;
	}
</style>