

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.DFwd1dAD.js","_app/immutable/chunks/BbFoXf0W.js","_app/immutable/chunks/v_jBEYI6.js"];
export const stylesheets = ["_app/immutable/assets/0.Bhf-Ih0V.css"];
export const fonts = [];
