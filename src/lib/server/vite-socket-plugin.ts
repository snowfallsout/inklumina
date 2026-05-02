// @ts-nocheck
import { Server as IOServer } from 'socket.io';
import type { Plugin } from 'vite';
import { MBTI_LUCKY_PHRASES, MBTI_NAMES, MBTI_ORDER, MBTI_PALETTES } from '$lib/shared/constants/mbti';
import type {
  ColorfieldClientToServerEvents,
  ColorfieldServerToClientEvents,
  DisplayStatePayload,
  LuckyColorPayload,
  SpawnParticlesPayload
} from '$lib/shared/contracts';

export default function socketIOPlugin(): Plugin {
  let io: IOServer<ColorfieldClientToServerEvents, ColorfieldServerToClientEvents> | null = null;
  const counts: Record<string, number> = {};

  return {
    name: 'vite-plugin-socket-io',
    configureServer(server) {
      const httpServer = server.httpServer;
      if (!httpServer) return;

      // Attach Socket.IO to Vite's HTTP server in dev only
      io = new IOServer<ColorfieldClientToServerEvents, ColorfieldServerToClientEvents>(httpServer, { cors: { origin: '*' } });

      io.on('connection', (socket) => {
        socket.emit('mbti:init', { order: MBTI_ORDER, palettes: MBTI_PALETTES });
        const statePayload: DisplayStatePayload = {
          counts,
          colors: {},
          total: Object.values(counts).reduce((sum, value) => sum + value, 0),
          session: null
        };
        socket.emit('state', statePayload);

        socket.on('submit_mbti', (payload) => {
          const mbtiKey = (payload?.mbti || '').toUpperCase();
          const palette = MBTI_PALETTES[mbtiKey as keyof typeof MBTI_PALETTES];
          const color = payload?.color || (palette ? palette.mid || palette.core : '#ffffff');
          counts[mbtiKey] = (counts[mbtiKey] || 0) + 1;

          const luckyPayload: LuckyColorPayload = {
            mbti: mbtiKey,
            color,
            nickname: payload?.nickname ?? MBTI_NAMES[mbtiKey as keyof typeof MBTI_NAMES] ?? null,
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
          io?.emit('spawn_particles', spawnPayload);
        });
      });

      // Close socket when Vite stops
      server.httpServer.on('close', () => {
        try { io?.close(); } catch (e) { /* ignore */ }
      });
    }
  };
}
