import { i as getHistoryById, n as deleteHistoryById } from "../../../../../chunks/sessions.js";
import { error, json } from "@sveltejs/kit";
//#region src/routes/api/sessions/[id]/+server.ts
var GET = ({ params }) => {
	const session = getHistoryById(params.id);
	if (!session) throw error(404, "Session not found");
	return json(session);
};
var DELETE = ({ params }) => {
	if (!deleteHistoryById(params.id)) throw error(404, "Session not found");
	console.log(`[Session] Deleted: ${params.id}`);
	return json({ ok: true });
};
//#endregion
export { DELETE, GET };
