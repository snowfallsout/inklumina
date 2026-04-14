<script lang="ts">
	import { dimensions } from '$lib/features/mobile/constants';
	import type { MbtiLetter, MbtiSelection, MobileCardGradient } from '$lib/features/mobile/types';
	import MobileMbtiCard from './MbtiCard.svelte';

	interface Props {
		hidden: boolean;
		hTitle: string;
		hSub: string;
		cardKicker: string;
		cardKickerSub: string;
		selection: MbtiSelection;
		cardGradient: MobileCardGradient;
		cardMetaName: string;
		cardMetaSub: string;
		cardMetaNum: string;
		submitDisabled: boolean;
		submitLabel: string;
		onPick: (dimension: number, value: MbtiLetter) => void;
		onSubmit: () => void;
	}

	let {
		hidden,
		hTitle,
		hSub,
		cardKicker,
		cardKickerSub,
		selection,
		cardGradient,
		cardMetaName,
		cardMetaSub,
		cardMetaNum,
		submitDisabled,
		submitLabel,
		onPick,
		onSubmit
	}: Props = $props();
</script>

<div id="s-mbti" class="screen" class:hidden={hidden}>
	<div class="h-title">{hTitle}</div>
	<div class="h-sub">{hSub}</div>

	<MobileMbtiCard
		cardKicker={cardKicker}
		cardKickerSub={cardKickerSub}
		selection={selection}
		cardGradient={cardGradient}
		cardMetaName={cardMetaName}
		cardMetaSub={cardMetaSub}
		cardMetaNum={cardMetaNum}
	/>

	{#each dimensions as row (row.dimension)}
		<div class="dim-row">
			{#each row.options as option (option.value)}
				<button class="dim-btn" class:sel={selection[row.dimension] === option.value} type="button" onclick={() => onPick(row.dimension, option.value)}>
					<span class="big">{option.value}</span>
					<span class="hint">{option.label}</span>
				</button>
			{/each}
		</div>
	{/each}

	<div class="submit-row">
		<button class="btn accent" id="submit-btn" type="button" disabled={submitDisabled} onclick={onSubmit}>{submitLabel}</button>
	</div>
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

	#s-mbti {
		justify-content: flex-start;
		padding-top: 36px;
		gap: 0;
	}

	.h-title {
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 5px;
		color: rgba(26, 26, 34, 0.7);
		text-transform: uppercase;
		margin-bottom: 4px;
		text-align: center;
	}

	.h-sub {
		font-size: 11px;
		font-weight: 300;
		letter-spacing: 3px;
		color: rgba(26, 26, 34, 0.4);
		margin-bottom: 20px;
		text-align: center;
	}

	.dim-row {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
		width: 100%;
		max-width: 300px;
	}

	.dim-btn {
		flex: 1;
		padding: 0 6px;
		height: 58px;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.85);
		border-radius: 14px;
		color: #1a1a22;
		cursor: pointer;
		transition:
			background 0.22s,
			border-color 0.22s,
			transform 0.15s,
			box-shadow 0.22s,
			color 0.22s;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		box-shadow:
			0 2px 8px rgba(60, 70, 100, 0.06),
			inset 0 0 0 1px rgba(255, 255, 255, 0.4);
	}

	.dim-btn .big {
		font-size: 18px;
		font-weight: 700;
		color: #1a1a22;
		letter-spacing: 0.5px;
		line-height: 1;
	}

	.dim-btn .hint {
		font-size: 8px;
		font-weight: 400;
		letter-spacing: 1.2px;
		color: rgba(26, 26, 34, 0.55);
		text-transform: uppercase;
	}

	.dim-btn:active {
		transform: scale(0.95);
	}

	.dim-btn.sel {
		background: #1a1a22;
		border-color: #1a1a22;
		box-shadow: 0 4px 14px rgba(26, 26, 34, 0.25);
	}

	.dim-btn.sel .big {
		color: #fff;
	}

	.dim-btn.sel .hint {
		color: rgba(255, 255, 255, 0.65);
	}

	.submit-row {
		margin-top: 16px;
		width: 100%;
		max-width: 300px;
		display: flex;
		justify-content: center;
	}
</style>