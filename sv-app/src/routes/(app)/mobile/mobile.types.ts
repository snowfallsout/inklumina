export type MbtiCode =
	| 'INTJ'
	| 'INTP'
	| 'ENTJ'
	| 'ENTP'
	| 'INFJ'
	| 'INFP'
	| 'ENFJ'
	| 'ENFP'
	| 'ISTJ'
	| 'ISFJ'
	| 'ESTJ'
	| 'ESFJ'
	| 'ISTP'
	| 'ISFP'
	| 'ESTP'
	| 'ESFP';

export type MbtiLetter = 'E' | 'I' | 'N' | 'S' | 'T' | 'F' | 'J' | 'P';

export type MbtiSelection = Array<MbtiLetter | null>;

export type MobileScreen = 'welcome' | 'mbti' | 'result';

export interface MobileDimensionOption {
	value: MbtiLetter;
	label: string;
}

export interface MobileDimensionRow {
	dimension: number;
	options: MobileDimensionOption[];
}

export interface LuckyColorPayload {
	mbti: MbtiCode;
	color: string;
	nickname?: string;
	luckyPhrase?: string;
}

export interface SocketLike {
	emit: (event: string, payload?: unknown) => void;
	on: (event: string, callback: (payload: unknown) => void) => void;
	off?: (event: string, callback: (payload: unknown) => void) => void;
	disconnect?: () => void;
}

export interface MobileCardGradient {
	c0: string;
	c1: string;
	c2: string;
	c3: string;
}

export interface MobilePageData {
	copy: {
		title: string;
		subtitle: string;
		descriptionLines: string[];
		startButton: string;
		hTitle: string;
		hSub: string;
		submitIdle: string;
		submitLoading: string;
		saveHint: string;
		cardKicker: string;
		cardKickerSub: string;
		resultDefaultName: string;
		resultDefaultSubtitle: string;
		resultTagline: string;
		resultSite: string;
		resultHandle: string;
	};
	mbti: {
		colors: Record<MbtiCode, string>;
		names: Record<MbtiCode, string>;
		letterColors: Record<MbtiLetter, string>;
	};
}
