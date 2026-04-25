// @ts-nocheck
import { Server as IOServer } from 'socket.io';
import type { Plugin } from 'vite';

export default function socketIOPlugin(): Plugin {
  let io: IOServer | null = null;

  return {
    name: 'vite-plugin-socket-io',
    configureServer(server) {
      const httpServer = server.httpServer;
      if (!httpServer) return;

      // Attach Socket.IO to Vite's HTTP server in dev only
      io = new IOServer(httpServer, { cors: { origin: '*' } });

      io.on('connection', (socket) => {
        socket.emit('state', { counts: null, session: null });

        socket.on('submit_mbti', (payload) => {
          io?.emit('spawn_particles', {
            mbti: payload?.mbti,
            count: payload?.count || 6,
            nickname: payload?.nickname || null
          });
        });
      });

      // Close socket when Vite stops
      server.httpServer.on('close', () => {
        try { io?.close(); } catch (e) { /* ignore */ }
      });
    }
  };
}
