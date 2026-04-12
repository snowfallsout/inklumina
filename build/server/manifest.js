const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.YxgDbHBK.js",app:"_app/immutable/entry/app.DzEKrfC9.js",imports:["_app/immutable/entry/start.YxgDbHBK.js","_app/immutable/chunks/D039e0LN.js","_app/immutable/chunks/D_iAkMpE.js","_app/immutable/chunks/zmMe2Arv.js","_app/immutable/entry/app.DzEKrfC9.js","_app/immutable/chunks/D_iAkMpE.js","_app/immutable/chunks/B4Xvyas5.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BW-EAngI.js')),
			__memo(() => import('./chunks/1-DHUdBMiK.js')),
			__memo(() => import('./chunks/2-QYb-FS8v.js')),
			__memo(() => import('./chunks/3-BgmXEIKP.js')),
			__memo(() => import('./chunks/4-DhU6ZCFl.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/events",
				pattern: /^\/api\/events\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BjgbjqBm.js'))
			},
			{
				id: "/api/sessions",
				pattern: /^\/api\/sessions\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BjBc69nl.js'))
			},
			{
				id: "/api/sessions/new",
				pattern: /^\/api\/sessions\/new\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-txFQZW4h.js'))
			},
			{
				id: "/api/sessions/[id]",
				pattern: /^\/api\/sessions\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ClOWSNIx.js'))
			},
			{
				id: "/api/state",
				pattern: /^\/api\/state\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-2R1KSTG9.js'))
			},
			{
				id: "/api/submit",
				pattern: /^\/api\/submit\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Cn1QFmcF.js'))
			},
			{
				id: "/display",
				pattern: /^\/display\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/mobile",
				pattern: /^\/mobile\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
