<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { connectMobileRealtime, submitCurrentMbti } from '$lib/features/mobile/realtime';
	import {
		mobileCardGradient,
		mobileCardMetaName,
		mobileCardMetaNum,
		mobileCardMetaSub,
		mobileError,
		mobilePayload,
		mobileResultImage,
		mobileScreen,
		mobileSelection,
		mobileShowSaveHint,
		mobileState,
		mobileSubmitDisabled,
		mobileSubmitLabel
	} from '$lib/features/mobile/state';
	import type { MbtiLetter, MobilePageData } from '$lib/features/mobile/types';
	import MobileMbtiScreen from './MbtiScreen.svelte';
	import MobileResultScreen from './ResultScreen.svelte';
	import MobileWelcomeScreen from './WelcomeScreen.svelte';

	let { payload }: { payload: MobilePageData } = $props();

	let bootPhase = $state<1 | 2 | 3>(1);
	let showStartup = $state(true);

	onMount(() => {
		mobileState.hydrate(payload);
		const teardownRealtime = connectMobileRealtime();
		const timers = [
			window.setTimeout(() => (bootPhase = 2), 280),
			window.setTimeout(() => (bootPhase = 3), 620),
			window.setTimeout(() => (showStartup = false), 980)
		];

		return () => {
			timers.forEach((timer) => window.clearTimeout(timer));
			teardownRealtime();
		};
	});
</script>

<div class="mobile-stage">
	<div class="noise-overlay"></div>

	{#if showStartup}
		<div class="startup-overlay" transition:fade={{ duration: 180 }}>
			<div class="startup-card">
				<div class="startup-label">正在啟動</div>
				<div class="startup-flow" aria-label="startup progress 1 2 3">
					<span class:active={bootPhase >= 1}>1</span>
					<span class="startup-arrow">&gt;</span>
					<span class:active={bootPhase >= 2}>2</span>
					<span class="startup-arrow">&gt;</span>
					<span class:active={bootPhase >= 3}>3</span>
				</div>
			</div>
		</div>
	{/if}

	{#if $mobilePayload}
	<MobileWelcomeScreen
		hidden={$mobileScreen !== 'welcome'}
		title={$mobilePayload.copy.title}
		subtitle={$mobilePayload.copy.subtitle}
		descriptionLines={$mobilePayload.copy.descriptionLines}
		startButton={$mobilePayload.copy.startButton}
		onStart={() => mobileState.goTo('mbti')}
	/>

	<MobileMbtiScreen
		hidden={$mobileScreen !== 'mbti'}
		hTitle={$mobilePayload.copy.hTitle}
		hSub={$mobilePayload.copy.hSub}
		cardKicker={$mobilePayload.copy.cardKicker}
		cardKickerSub={$mobilePayload.copy.cardKickerSub}
		selection={$mobileSelection}
		cardGradient={$mobileCardGradient}
		cardMetaName={$mobileCardMetaName}
		cardMetaSub={$mobileCardMetaSub}
		cardMetaNum={$mobileCardMetaNum}
		submitDisabled={$mobileSubmitDisabled}
		submitLabel={$mobileSubmitLabel}
		onPick={(dimension: number, value: MbtiLetter) => mobileState.pick(dimension, value)}
		onSubmit={submitCurrentMbti}
	/>

	<MobileResultScreen hidden={$mobileScreen !== 'result'} resultImage={$mobileResultImage} saveHint={$mobileShowSaveHint ? $mobilePayload.copy.saveHint : ''} />
	{/if}

	{#if $mobileError}
		<div class="mobile-error">{$mobileError}</div>
	{/if}
</div>

<style>
	.mobile-error {
		position: fixed;
		left: 50%;
		bottom: 24px;
		transform: translateX(-50%);
		padding: 10px 16px;
		border-radius: 999px;
		background: rgba(180, 35, 24, 0.12);
		color: #8f1d14;
		font-size: 12px;
		letter-spacing: 0.4px;
		z-index: 30;
	}

	.startup-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: grid;
		place-items: center;
		pointer-events: none;
		background:
			radial-gradient(circle at center, rgba(255, 255, 255, 0.82), rgba(244, 245, 248, 0.5) 40%, rgba(244, 245, 248, 0.08) 100%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(244, 245, 248, 0.7));
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.startup-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 26px 30px 22px;
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.68);
		border: 1px solid rgba(255, 255, 255, 0.78);
		box-shadow:
			0 12px 40px rgba(30, 40, 70, 0.12),
			inset 0 0 0 1px rgba(255, 255, 255, 0.45);
		animation: startup-breathe 1.2s ease-in-out infinite alternate;
	}

	.startup-label {
		font-size: 11px;
		letter-spacing: 5px;
		text-transform: uppercase;
		color: rgba(26, 26, 34, 0.48);
	}

	.startup-flow {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 18px;
		font-weight: 700;
		letter-spacing: 2px;
		color: rgba(26, 26, 34, 0.26);
	}

	.startup-flow span {
		transition: color 0.25s ease, transform 0.25s ease, opacity 0.25s ease;
	}

	.startup-flow span.active {
		color: #1a1a22;
		transform: translateY(-1px) scale(1.08);
	}

	.startup-arrow {
		opacity: 0.35;
	}

	@keyframes startup-breathe {
		from {
			transform: translateY(0);
			opacity: 0.88;
		}
		to {
			transform: translateY(-2px);
			opacity: 1;
		}
	}
</style>