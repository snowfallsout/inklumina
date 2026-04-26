import { Server as IOServer } from 'socket.io';
import type http from 'http';
import { MBTI_ORDER, MBTI_PALETTES } from '../constants/mbti';

/**
 * attachSocket(server)
 * - Call this from your Node server entry after `svelte-kit build` when
 *   running the built app with adapter-node. The function attaches a
 *   Socket.IO server to the provided `http.Server`.
 */
export function attachSocket(server: http.Server) {
  const io = new IOServer(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    // Example: send initial MBTI palette data to client
    socket.emit('mbti:init', { order: MBTI_ORDER, palettes: MBTI_PALETTES });

    socket.on('submit_mbti', (payload) => {
      // Broadcast spawn event to all clients (include color from config when missing)
      const mbtiKey = (payload?.mbti || '').toUpperCase();
      const palette = MBTI_PALETTES[mbtiKey as keyof typeof MBTI_PALETTES];
      const color = payload?.color || (palette ? palette.mid || palette.core : '#ffffff');
      io.emit('spawn_particles', { mbti: mbtiKey, color, count: payload.count || 6, nickname: payload.nickname });
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
