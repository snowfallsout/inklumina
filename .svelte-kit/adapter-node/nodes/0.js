

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.Cc0bQ0Sc.js","_app/immutable/chunks/D_iAkMpE.js","_app/immutable/chunks/B4Xvyas5.js"];
export const stylesheets = ["_app/immutable/assets/0.DQPQejM3.css"];
export const fonts = [];
