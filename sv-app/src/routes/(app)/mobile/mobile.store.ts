import { derived, writable } from 'svelte/store';
import { computeCardGradient } from './mobile-card';
import type { MbtiCode, MbtiSelection, MobilePageData, MobileScreen } from './mobile.types';

export type MobileState = {
	payload: MobilePageData | null;
	screen: MobileScreen;
	selection: MbtiSelection;
	submitLoading: boolean;
	resultImage: string;
	showSaveHint: boolean;
	socketConnected: boolean;
	error: string;
};

const emptySelection: MbtiSelection = [null, null, null, null];

const state = writable<MobileState>({
	payload: null,
	screen: 'welcome',
	selection: emptySelection,
	submitLoading: false,
	resultImage: '',
	showSaveHint: false,
	socketConnected: false,
	error: ''
});

export const mobileState = {
	subscribe: state.subscribe,
	hydrate(payload: MobilePageData) {
		state.update((current) => ({ ...current, payload }));
	},
	goTo(screen: MobileScreen) {
		state.update((current) => ({ ...current, screen }));
	},
	pick(dimension: number, value: MbtiSelection[number]) {
		state.update((current) => ({
			...current,
			selection: current.selection.map((entry, index) => (index === dimension ? value : entry)) as MbtiSelection
		}));
	},
	startSubmit() {
		state.update((current) => ({ ...current, submitLoading: true, error: '' }));
	},
	finishSubmit(resultImage: string) {
		state.update((current) => ({
			...current,
			submitLoading: false,
			resultImage,
			showSaveHint: true,
			screen: 'result'
		}));
	},
	failSubmit(message: string) {
		state.update((current) => ({ ...current, submitLoading: false, error: message }));
	},
	setSocketConnected(socketConnected: boolean) {
		state.update((current) => ({ ...current, socketConnected }));
	},
	reset() {
		state.set({
			payload: null,
			screen: 'welcome',
			selection: emptySelection,
			submitLoading: false,
			resultImage: '',
			showSaveHint: false,
			socketConnected: false,
			error: ''
		});
	}
};

export const mobilePayload = derived(mobileState, ($state) => $state.payload);
export const mobileScreen = derived(mobileState, ($state) => $state.screen);
export const mobileSelection = derived(mobileState, ($state) => $state.selection);
export const mobileSubmitLoading = derived(mobileState, ($state) => $state.submitLoading);
export const mobileResultImage = derived(mobileState, ($state) => $state.resultImage);
export const mobileShowSaveHint = derived(mobileState, ($state) => $state.showSaveHint);
export const mobileError = derived(mobileState, ($state) => $state.error);

export const mobileSelectedMbti = derived(mobileState, ($state) =>
	$state.selection.every(Boolean) ? ($state.selection.join('') as MbtiCode) : null
);
export const mobileSelectionCount = derived(mobileState, ($state) => $state.selection.filter(Boolean).length);
export const mobileSelectionCode = derived(mobileState, ($state) => $state.selection.filter(Boolean).join(''));
export const mobileSubmitDisabled = derived(
	[mobileSelectedMbti, mobileSubmitLoading],
	([$mobileSelectedMbti, $mobileSubmitLoading]) => !$mobileSelectedMbti || $mobileSubmitLoading
);
export const mobileSubmitLabel = derived(
	[mobilePayload, mobileSubmitLoading],
	([$mobilePayload, $mobileSubmitLoading]) => {
		if (!$mobilePayload) return '';
		return $mobileSubmitLoading ? $mobilePayload.copy.submitLoading : $mobilePayload.copy.submitIdle;
	}
);
export const mobileCardMetaName = derived(
	[mobilePayload, mobileSelectedMbti, mobileSelectionCode],
	([$mobilePayload, $mobileSelectedMbti, $mobileSelectionCode]) => {
		if (!$mobilePayload) return '';
		return $mobileSelectedMbti
			? $mobilePayload.mbti.names[$mobileSelectedMbti]
			: $mobileSelectionCode || $mobilePayload.copy.resultDefaultName;
	}
);
export const mobileCardMetaSub = derived(
	[mobilePayload, mobileSelectedMbti, mobileSelectionCount],
	([$mobilePayload, $mobileSelectedMbti, $mobileSelectionCount]) => {
		if (!$mobilePayload) return '';
		return $mobileSelectedMbti
			? $mobileSelectedMbti
			: $mobileSelectionCount > 0
				? `${$mobileSelectionCount}/4`
				: $mobilePayload.copy.resultDefaultSubtitle;
	}
);
export const mobileCardMetaNum = derived(
	[mobilePayload, mobileSelectedMbti, mobileSelectionCode],
	([$mobilePayload, $mobileSelectedMbti, $mobileSelectionCode]) => {
		if (!$mobilePayload) return '';
		return ($mobileSelectedMbti || $mobileSelectionCode) || $mobilePayload.copy.resultDefaultName;
	}
);
export const mobileCardGradient = derived(
	[mobilePayload, mobileSelection, mobileSelectedMbti],
	([$mobilePayload, $mobileSelection, $mobileSelectedMbti]) =>
		$mobilePayload ? computeCardGradient($mobileSelection, $mobileSelectedMbti, $mobilePayload) : { c0: '#eceef5', c1: '#dcdee7', c2: '#cfd2de', c3: '#bec2d2' }
);
