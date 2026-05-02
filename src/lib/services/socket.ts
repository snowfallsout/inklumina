import { browser } from '$app/environment';
import { updateCounts } from '$lib/state/mbti.svelte';
import { MBTI_PALETTES } from '$lib/shared/constants/mbti';
import { setSessionName } from '$lib/state/session.svelte';
import { pushSpawn } from '$lib/state/particles.svelte';
import { setWaitingVisible, showToast } from '$lib/state/ui.svelte';
import { createColorfieldSocket, type ColorfieldSocket } from '$lib/shared/socket-client';
import type {
  ColorfieldClientToServerEvents,
  ColorfieldServerToClientEvents,
  DisplayStatePayload,
  SessionResetPayload,
  SpawnParticlesPayload
} from '$lib/shared/contracts';

let socket: ColorfieldSocket | null = null;

function totalFromCounts(counts: Record<string, number> | null | undefined) {
  return Object.values(counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function safeEmit<EventName extends keyof ColorfieldClientToServerEvents>(
  event: EventName,
  payload: Parameters<ColorfieldClientToServerEvents[EventName]>[0]
) {
  if (!socket) return;
  try {
    (socket.emit as (eventName: EventName, eventPayload: Parameters<ColorfieldClientToServerEvents[EventName]>[0]) => void)(event, payload);
  } catch (e) { /* ignore */ }
}

export async function connect(opts?: { url?: string }) {
  if (!browser) return;
  if (socket) return;
  // determine socket URL priority:
  // 1. explicit opts.url
  // 2. undefined -> connect to same origin
  const url = opts?.url ?? undefined;

  try {
    socket = createColorfieldSocket(url);
  } catch (e) {
    console.warn('socket.io client not available:', e);
    showToast('Socket unavailable', '#ff4444');
    return;
  }

  socket.on('connect', () => showToast('Socket connected', '#4caf50'));
  socket.on('connect_error', () => showToast('Socket connect error', '#ff6b6b'));
  socket.on('disconnect', () => showToast('Socket disconnected', '#ffb86b'));

  socket.on('state', (data: DisplayStatePayload) => {
    if (data && data.counts) updateCounts(data.counts);
    if (data && data.session) setSessionName(data.session.name || null);
    const total = data?.total ?? totalFromCounts(data?.counts);
    setWaitingVisible(!(total > 0));
  });

  socket.on('spawn_particles', (data: SpawnParticlesPayload) => {
    try {
      // Push to spawnQueue; DisplayCanvas will consume it
      const mbtiKey = (data?.mbti || '').toUpperCase();
      const palette = MBTI_PALETTES[mbtiKey as keyof typeof MBTI_PALETTES];
      const color = data.color ?? (palette ? palette.mid || palette.core : undefined);
      const nickname = data.nickname ?? undefined;
      pushSpawn({ mbti: mbtiKey, color, nickname, counts: data.counts, total: data.total });
      if (data.counts) updateCounts(data.counts);
      setWaitingVisible(false);
      if (data.total !== undefined) {
        // no-op here; UI can derive total from mbtiCounts
      }
      showToast(`✦ ${data.mbti} ${data.nickname || ''} joined`, data.color || '#ffffff');
    } catch (e) { /* swallow */ }
  });

  socket.on('session_reset', (data: SessionResetPayload) => {
    // reset counts and notify
    if (data && data.counts) updateCounts(data.counts);
    if (data && data.session) setSessionName(data.session.name || null);
    setWaitingVisible(true);
    showToast('✦ 新场次已开始', '#ffffff');
  });
}

export function emit<EventName extends keyof ColorfieldClientToServerEvents>(
  event: EventName,
  payload: Parameters<ColorfieldClientToServerEvents[EventName]>[0]
) {
  safeEmit(event, payload);
}

export function disconnect() {
  if (socket) { socket.disconnect(); socket = null; }
}

// Allow consumers to register custom event handlers
export function on<EventName extends keyof ColorfieldServerToClientEvents>(
  event: EventName,
  cb: ColorfieldServerToClientEvents[EventName]
) {
  if (!socket) return;
  try {
    (socket.on as (eventName: EventName, listener: ColorfieldServerToClientEvents[EventName]) => void)(event, cb);
  } catch (e) { /* ignore */ }
}
