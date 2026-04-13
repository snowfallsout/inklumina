<script lang="ts">
	import type { MobilePageData } from '../mobile.types';

	interface Props {
		hidden: boolean;
		title: string;
		subtitle: string;
		descriptionLines: MobilePageData['copy']['descriptionLines'];
		startButton: string;
		onStart: () => void;
	}

	let { hidden, title, subtitle, descriptionLines, startButton, onStart }: Props = $props();
</script>

<div id="s-welcome" class="screen" class:hidden={hidden}>
	<div class="title">{title}</div>
	<div class="subtitle">{subtitle}</div>
	<div class="desc">
		{descriptionLines[0]}<br />
		{descriptionLines[1]}
	</div>
	<button class="btn accent" type="button" onclick={onStart}>{startButton}</button>
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

	.btn {
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		color: #1a1a22;
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			0 4px 20px rgba(60, 70, 100, 0.1),
			inset 0 0 0 1px rgba(255, 255, 255, 0.5);
		border-radius: 60px;
		padding: 17px 52px;
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 4px;
		text-transform: uppercase;
		cursor: pointer;
		white-space: nowrap;
		transition:
			background 0.25s,
			transform 0.15s,
			opacity 0.25s,
			box-shadow 0.3s,
			color 0.3s;
	}

	.btn:active {
		transform: scale(0.96);
	}

	.btn:hover {
		background: rgba(255, 255, 255, 0.9);
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		pointer-events: none;
	}

	.btn.accent {
		background: #1a1a22;
		color: #fff;
		border-color: #1a1a22;
		font-weight: 500;
	}

	.btn.accent:hover {
		background: #2a2a35;
	}

	#s-welcome .title {
		font-size: 40px;
		font-weight: 100;
		letter-spacing: 14px;
		text-transform: uppercase;
		color: #1a1a22;
		margin-bottom: 10px;
		text-align: center;
	}

	#s-welcome .subtitle {
		font-size: 11px;
		letter-spacing: 5px;
		color: rgba(26, 26, 34, 0.5);
		text-transform: uppercase;
		margin-bottom: 72px;
		text-align: center;
	}

	#s-welcome .desc {
		font-size: 14px;
		color: rgba(26, 26, 34, 0.65);
		line-height: 1.9;
		text-align: center;
		max-width: 280px;
		margin-bottom: 60px;
	}

	@media (max-width: 390px) {
		#s-welcome .title {
			font-size: 34px;
			letter-spacing: 10px;
		}
	}
</style>
