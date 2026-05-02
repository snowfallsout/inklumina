/*
 * src/lib/shared/contracts.ts
 * Purpose: Canonical socket payload and session API contracts shared by mobile, display, and server code.
 */
import type { MBTIKey, Palette } from '$lib/shared/constants/mbti';

export type SessionCounts = Record<string, number>;

export type SessionSummary = {
  id: string;
  name: string;
  createdAt: string;
  total: number;
};

export type SessionRecord = SessionSummary & {
  counts: SessionCounts;
  archivedAt?: string;
};

export type SessionsOverviewResponse = {
  active: SessionRecord | null;
  history: SessionSummary[];
};

export type SessionMutationResponse = {
  ok: boolean;
  active: SessionRecord;
};

export type DeleteSessionResponse = {
  ok: boolean;
};

export type MbtiInitPayload = {
  order: readonly MBTIKey[];
  palettes: Record<MBTIKey, Palette>;
};

export type DisplayStatePayload = {
  counts: SessionCounts | null;
  colors?: Record<string, string> | null;
  total?: number;
  session: SessionRecord | null;
};

export type SubmitMbtiPayload = {
  mbti: string;
  color?: string;
  count?: number;
  nickname?: string | null;
};

export type LuckyColorPayload = {
  mbti: string;
  color: string;
  nickname?: string | null;
  luckyPhrase?: string | null;
  count?: number;
};

export type SpawnParticlesPayload = LuckyColorPayload & {
  counts?: SessionCounts;
  total?: number;
  session?: SessionRecord | null;
};

export type SessionResetPayload = {
  session: SessionRecord;
  counts?: SessionCounts;
};

export interface ColorfieldServerToClientEvents {
  'mbti:init': (payload: MbtiInitPayload) => void;
  state: (payload: DisplayStatePayload) => void;
  spawn_particles: (payload: SpawnParticlesPayload) => void;
  session_reset: (payload: SessionResetPayload) => void;
  lucky_color: (payload: LuckyColorPayload) => void;
}

export interface ColorfieldClientToServerEvents {
  submit_mbti: (payload: SubmitMbtiPayload) => void;
}