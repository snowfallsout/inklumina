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
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-inline', 'https://cdn.jsdelivr.net'],
				'script-src-elem': ['self', 'unsafe-inline', 'https://cdn.jsdelivr.net'],
				'style-src': ['self', 'unsafe-inline'],
				'style-src-elem': ['self', 'unsafe-inline'],
				'style-src-attr': ['unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:']
			}
		},
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a different environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
