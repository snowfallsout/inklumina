import type { Mbti } from './constants';

export interface SessionRecord {
  id: string;
  name: string;
  createdAt: string;
  counts: Partial<Record<Mbti, number>>;
  total: number;
  archivedAt?: string;
}

export interface SessionFile {
  active: SessionRecord | null;
  history: SessionRecord[];
}

export interface SessionStatePayload {
  counts: Partial<Record<Mbti, number>>;
  colors: Record<Mbti, string>;
  total: number;
  session: SessionRecord | null;
}

export interface LuckyColorPayload {
  mbti: Mbti;
  color: string;
  nickname: string;
  luckyPhrase: string;
  count: number;
}

export interface SpawnParticlesPayload extends LuckyColorPayload {
  counts: Partial<Record<Mbti, number>>;
  total: number;
}

export interface SubmitMbtiPayload {
  mbti?: string;
}

export interface SessionResetPayload {
  session: SessionRecord;
}
