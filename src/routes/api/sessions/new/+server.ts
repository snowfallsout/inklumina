import { json } from '@sveltejs/kit';
import { createNew } from '$lib/server/sessions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as { name?: string };
	const name = (body.name ?? '').trim();
	const active = createNew(name);
	console.log(`[Session] New: "${active.name}"`);
	return json({ ok: true, active });
};
