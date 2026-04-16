import * as server from '../entries/pages/(app)/mobile/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/mobile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/mobile/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.bcYtSyGU.js","_app/immutable/chunks/BbFoXf0W.js","_app/immutable/chunks/iX0mJJEm.js","_app/immutable/chunks/v_jBEYI6.js","_app/immutable/chunks/Tk1NZ0p8.js"];
export const stylesheets = ["_app/immutable/assets/6.BDlJQbW9.css"];
export const fonts = [];
