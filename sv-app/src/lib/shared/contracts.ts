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

export type SessionCounts = Partial<Record<MbtiCode, number>>;

export interface SessionParticipantRecord {
	id: string;
	sessionId: string;
	mbti: MbtiCode;
	color: string;
	nickname: string;
	luckyPhrase?: string;
	createdAt: string;
}

export interface SessionRecord {
	id: string;
	name: string;
	createdAt: string;
	archivedAt?: string;
	counts: SessionCounts;
	total: number;
	participants?: SessionParticipantRecord[];
	lastParticipantAt?: string;
}

export interface SessionSummary {
	id: string;
	name: string;
	createdAt: string;
	total: number;
}

export interface DisplayStatePayload {
	counts?: SessionCounts;
	colors?: Record<string, string>;
	total?: number;
	session?: SessionRecord | null;
}

export interface SpawnParticlesPayload extends DisplayStatePayload {
	mbti: MbtiCode;
	color: string;
	nickname?: string;
	luckyPhrase?: string;
}

export interface SessionResetPayload {
	session: SessionRecord;
}

export interface LuckyColorPayload {
	mbti: MbtiCode;
	color: string;
	nickname?: string;
	luckyPhrase?: string;
	count?: number;
}

export interface SessionMutationResponse {
	ok: true;
	active: SessionRecord;
}

export interface DeleteSessionResponse {
	ok: true;
}

export interface SessionsOverviewResponse {
	active: SessionRecord | null;
	history: SessionSummary[];
}
