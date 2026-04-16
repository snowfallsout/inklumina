import { o as head } from "../../chunks/dev.js";
//#region src/routes/+page.svelte
function _page($$renderer) {
	head("1uha8ag", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Colorfield Routes</title>`);
		});
	});
	$$renderer.push(`<main class="home svelte-1uha8ag"><h1 class="svelte-1uha8ag">Colorfield</h1> <p class="svelte-1uha8ag">Route-oriented SvelteKit skeleton based on official routing conventions.</p> <nav class="links svelte-1uha8ag"><a href="/display" class="svelte-1uha8ag">Open Display Page</a> <a href="/mobile" class="svelte-1uha8ag">Open Mobile Page</a></nav></main>`);
}
//#endregion
export { _page as default };
