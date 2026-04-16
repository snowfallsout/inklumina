import * as universal from '../entries/pages/_page.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/4.CSwlG0a2.js","_app/immutable/chunks/BbFoXf0W.js","_app/immutable/chunks/v_jBEYI6.js"];
export const stylesheets = ["_app/immutable/assets/4.DepZKevu.css"];
export const fonts = [];
