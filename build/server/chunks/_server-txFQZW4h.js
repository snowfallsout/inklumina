import { j as json } from './index-D1hZvBrU.js';
import { c as createNewSession } from './colorfield-ChVzhFeK.js';
import 'fs';
import 'path';

async function POST({ request }) {
  const body = await request.json().catch(() => ({}));
  const session = createNewSession(body?.name || "");
  return json({ ok: true, active: session });
}

export { POST };
//# sourceMappingURL=_server-txFQZW4h.js.map
