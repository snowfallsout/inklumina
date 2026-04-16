export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["mediapipe/blaze_face_full_range_sparse.tflite","mediapipe/face_landmarker.task","mediapipe/gesture_recognizer.task","mediapipe/hand_landmarker.task","mediapipe/hands_solution_packed_assets.data","mediapipe/hands_solution_simd_wasm_bin.wasm","mediapipe/vision_wasm_internal.js","mediapipe/vision_wasm_internal.wasm","mediapipe/vision_wasm_module_internal.js","mediapipe/vision_wasm_module_internal.wasm","mediapipe/vision_wasm_nosimd_internal.js","mediapipe/vision_wasm_nosimd_internal.wasm","robots.txt","server.js"]),
	mimeTypes: {".wasm":"application/wasm",".js":"text/javascript",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BDll3Nmo.js",app:"_app/immutable/entry/app.DcYR4jYI.js",imports:["_app/immutable/entry/start.BDll3Nmo.js","_app/immutable/chunks/VLHaPjam.js","_app/immutable/chunks/BbFoXf0W.js","_app/immutable/chunks/Tk1NZ0p8.js","_app/immutable/entry/app.DcYR4jYI.js","_app/immutable/chunks/BbFoXf0W.js","_app/immutable/chunks/DxLN9Q9A.js","_app/immutable/chunks/v_jBEYI6.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/api/sessions",
				pattern: /^\/api\/sessions\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/sessions/_server.ts.js'))
			},
			{
				id: "/api/sessions/new",
				pattern: /^\/api\/sessions\/new\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/sessions/new/_server.ts.js'))
			},
			{
				id: "/api/sessions/[id]",
				pattern: /^\/api\/sessions\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/sessions/_id_/_server.ts.js'))
			},
			{
				id: "/(app)/display",
				pattern: /^\/display\/?$/,
				params: [],
				page: { layouts: [0,2,,], errors: [1,,3,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/(app)/mobile",
				pattern: /^\/mobile\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
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
