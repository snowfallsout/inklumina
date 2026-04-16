import { a as getHistorySummaries, r as getActive } from "../../../../chunks/sessions.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/sessions/+server.ts
var GET = () => {
	return json({
		active: getActive(),
		history: getHistorySummaries()
	});
};
//#endregion
export { GET };
