import { H as escape_html, o as head } from "../../../../chunks/dev.js";
//#region src/routes/(app)/display/+error.svelte
function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { error, status } = $$props;
		const fallbackMessage = "Display route failed to render.";
		head("178wx35", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(status)} | Display Error</title>`);
			});
		});
		$$renderer.push(`<main class="display-route-error svelte-178wx35"><p class="eyebrow svelte-178wx35">Display Route Error</p> <h1 class="svelte-178wx35">${escape_html(status)}</h1> <p class="message svelte-178wx35">${escape_html(error?.message ?? fallbackMessage)}</p> <div class="actions svelte-178wx35"><a href="/display" class="svelte-178wx35">Retry /display</a> <a href="/" class="svelte-178wx35">Back to home</a></div></main>`);
	});
}
//#endregion
export { _error as default };
