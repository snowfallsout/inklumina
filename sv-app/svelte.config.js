import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self', 'https://cdn.jsdelivr.net'],
				// Relaxed for development: allow unsafe-eval for MediaPipe WASM
				'script-src': ['self', 'unsafe-inline', 'unsafe-eval', 'https://cdn.jsdelivr.net', 'wasm-unsafe-eval'],
				'script-src-elem': ['self', 'unsafe-inline', 'unsafe-eval', 'https://cdn.jsdelivr.net', 'wasm-unsafe-eval'],
				'style-src': ['self', 'unsafe-inline'],
				'style-src-elem': ['self', 'unsafe-inline'],
				'style-src-attr': ['unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:', 'http:', 'https:', 'https://cdn.jsdelivr.net'],
				'connect-src': ['self', 'ws:', 'wss:', 'http:', 'https:', 'https://cdn.jsdelivr.net'],
				'worker-src': ['self', 'blob:', 'https://cdn.jsdelivr.net'],
				'font-src': ['self', 'data:', 'https://cdn.jsdelivr.net']
			}
		},
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a different environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
