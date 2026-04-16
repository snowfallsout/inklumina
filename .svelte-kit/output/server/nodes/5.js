import * as server from '../entries/pages/(app)/display/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/display/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/display/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.B4SHoSMi.js","_app/immutable/chunks/BbFoXf0W.js","_app/immutable/chunks/DxLN9Q9A.js","_app/immutable/chunks/iX0mJJEm.js","_app/immutable/chunks/v_jBEYI6.js","_app/immutable/chunks/Tk1NZ0p8.js"];
export const stylesheets = ["_app/immutable/assets/5.fO7i7saJ.css"];
export const fonts = [];
