import { e as error, j as json } from './index-D1hZvBrU.js';
import { b as submitMbti } from './colorfield-ChVzhFeK.js';
import 'fs';
import 'path';

async function POST({ request }) {
  const body = await request.json().catch(() => ({}));
  const payload = submitMbti(body?.mbti || "");
  if (!payload) throw error(400, "Invalid MBTI");
  return json({ ok: true, ...payload });
}

export { POST };
//# sourceMappingURL=_server-Cn1QFmcF.js.map
