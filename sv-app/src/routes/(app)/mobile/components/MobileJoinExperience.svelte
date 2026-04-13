<script lang="ts">
	import { onMount } from 'svelte';
	import '../mobile.css';
	import { connectMobileRealtime, submitCurrentMbti } from '../mobile.realtime';
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
	} from '../mobile.store';
	import type { MbtiLetter, MobilePageData } from '../mobile.types';
	import MobileMbtiScreen from './MobileMbtiScreen.svelte';
	import MobileResultScreen from './MobileResultScreen.svelte';
	import MobileWelcomeScreen from './MobileWelcomeScreen.svelte';

	let { payload }: { payload: MobilePageData } = $props();

	onMount(() => {
		mobileState.hydrate(payload);
		return connectMobileRealtime();
	});
</script>

<div class="mobile-stage">
	<div class="noise-overlay"></div>

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
</style>
