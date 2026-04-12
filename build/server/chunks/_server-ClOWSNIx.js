import { e as error, j as json } from './index-D1hZvBrU.js';
import { d as deleteHistorySession, a as getHistorySession } from './colorfield-ChVzhFeK.js';
import 'fs';
import 'path';

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

export { DELETE, GET };
//# sourceMappingURL=_server-ClOWSNIx.js.map
