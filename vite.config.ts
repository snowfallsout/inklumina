import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import { Server as SocketIOServer } from 'socket.io';
import * as sessions from './src/lib/server/sessions.ts';
import { MBTI_COLORS, MBTI_NAMES, MBTI_LUCKY_PHRASES } from './src/lib/server/mbti.ts';
import type { MbtiCode } from './src/lib/shared/contracts.ts';

function socketIOPlugin() {
	return {
		name: 'colorfield-socket-io',
		configureServer(server: ViteDevServer) {
			if (!server.httpServer) return;
			const io = new SocketIOServer(server.httpServer, {
				cors: { origin: '*' }
			});

			io.on('connection', (socket) => {
				socket.emit('state', {
					counts: sessions.getCurrentCounts(),
					colors: MBTI_COLORS,
					total: sessions.getCurrentTotal(),
					session: sessions.getActive(),
				});

				socket.on('submit_mbti', (data: { mbti?: string }) => {
					const mbtiKey = (data.mbti ?? '').toUpperCase().trim() as MbtiCode;
					if (!MBTI_COLORS[mbtiKey]) return;

					const { counts, total } = sessions.incrementMbti(mbtiKey);

					const payload = {
						mbti: mbtiKey,
						color: MBTI_COLORS[mbtiKey],
						nickname: MBTI_NAMES[mbtiKey],
						luckyPhrase: MBTI_LUCKY_PHRASES[mbtiKey],
						count: counts[mbtiKey],
					};

					socket.emit('lucky_color', payload);
					io.emit('spawn_particles', { ...payload, counts, total, session: sessions.getActive() });

					console.log(`[+] ${mbtiKey} (${MBTI_NAMES[mbtiKey]}) joined — total: ${total}`);
				});
			});
		},
	};
}

export default defineConfig({
	plugins: [sveltekit(), socketIOPlugin()],
	build: {
		rollupOptions: {
			// @mediapipe/tasks-vision is an optional runtime import; falls back to CDN when absent
			external: ['@mediapipe/tasks-vision'],
		},
	},
});
