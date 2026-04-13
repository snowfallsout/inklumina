<script lang="ts">
	interface Props {
		hidden: boolean;
		resultImage: string;
		saveHint: string;
	}

	let { hidden, resultImage, saveHint }: Props = $props();
</script>

<div id="s-result" class="screen" class:hidden={hidden}>
	{#if resultImage}
		<img id="holo-card" alt="Colorfield MBTI Card" src={resultImage} />
	{/if}
	{#if saveHint}
		<p id="save-hint">{saveHint}</p>
	{/if}
</div>

<style>
	.screen {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 32px 24px;
		z-index: 10;
		transition:
			opacity 0.5s ease,
			transform 0.5s ease;
	}

	.screen.hidden {
		opacity: 0;
		pointer-events: none;
		transform: translateY(24px);
	}

	#s-result {
		text-align: center;
		overflow: hidden;
		padding: 0;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	#holo-card {
		max-width: 100%;
		max-height: 88vh;
		border-radius: 16px;
		display: block;
		box-shadow: 0 8px 32px rgba(40, 50, 80, 0.2);
	}

	#save-hint {
		color: rgba(26, 26, 34, 0.55);
		font-size: 12px;
		letter-spacing: 2px;
		margin-top: 14px;
	}
</style>
