<svelte:head>
	<title>Colorfield Routes</title>
</svelte:head>

<main class="home">
	<h1>Colorfield</h1>
	<p>Route-oriented SvelteKit skeleton based on official routing conventions.</p>

	<nav class="links">
		<a href="/display">Open Display Page</a>
		<a href="/mobile">Open Mobile Page</a>
	</nav>
</main>

<style>
	.home {
		max-width: 760px;
		margin: 0 auto;
		padding: 72px 24px;
	}

	h1 {
		font-size: 2.2rem;
		margin-bottom: 0.75rem;
	}

	p {
		color: #4b5563;
		margin-bottom: 1.25rem;
	}

	.links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	a {
		display: inline-block;
		padding: 0.65rem 0.9rem;
		border-radius: 0.7rem;
		text-decoration: none;
		border: 1px solid #d1d5db;
		color: #111827;
		background: #fff;
	}

	a:hover {
		border-color: #9ca3af;
	}
</style>
