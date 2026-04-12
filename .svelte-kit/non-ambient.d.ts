
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
		RouteId(): "/" | "/api" | "/api/events" | "/api/sessions" | "/api/sessions/new" | "/api/sessions/[id]" | "/api/state" | "/api/submit" | "/display" | "/display/components" | "/mobile" | "/mobile/components";
		RouteParams(): {
			"/api/sessions/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/api": { id?: string };
			"/api/events": Record<string, never>;
			"/api/sessions": { id?: string };
			"/api/sessions/new": Record<string, never>;
			"/api/sessions/[id]": { id: string };
			"/api/state": Record<string, never>;
			"/api/submit": Record<string, never>;
			"/display": Record<string, never>;
			"/display/components": Record<string, never>;
			"/mobile": Record<string, never>;
			"/mobile/components": Record<string, never>
		};
		Pathname(): "/" | "/api/events" | "/api/sessions" | "/api/sessions/new" | `/api/sessions/${string}` & {} | "/api/state" | "/api/submit" | "/display" | "/mobile";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}