
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(app)" | "/" | "/api" | "/api/sessions" | "/api/sessions/new" | "/api/sessions/[id]" | "/(app)/display" | "/(app)/mobile";
		RouteParams(): {
			"/api/sessions/[id]": { id: string }
		};
		LayoutParams(): {
			"/(app)": Record<string, never>;
			"/": { id?: string };
			"/api": { id?: string };
			"/api/sessions": { id?: string };
			"/api/sessions/new": Record<string, never>;
			"/api/sessions/[id]": { id: string };
			"/(app)/display": Record<string, never>;
			"/(app)/mobile": Record<string, never>
		};
		Pathname(): "/" | "/api/sessions" | "/api/sessions/new" | `/api/sessions/${string}` & {} | "/display" | "/mobile";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/mediapipe/blaze_face_full_range_sparse.tflite" | "/mediapipe/face_landmarker.task" | "/mediapipe/gesture_recognizer.task" | "/mediapipe/hand_landmarker.task" | "/mediapipe/hands_solution_packed_assets.data" | "/mediapipe/hands_solution_simd_wasm_bin.wasm" | "/mediapipe/vision_wasm_internal.js" | "/mediapipe/vision_wasm_internal.wasm" | "/mediapipe/vision_wasm_module_internal.js" | "/mediapipe/vision_wasm_module_internal.wasm" | "/mediapipe/vision_wasm_nosimd_internal.js" | "/mediapipe/vision_wasm_nosimd_internal.wasm" | "/robots.txt" | "/server.js" | string & {};
	}
}