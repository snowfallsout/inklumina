import { error, json } from "@sveltejs/kit";
import { d as deleteHistorySession, a as getHistorySession } from "../../../../../chunks/colorfield.js";
function GET({ params }) {
  const session = getHistorySession(params.id);
  if (!session) throw error(404, "Session not found");
  return json(session);
}
function DELETE({ params }) {
  const ok = deleteHistorySession(params.id);
  if (!ok) throw error(404, "Session not found");
  return json({ ok: true });
}
export {
  DELETE,
  GET
};
