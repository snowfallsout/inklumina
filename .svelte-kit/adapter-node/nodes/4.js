

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/mobile/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.DyK-0xVX.js","_app/immutable/chunks/D_iAkMpE.js","_app/immutable/chunks/D6YF6ztN.js","_app/immutable/chunks/B4Xvyas5.js"];
export const stylesheets = ["_app/immutable/assets/4.BWDwJX-t.css"];
export const fonts = [];
