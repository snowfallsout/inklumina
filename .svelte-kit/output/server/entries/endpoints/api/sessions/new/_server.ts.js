import { t as createNew } from "../../../../../chunks/sessions.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/sessions/new/+server.ts
var POST = async ({ request }) => {
	const active = createNew(((await request.json().catch(() => ({}))).name ?? "").trim());
	console.log(`[Session] New: "${active.name}"`);
	return json({
		ok: true,
		active
	});
};
//#endregion
export { POST };
