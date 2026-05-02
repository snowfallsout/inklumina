import { Server as IOServer } from 'socket.io';
import type http from 'http';
import { MBTI_LUCKY_PHRASES, MBTI_NAMES, MBTI_ORDER, MBTI_PALETTES } from '$lib/shared/constants/mbti';
import type {
  ColorfieldClientToServerEvents,
  ColorfieldServerToClientEvents,
  DisplayStatePayload,
  LuckyColorPayload,
  SpawnParticlesPayload
} from '$lib/shared/contracts';

/**
 * attachSocket(server)
 * - Call this from your Node server entry after `svelte-kit build` when
 *   running the built app with adapter-node. The function attaches a
 *   Socket.IO server to the provided `http.Server`.
 */
export function attachSocket(server: http.Server) {
  const io = new IOServer<ColorfieldClientToServerEvents, ColorfieldServerToClientEvents>(server, { cors: { origin: '*' } });
  const counts: Record<string, number> = {};

  io.on('connection', (socket) => {
    // Example: send initial MBTI palette data to client
    socket.emit('mbti:init', { order: MBTI_ORDER, palettes: MBTI_PALETTES });
    const statePayload: DisplayStatePayload = { counts, colors: {}, total: Object.values(counts).reduce((sum, value) => sum + value, 0), session: null };
    socket.emit('state', statePayload);

    socket.on('submit_mbti', (payload) => {
      // Broadcast spawn event to all clients (include color from config when missing)
      const mbtiKey = (payload?.mbti || '').toUpperCase();
      const palette = MBTI_PALETTES[mbtiKey as keyof typeof MBTI_PALETTES];
      const color = payload?.color || (palette ? palette.mid || palette.core : '#ffffff');
      counts[mbtiKey] = (counts[mbtiKey] || 0) + 1;
      const luckyPayload: LuckyColorPayload = {
        mbti: mbtiKey,
        color,
        nickname: payload.nickname ?? MBTI_NAMES[mbtiKey as keyof typeof MBTI_NAMES] ?? null,
        luckyPhrase: MBTI_LUCKY_PHRASES[mbtiKey as keyof typeof MBTI_LUCKY_PHRASES] ?? null,
        count: counts[mbtiKey]
      };
      const spawnPayload: SpawnParticlesPayload = {
        ...luckyPayload,
        counts: { ...counts },
        total: Object.values(counts).reduce((sum, value) => sum + value, 0),
        session: null
      };
      socket.emit('lucky_color', luckyPayload);
      io.emit('spawn_particles', spawnPayload);
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
