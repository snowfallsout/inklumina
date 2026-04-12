import { json } from "@sveltejs/kit";
import { c as createNewSession } from "../../../../../chunks/colorfield.js";
async function POST({ request }) {
  const body = await request.json().catch(() => ({}));
  const session = createNewSession(body?.name || "");
  return json({ ok: true, active: session });
}
export {
  POST
};
