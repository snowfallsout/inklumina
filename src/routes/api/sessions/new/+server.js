import { json } from '@sveltejs/kit';
import { createNewSession } from '$lib/server/colorfield.js';

export async function POST({ request }) {
  const body = await request.json().catch(() => ({}));
  const session = createNewSession(body?.name || '');
  return json({ ok: true, active: session });
}
