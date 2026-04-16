import * as universal from '../entries/pages/(app)/_layout.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/(app)/+layout.ts";
export const imports = ["_app/immutable/nodes/2.D7fK3rUk.js","_app/immutable/chunks/BbFoXf0W.js","_app/immutable/chunks/v_jBEYI6.js"];
export const stylesheets = [];
export const fonts = [];
