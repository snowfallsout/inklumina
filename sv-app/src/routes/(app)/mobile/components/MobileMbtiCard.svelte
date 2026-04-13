<script lang="ts">
	import { placeholders } from '../mobile.constants';
	import type { MbtiSelection, MobileCardGradient } from '../mobile.types';

	interface Props {
		cardKicker: string;
		cardKickerSub: string;
		selection: MbtiSelection;
		cardGradient: MobileCardGradient;
		cardMetaName: string;
		cardMetaSub: string;
		cardMetaNum: string;
	}

	let {
		cardKicker,
		cardKickerSub,
		selection,
		cardGradient,
		cardMetaName,
		cardMetaSub,
		cardMetaNum
	}: Props = $props();
</script>

<div
	class="mbti-card"
	style={`--cc0:${cardGradient.c0};--cc1:${cardGradient.c1};--cc2:${cardGradient.c2};--cc3:${cardGradient.c3}`}
>
	<div class="card-inner">
		<div class="card-top">
			<div class="card-kicker">
				{cardKicker}
				<span class="sm">{cardKickerSub}</span>
			</div>
			<div class="card-badge"></div>
		</div>

		<div class="card-letters">
			<div class="preview" id="preview">
				{#each [0, 1, 2, 3] as index (index)}
					<div class="preview-letter" class:placeholder={!selection[index]}>{selection[index] ?? placeholders[index]}</div>
				{/each}
			</div>
		</div>

		<div class="card-bottom">
			<div>
				<div class="card-name-cn">{cardMetaName}</div>
				<div class="card-name-en">{cardMetaSub}</div>
			</div>
			<div class="card-num">{cardMetaNum}</div>
		</div>
	</div>
</div>

<style>
	.mbti-card {
		width: 100%;
		max-width: 300px;
		aspect-ratio: 3 / 4;
		max-height: 38vh;
		border-radius: 20px;
		position: relative;
		overflow: hidden;
		margin-bottom: 22px;
		background: linear-gradient(180deg, var(--cc0, #e8e9ef) 0%, var(--cc1, #dcdee7) 35%, var(--cc2, #cfd2de) 70%, var(--cc3, #bec2d2) 100%);
		box-shadow:
			0 14px 40px rgba(40, 50, 80, 0.18),
			0 2px 8px rgba(40, 50, 80, 0.08),
			inset 0 0 0 1px rgba(255, 255, 255, 0.35);
		transition:
			background 1.1s ease,
			box-shadow 0.6s ease;
		will-change: background;
	}

	.mbti-card::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 40%);
	}

	.mbti-card::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.08;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
	}

	.card-inner {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 18px 22px;
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.card-kicker {
		font-size: 8px;
		font-weight: 600;
		letter-spacing: 2px;
		color: rgba(255, 255, 255, 0.95);
		text-transform: uppercase;
		line-height: 1.5;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
	}

	.card-kicker .sm {
		display: block;
		font-weight: 300;
		opacity: 0.8;
		margin-top: 1px;
	}

	.card-badge {
		width: 18px;
		height: 18px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.85);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	}

	.card-letters {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview {
		display: flex;
		gap: 2px;
		align-items: baseline;
		justify-content: center;
	}

	.preview-letter {
		font-size: 64px;
		font-weight: 900;
		letter-spacing: -1px;
		line-height: 1;
		color: rgba(255, 255, 255, 0.95);
		text-shadow: 0 2px 14px rgba(0, 0, 0, 0.18);
		transition:
			color 0.4s,
			opacity 0.4s,
			transform 0.4s;
		min-width: 42px;
		text-align: center;
		font-family: 'Inter', sans-serif;
	}

	.preview-letter.placeholder {
		color: rgba(255, 255, 255, 0.55);
		font-weight: 700;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
	}

	.card-bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.card-name-cn {
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 2px;
		color: rgba(255, 255, 255, 0.98);
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
	}

	.card-name-en {
		font-size: 10px;
		font-weight: 300;
		letter-spacing: 3px;
		color: rgba(255, 255, 255, 0.85);
		text-transform: uppercase;
		margin-top: 2px;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
	}

	.card-num {
		font-size: 22px;
		font-weight: 200;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 1px;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.18);
		font-feature-settings: 'tnum';
	}

	@media (max-width: 390px) {
		.preview-letter {
			font-size: 52px;
			min-width: 34px;
		}
	}
</style>
